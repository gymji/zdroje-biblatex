// =========================================================
// zdroje-biblatex — ovládání stránky (formulář, dohledání, moje zdroje)
// Logika záznamu je v bib.js.
// =========================================================
import { TYPES, FIELDS, typeById, fieldLabel, buildEntry,
         fromCrossref, fromGoogleBooks, fromOpenLibrary, fromCitoid, fromCPK, parseBib, decodeBib, toForm, plainTeX } from './bib.js?v=20261123h';
import { PRIKLADY } from './priklady.js?v=20261123h';

const $ = id => document.getElementById(id);
const STORE = 'zdroje-biblatex:moje';
const HEAD = STORE + ':hlavicka';       // @string/@preamble z nahraného .bib
const today = () => new Date().toISOString().slice(0, 10);

// --- localStorage může chybět (soukromé okno) → vše v try/catch ---
function load(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch { return []; } }
function save(k, x) { try { localStorage.setItem(k, JSON.stringify(x)); } catch { /* nic */ } }
const saveMine = () => { save(STORE, mine); save(HEAD, head); };

let mine = load(STORE), head = load(HEAD);
// key = vlastní klíč a extra = další pole jen u zdroje z nahraného .bib
let current = { type: 'book', values: {} };
let editIndex = null;                   // který z mých zdrojů se právě upravuje
const plural = (n, a, b, c) => `${n} ${n === 1 ? a : n >= 2 && n <= 4 ? b : c}`;

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
  const extra = Object.keys(current.extra || {});
  if (extra.length) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'Další pole ze souboru se zachovají beze změny: ' + extra.join(', ');
    form.appendChild(p);
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
// Nevyplněná povinná pole: nejdřív jen šedý přehled, červeně až po pokusu o kopírování/uložení.
let strict = false;
const others = i => mine.filter((m, j) => j !== i).map(m => m.key);
function update() {
  const r = buildEntry(current.type, current.values, others(editIndex), { key: current.key, extra: current.extra });
  lastEntry = r;
  $('save').textContent = editIndex === null ? 'Přidat do mých zdrojů' : 'Uložit změny';
  $('out').textContent = r.text;
  const ul = $('problems');
  ul.innerHTML = '';
  const li = (cls, text) => {
    const el = document.createElement('li');
    el.className = cls; el.textContent = text;
    ul.appendChild(el);
  };
  const t = typeById(current.type);
  const missing = r.problems.filter(p => p.field).map(p => fieldLabel(t, p.field));
  if (missing.length)
    li(strict ? 'err' : 'info', (strict ? 'Chybí povinné údaje: ' : 'Povinné údaje (*): ') + missing.join(', ') + '.');
  for (const p of r.problems) if (!p.field) li(p.level === 'chyba' ? 'err' : 'warn', p.msg);
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
  if (bad) { strict = true; update(); }
  copy(lastEntry.text, $('copy-msg'), bad ? 'Zkopírováno, ale chybí povinné údaje (viz nahoře).' : 'Zkopírováno. Vložte na konec Bibliografie.bib.');
});
$('save').addEventListener('click', () => {
  if (lastEntry.problems.some(p => p.level === 'chyba')) {
    strict = true; update();
    flash($('copy-msg'), 'Nejdřív doplňte povinné údaje (viz nahoře).');
    return;
  }
  const item = { key: lastEntry.key, text: lastEntry.text, type: current.type, values: structuredClone(current.values) };
  if (current.key) Object.assign(item, { own: true, extra: current.extra });
  if (editIndex === null) mine.push(item); else mine[editIndex] = item;
  flash($('copy-msg'), editIndex === null ? `Přidáno do mých zdrojů jako ${item.key}.` : `Změny uloženy (${item.key}).`);
  $('mine-msg').textContent = '';
  saveMine(); clearForm();             // prázdný formulář → druhé kliknutí nepřidá duplikát
});
function clearForm() { current = { type: current.type, values: {} }; editIndex = null; strict = false; renderMine(); renderFields(); update(); }
$('clear').addEventListener('click', clearForm);

// ---------- moje zdroje ----------
function renderMine() {
  const tbody = $('mine');
  tbody.innerHTML = '';
  $('mine-table').hidden = !mine.length;
  $('count').textContent = mine.length ? `(${mine.length})` : '';
  // buňka tabulky; dlouhý text se zkrátí (CSS), celý je v title
  const cell = (cls, text, el = 'span') => {
    const td = document.createElement('td');
    td.className = cls;
    if (text !== undefined) {
      const x = document.createElement(el);
      x.textContent = text;
      td.title = text;
      td.appendChild(x);
    }
    return td;
  };
  mine.forEach((m, i) => {
    const tr = document.createElement('tr');
    if (i === editIndex) tr.className = 'editing';
    const v = m.values, authors = (v.author || []).filter(n => (n.last || '').trim());
    const r = buildEntry(m.type, m.values, others(i), { key: m.key, extra: m.extra });
    // stav: stejná kontrola jako ve formuláři (nahraným zdrojům může něco chybět)
    const err = r.problems.filter(p => p.level === 'chyba').length, warn = r.problems.length - err;
    const stav = cell('c-stav', err ? plural(err, 'chyba', 'chyby', 'chyb') : warn ? `${warn} upozornění` : '');
    stav.firstChild.className = 'stav ' + (err ? 'err' : warn ? 'warn' : 'ok');
    stav.title = r.problems.map(p => p.msg).join('\n');
    const akce = cell('c-akce');
    tr.append(
      cell('c-n', `${i + 1}.`),
      cell('c-klic', m.key, 'code'),
      cell('c-autor', authors.length ? plainTeX(authors[0].last) + (authors.length > 1 ? ' a kol.' : '') : ''),
      cell('c-rok', v.year || (v.date || '').slice(0, 4)),
      cell('c-nazev', plainTeX(v.title || '')),
      cell('c-druh', typeById(m.type).label.split(/ \(|,/)[0]),
      stav, akce);
    akce.append(
      button('upravit', 'secondary small', () => {
        current = { type: m.type, values: structuredClone(m.values), key: m.own ? m.key : undefined, extra: m.extra };
        editIndex = i; strict = true; renderMine(); renderFields(); update();
        $('h-zdroj').scrollIntoView({ behavior: 'smooth' });
      }),
      button('kopírovat', 'secondary small', () => copy(m.text, $('copy-msg'), `Zkopírováno: ${m.key}`)),
      button('×', 'danger small', () => {
        mine.splice(i, 1);
        if (editIndex === i) editIndex = null; else if (editIndex > i) editIndex--;
        saveMine(); renderMine(); update();
      }, 'Smazat'));
    tbody.appendChild(tr);
  });
}
const allText = () => head.concat(mine.map(m => m.text)).join('\n\n') + '\n';
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
  if (mine.length && confirm('Opravdu smazat všechny uložené zdroje?')) {
    mine = []; head = []; editIndex = null; saveMine(); renderMine(); update(); $('mine-msg').textContent = '';
  }
});

// ---------- nahrání vlastního .bib ----------
$('upload').addEventListener('click', () => $('upload-file').click());
$('upload-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const p = parseBib(decodeBib(await file.arrayBuffer()));
  let added = 0, same = 0;
  for (const en of p.entries) {
    if (mine.some(m => m.text === en.source)) { same++; continue; }
    const f = toForm(en);
    if (f.key) mine.push({ key: f.key, text: en.source, type: f.type, values: f.values, extra: f.extra, own: true });
    else {                              // záznam bez klíče → klíč vytvoříme a záznam sestavíme znovu
      const r = buildEntry(f.type, f.values, mine.map(m => m.key), { extra: f.extra });
      mine.push({ key: r.key, text: r.text, type: f.type, values: f.values, extra: f.extra });
    }
    added++;
  }
  for (const h of p.head) if (!head.includes(h)) head.push(h);
  saveMine(); renderMine(); update();
  const bad = mine.filter((m, i) => buildEntry(m.type, m.values, others(i), { key: m.key, extra: m.extra })
                                      .problems.some(x => x.level === 'chyba')).length;
  $('mine-msg').textContent =
    (p.entries.length ? `Ze souboru ${file.name}: přidáno ${plural(added, 'zdroj', 'zdroje', 'zdrojů')}` +
       (same ? `, ${same} už v seznamu bylo` : '') + '. '
     : `V souboru ${file.name} není žádný záznam (@book{…}, @article{…} …). `) +
    (bad ? `Chyby má ${plural(bad, 'zdroj', 'zdroje', 'zdrojů')} — klikněte na „upravit“ a doplňte údaje. ` : '') +
    (p.skipped ? 'Pomocný záznam biblatexu (biblatex-control) vynechán — vytváří se sám při překladu. ' : '') +
    p.errors.join(' ');
});

// ---------- dohledání podle DOI / ISBN / adresy ----------
const get = (url, ms = 8000, headers = {}) => fetch(url, { headers, signal: AbortSignal.timeout(ms) });
// Wikimedia Citoid: stáhne stránku a rozebere ji převodníky Zotera (stejně jako citace na Wikipedii)
async function citoid(q) {
  const res = await get('https://en.wikipedia.org/api/rest_v1/data/citation/mediawiki/' + encodeURIComponent(q), 15000,
    { 'Api-User-Agent': 'zdroje-biblatex (https://github.com/gymji/zdroje-biblatex)' });
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) && data[0] ? data[0] : null;
}
$('lookup').addEventListener('submit', async e => {
  e.preventDefault();
  const raw = $('lookup-id').value.trim();
  const msg = $('lookup-msg');
  if (!raw) return;
  msg.textContent = 'Hledám…';
  try {
    let r, web = false;
    const doi = raw.replace(/^https?:\/\/(dx\.)?doi\.org\//, '').replace(/^doi:\s*/i, '');
    if (/^10\.\d{4,}\//.test(doi)) {
      const res = await get('https://api.crossref.org/works/' + encodeURIComponent(doi));
      if (!res.ok) throw new Error('DOI v databázi Crossref nenalezeno.');
      r = fromCrossref((await res.json()).message);
    } else if (/^(https?:\/\/|www\.)/i.test(raw)) {
      const url = /^www\./i.test(raw) ? 'https://' + raw : raw;
      msg.textContent = 'Hledám… (u webové stránky to může trvat i několik sekund)';
      let plain = url;                  // Citoid pozná heslo Wikipedie jen s diakritikou, ne s %C3%AD
      try { plain = decodeURI(url); } catch { /* ponechat */ }
      const z = await citoid(plain);
      if (!z) throw new Error('Ze stránky se nepodařilo zjistit údaje (nejde načíst, je za přihlášením, nebo to není jeden zdroj, ale např. výsledky hledání).');
      r = fromCitoid(z, url, today());
      web = true;
    } else {
      const isbn = raw.replace(/[^0-9Xx]/g, '');
      if (![10, 13].includes(isbn.length)) throw new Error('Nevypadá to jako DOI (10.…/…), ISBN (10 nebo 13 číslic) ani adresa (https://…).');
      r = await lookupIsbn(isbn, raw);
    }
    current = { ...current, type: r.type, values: r.values };
    renderFields(); update();
    msg.textContent = web ? 'Nalezeno. U webové stránky údaje vždy zkontrolujte — hlavně druh zdroje, autora, název a datum.'
                          : 'Nalezeno. Údaje zkontrolujte a doplňte chybějící (např. místo vydání).' + (r.note ? ' ' + r.note : '');
  } catch (err) {
    // vlastní hlášky jsou Error; jinak vypršel čas nebo selhalo spojení
    const text = err.name === 'TimeoutError' ? 'Služba neodpověděla včas.'
               : err.constructor === Error ? err.message : 'Službu se nepodařilo kontaktovat.';
    msg.textContent = text + ' Vyplňte údaje ručně.';
  }
});

// Souborný katalog českých knihoven (CORS *); české/slovenské ISBN (80-…) zkoušíme nejdřív
async function cpk(isbn, raw) {
  try {
    const f = ['title', 'primaryAuthors', 'secondaryAuthors', 'placesOfPublication', 'publishers', 'publicationDates', 'edition']
      .map(x => '&field[]=' + x).join('');
    const res = await get(`https://www.knihovny.cz/api/v1/search?lookfor=isbn:${isbn}&limit=1${f}`, 8000);
    const r = ((await res.json()).records || [])[0];
    return r ? fromCPK(r, raw) : null;
  } catch { return null; }
}

async function lookupIsbn(isbn, raw) {
  const czech = /^(97[89])?80/.test(isbn);
  if (czech) { const r = await cpk(isbn, raw); if (r) return r; }
  try {
    const res = await get('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn, 5000);
    const data = await res.json();
    if (data.items && data.items.length) return fromGoogleBooks(data.items[0].volumeInfo, raw);
  } catch { /* zkusíme Open Library */ }
  try {
    const res = await get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
    const b = (await res.json())['ISBN:' + isbn];
    if (b) return fromOpenLibrary(b, raw);
  } catch { /* zkusíme Citoid */ }
  if (!czech) { const r = await cpk(isbn, raw); if (r) return r; }
  const z = await citoid(isbn).catch(() => null);
  if (z) return fromCitoid(z, '');
  throw new Error('ISBN se nepodařilo dohledat (české knihy často chybí).');
}

// ---------- ukázkové zdroje (jen k prohlédnutí, neukládají se) ----------
function renderExamples() {
  const ol = $('examples'), keys = [];
  for (const u of PRIKLADY) {
    const r = buildEntry(u.type, u.values, keys, { extra: u.extra });
    keys.push(r.key);
    const v = u.values, a = (v.author || [])[0];
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = u.varianta;
    const what = document.createElement('p');
    what.className = 'ex-what';
    const i = document.createElement('i');
    i.textContent = v.title;
    what.append(a ? a.last + (a.first ? ', ' + a.first : '') + (v.author.length > 1 ? ' a kol.' : '') + ': ' : '',
                i, ` (${v.year}) · ${typeById(u.type).label.split(/ \(|,/)[0]}`);
    const tip = document.createElement('p');
    tip.className = 'hint';
    tip.textContent = u.tip;
    const pre = document.createElement('pre');
    pre.textContent = r.text;
    pre.hidden = true;
    const row = document.createElement('div');
    row.className = 'row';
    const show = button('ukázat záznam', 'secondary small', () => {
      pre.hidden = !pre.hidden;
      show.textContent = pre.hidden ? 'ukázat záznam' : 'skrýt záznam';
    });
    row.append(show, button('načíst do formuláře', 'secondary small', () => {
      current = { type: u.type, values: structuredClone(u.values), extra: u.extra };
      editIndex = null; strict = false; renderMine(); renderFields(); update();
      $('h-zdroj').scrollIntoView({ behavior: 'smooth' });
    }));
    li.append(h, what, tip, row, pre);
    ol.appendChild(li);
  }
}
function showExamples(open) {
  $('examples').hidden = !open;
  $('show-examples').textContent = open ? 'Skrýt ukázky' : 'Zobrazit ukázky';
  $('show-examples').setAttribute('aria-expanded', String(open));
}
$('show-examples').addEventListener('click', () => showExamples($('examples').hidden));

// ---------- start ----------
renderFields();
update();
renderMine();
renderExamples();
// odkaz …/#ukazky rovnou otevře ukázky (např. ze zadání)
if (location.hash === '#ukazky') { showExamples(true); $('ukazky').scrollIntoView(); }
