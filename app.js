// =========================================================
// zdroje-biblatex — ovládání stránky (formulář, dohledání, moje zdroje)
// Logika záznamu je v bib.js.
// =========================================================
import { TYPES, FIELDS, typeById, fieldLabel, buildEntry,
         fromCrossref, fromGoogleBooks, fromOpenLibrary } from './bib.js';

const $ = id => document.getElementById(id);
const STORE = 'zdroje-biblatex:moje';
const today = () => new Date().toISOString().slice(0, 10);

// --- localStorage může chybět (soukromé okno) → vše v try/catch ---
function loadMine() { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; } }
function saveMine(list) { try { localStorage.setItem(STORE, JSON.stringify(list)); } catch { /* nic */ } }

let mine = loadMine();
let current = { type: 'book', values: {} };

// ---------- výběr druhu zdroje ----------
const sel = $('type');
for (const t of TYPES) sel.add(new Option(t.label, t.id));
sel.addEventListener('change', () => { current.type = sel.value; renderFields(); update(); });

// ---------- pole formuláře ----------
function renderFields() {
  const t = typeById(current.type);
  sel.value = t.id;
  $('type-hint').textContent = t.hint || '';
  $('type-hint').classList.toggle('ai', t.id === 'ai');
  const form = $('fields');
  form.innerHTML = '';
  const v = current.values;
  for (const [f, val] of Object.entries(t.defaults || {})) if (v[f] === undefined) v[f] = val;
  if (t.fields.includes('urldate') && !v.urldate) v.urldate = today();

  for (const f of t.fields) {
    const def = FIELDS[f];
    const req = t.req.includes(f);
    const wrap = document.createElement('div');
    wrap.className = 'field' + (def.kind === 'names' ? ' names' : '');
    const label = fieldLabel(t, f) + (req ? ' *' : '');

    if (def.kind === 'names') {
      wrap.innerHTML = `<span class="label">${label}</span>`;
      let list = v[f];
      if (typeof list === 'string') list = v[f] = [{ last: list, first: '', inst: true }];
      if (!Array.isArray(list) || !list.length) list = v[f] = [{ last: '', first: '', inst: !!t.institutionAuthor }];
      list.forEach((n, i) => wrap.appendChild(nameRow(f, n, i)));
      const add = button('+ další', 'secondary small', () => { v[f].push({ last: '', first: '', inst: false }); renderFields(); update(); });
      wrap.appendChild(add);
    } else {
      const l = document.createElement('label');
      l.textContent = label;
      let input;
      const choices = t.choices && t.choices[f];
      if (choices) {
        input = document.createElement('input');
        input.setAttribute('list', 'dl-' + f);
        const dl = document.createElement('datalist');
        dl.id = 'dl-' + f;
        for (const c of choices) dl.appendChild(new Option(c || '(nic)', c));
        l.appendChild(dl);
        if (v[f] === undefined) v[f] = choices[0];
      } else {
        input = document.createElement('input');
        input.type = def.type === 'number' ? 'text' : (def.type || 'text');
        if (def.type === 'number') input.inputMode = 'numeric';
      }
      input.name = f;
      input.value = v[f] ?? '';
      input.addEventListener('input', () => { v[f] = input.value; update(); });
      l.appendChild(input);
      wrap.appendChild(l);
      if (def.hint) { const h = document.createElement('small'); h.textContent = def.hint; wrap.appendChild(h); }
    }
    form.appendChild(wrap);
  }
  if (t.fixed) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'Doplní se samo: ' + Object.entries(t.fixed).map(([k, x]) => `${k} = ${x}`).join(', ');
    form.appendChild(p);
  }
}

function nameRow(f, n, i) {
  const row = document.createElement('div');
  row.className = 'name-row';
  const last = input(n.inst ? 'Název instituce / firmy' : 'Příjmení', n.last, x => { n.last = x; update(); });
  const first = input('Jméno', n.first, x => { n.first = x; update(); });
  first.hidden = !!n.inst;
  const inst = document.createElement('label');
  inst.className = 'check';
  const cb = document.createElement('input');
  cb.type = 'checkbox'; cb.checked = !!n.inst;
  cb.addEventListener('change', () => { n.inst = cb.checked; renderFields(); update(); });
  inst.append(cb, ' instituce');
  row.append(last, first, inst);
  if (current.values[f].length > 1)
    row.appendChild(button('×', 'secondary small', () => { current.values[f].splice(i, 1); renderFields(); update(); }, 'Odebrat'));
  return row;
}

function input(ph, val, on) {
  const el = document.createElement('input');
  el.placeholder = ph; el.setAttribute('aria-label', ph); el.value = val || '';
  el.addEventListener('input', () => on(el.value));
  return el;
}
function button(text, cls, on, title) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = cls; b.textContent = text;
  if (title) b.title = title;
  b.addEventListener('click', on);
  return b;
}

// ---------- výstup ----------
let lastEntry = null;
function update() {
  const r = buildEntry(current.type, current.values, mine.map(m => m.key));
  lastEntry = r;
  $('out').textContent = r.text;
  const ul = $('problems');
  ul.innerHTML = '';
  for (const p of r.problems) {
    const li = document.createElement('li');
    li.className = p.level === 'chyba' ? 'err' : 'warn';
    li.textContent = p.msg;
    ul.appendChild(li);
  }
  $('cite').textContent = `\\parencite{${r.key}}      % odkaz v závorce\n` +
                          `\\parencite[s.~45]{${r.key}} % se stránkou\n` +
                          `\\footcite{${r.key}}         % v poznámce pod čarou`;
}

async function copy(text, msgEl, ok) {
  try { await navigator.clipboard.writeText(text); flash(msgEl, ok); }
  catch { flash(msgEl, 'Kopírování se nepovedlo — označte text a stiskněte Ctrl+C.'); }
}
function flash(el, text) { el.textContent = text; clearTimeout(el._t); el._t = setTimeout(() => { el.textContent = ''; }, 4000); }

$('copy').addEventListener('click', () => {
  const bad = lastEntry.problems.some(p => p.level === 'chyba');
  copy(lastEntry.text, $('copy-msg'), bad ? 'Zkopírováno, ale chybí povinné údaje (viz nahoře).' : 'Zkopírováno. Vložte na konec Bibliografie.bib.');
});
$('save').addEventListener('click', () => {
  if (lastEntry.problems.some(p => p.level === 'chyba')) { flash($('copy-msg'), 'Nejdřív doplňte povinná pole.'); return; }
  mine.push({ key: lastEntry.key, text: lastEntry.text, type: current.type, values: structuredClone(current.values) });
  saveMine(mine); renderMine();
  flash($('copy-msg'), `Přidáno do mých zdrojů jako ${lastEntry.key}.`);
  update();
});
$('clear').addEventListener('click', () => { current.values = {}; renderFields(); update(); });

// ---------- moje zdroje ----------
function renderMine() {
  const ol = $('mine');
  ol.innerHTML = '';
  $('count').textContent = mine.length ? `(${mine.length})` : '';
  mine.forEach((m, i) => {
    const li = document.createElement('li');
    const code = document.createElement('code');
    code.textContent = m.key;
    const title = document.createElement('span');
    title.textContent = ' ' + (m.values.title || '') + ' ';
    li.append(code, title,
      button('upravit', 'secondary small', () => {
        current = { type: m.type, values: structuredClone(m.values) };
        mine.splice(i, 1); saveMine(mine); renderMine(); renderFields(); update();
        $('h-zdroj').scrollIntoView({ behavior: 'smooth' });
      }),
      button('kopírovat', 'secondary small', () => copy(m.text, $('copy-msg'), `Zkopírováno: ${m.key}`)),
      button('×', 'danger small', () => { mine.splice(i, 1); saveMine(mine); renderMine(); update(); }, 'Smazat'));
    ol.appendChild(li);
  });
}
const allText = () => mine.map(m => m.text).join('\n\n') + '\n';
$('download').addEventListener('click', () => {
  if (!mine.length) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([allText()], { type: 'text/plain;charset=utf-8' }));
  a.download = 'Bibliografie.bib';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('copy-all').addEventListener('click', () => mine.length && copy(allText(), $('copy-msg'), `Zkopírováno ${mine.length} záznamů.`));
$('delete-all').addEventListener('click', () => {
  if (mine.length && confirm('Opravdu smazat všechny uložené zdroje?')) { mine = []; saveMine(mine); renderMine(); update(); }
});

// ---------- dohledání podle DOI / ISBN ----------
$('lookup').addEventListener('submit', async e => {
  e.preventDefault();
  const raw = $('lookup-id').value.trim();
  const msg = $('lookup-msg');
  if (!raw) return;
  msg.textContent = 'Hledám…';
  try {
    let r;
    const doi = raw.replace(/^https?:\/\/(dx\.)?doi\.org\//, '').replace(/^doi:\s*/i, '');
    if (/^10\.\d{4,}\//.test(doi)) {
      const res = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi));
      if (!res.ok) throw new Error('DOI v databázi Crossref nenalezeno.');
      r = fromCrossref((await res.json()).message);
    } else {
      const isbn = raw.replace(/[^0-9Xx]/g, '');
      if (![10, 13].includes(isbn.length)) throw new Error('Nevypadá to jako DOI (10.…/…) ani ISBN (10 nebo 13 číslic).');
      r = await lookupIsbn(isbn, raw);
    }
    current = { type: r.type, values: r.values };
    renderFields(); update();
    msg.textContent = 'Nalezeno. Údaje zkontrolujte a doplňte chybějící (např. místo vydání).';
  } catch (err) {
    msg.textContent = err.message + ' Vyplňte údaje ručně.';
  }
});

async function lookupIsbn(isbn, raw) {
  try {
    const res = await fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn);
    const data = await res.json();
    if (data.items && data.items.length) return fromGoogleBooks(data.items[0].volumeInfo, raw);
  } catch { /* zkusíme Open Library */ }
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
  const data = await res.json();
  const b = data['ISBN:' + isbn];
  if (!b) throw new Error('ISBN se nepodařilo dohledat (české knihy často chybí).');
  return fromOpenLibrary(b, raw);
}

// ---------- start ----------
renderFields();
update();
renderMine();
