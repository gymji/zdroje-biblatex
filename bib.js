// =========================================================
// zdroje-biblatex — logika: druhy zdrojů a sestavení záznamu
// Výstup je pro biblatex se stylem biblatex-iso690 (iso-numeric,
// iso-authoryear …). Sazbu citace dělá LaTeX, tady jen správná pole.
// Modul nemá žádnou závislost na stránce → jde testovat v Node.
// =========================================================

// Pole: id = název pole v .bib (nebo pomocné pole začínající "_"),
// label = popisek ve formuláři, req = povinné, hint = nápověda pod polem.
const F = {
  author:       { label: 'Autoři', kind: 'names' },
  editor:       { label: 'Editoři (ed.)', kind: 'names' },
  title:        { label: 'Název' },
  subtitle:     { label: 'Podnázev', hint: 'Část názvu za dvojtečkou.' },
  booktitle:    { label: 'Název knihy / sborníku' },
  journaltitle: { label: 'Název časopisu' },
  edition:      { label: 'Vydání', hint: 'Jen číslo, např. 2. První vydání se neuvádí.', type: 'number' },
  location:     { label: 'Místo vydání', hint: 'Např. Praha.' },
  publisher:    { label: 'Nakladatel / vydavatel' },
  organization: { label: 'Název webu / sbírky' },
  institution:  { label: 'Škola / instituce' },
  year:         { label: 'Rok vydání', type: 'number' },
  date:         { label: 'Datum', type: 'date' },
  volume:       { label: 'Ročník', type: 'number' },
  number:       { label: 'Číslo' },
  pages:        { label: 'Strany', hint: 'Např. 45–60 (stačí 45-60).' },
  isbn:         { label: 'ISBN' },
  issn:         { label: 'ISSN' },
  doi:          { label: 'DOI', hint: 'Např. 10.1088/1361-6552/aac05e (bez https://doi.org/).' },
  url:          { label: 'Adresa (URL)', type: 'url' },
  urldate:      { label: 'Datum citování', type: 'date', hint: 'Kdy jste zdroj viděli. Doplní se dnešní datum.' },
  howpublished: { label: 'Médium / druh', hint: 'Vysází se v hranatých závorkách, např. [online], [CD-ROM].' },
  type:         { label: 'Druh práce' },
  holder:       { label: 'Majitel patentu', kind: 'names' },
};

// Druhy zdrojů. entry = typ v .bib, fields = pořadí polí ve formuláři,
// req = povinná pole, fixed = pevně daná pole, choices = nabídka hodnot.
export const TYPES = [
  { id: 'book', label: 'Kniha (i e-kniha, manuál, CD/DVD)', entry: 'book',
    fields: ['author', 'title', 'subtitle', 'edition', 'location', 'publisher', 'year', 'isbn', 'howpublished', 'url', 'urldate'],
    req: ['author', 'title', 'publisher', 'year'],
    choices: { howpublished: ['', 'online', 'CD-ROM', 'DVD'] },
    hint: 'U tištěné knihy nechte médium prázdné. E-kniha = médium online + adresa.' },
  { id: 'inbook', label: 'Kapitola v knize (autor kapitoly = autor knihy)', entry: 'inbook',
    fields: ['author', 'title', 'booktitle', 'edition', 'location', 'publisher', 'year', 'pages', 'isbn'],
    req: ['author', 'title', 'booktitle', 'publisher', 'year'],
    labels: { title: 'Název kapitoly' } },
  { id: 'incollection', label: 'Kapitola ve sborníku / kolektivní monografii', entry: 'incollection',
    fields: ['author', 'title', 'editor', 'booktitle', 'location', 'publisher', 'year', 'pages', 'isbn'],
    req: ['author', 'title', 'booktitle', 'publisher', 'year'],
    labels: { title: 'Název kapitoly', author: 'Autoři kapitoly' } },
  { id: 'inproceedings', label: 'Příspěvek z konference', entry: 'inproceedings',
    fields: ['author', 'title', 'editor', 'booktitle', 'location', 'publisher', 'year', 'pages', 'isbn', 'doi', 'url', 'urldate'],
    req: ['author', 'title', 'booktitle', 'year'],
    labels: { title: 'Název příspěvku', booktitle: 'Název sborníku' } },
  { id: 'article', label: 'Článek v časopise (tištěný i online)', entry: 'article',
    fields: ['author', 'title', 'subtitle', 'journaltitle', 'year', 'volume', 'number', 'pages', 'issn', 'doi', 'url', 'urldate'],
    req: ['author', 'title', 'journaltitle', 'year'],
    labels: { title: 'Název článku' },
    hint: 'Má-li článek DOI, zkuste nahoře „Dohledat podle DOI“.' },
  { id: 'periodical', label: 'Celé číslo časopisu', entry: 'periodical',
    fields: ['title', 'location', 'publisher', 'year', 'volume', 'number', 'issn'],
    req: ['title', 'year'],
    labels: { title: 'Název časopisu' } },
  { id: 'online', label: 'Webová stránka / příspěvek na webu', entry: 'online',
    fields: ['author', 'title', 'subtitle', 'organization', 'publisher', 'date', 'url', 'urldate'],
    req: ['title', 'url', 'urldate'],
    labels: { title: 'Název stránky', date: 'Datum zveřejnění', publisher: 'Provozovatel webu' },
    hint: 'Autor nebývá uveden → nechte prázdné. Bez data zveřejnění se vysází [B.r.] (bez roku).' },
  { id: 'inreference', label: 'Heslo v encyklopedii (i Wikipedie)', entry: 'inreference',
    fields: ['author', 'title', 'booktitle', 'location', 'publisher', 'year', 'url', 'urldate'],
    req: ['title', 'booktitle'],
    labels: { title: 'Heslo', booktitle: 'Název encyklopedie' },
    defaults: { booktitle: '' },
    hint: 'Wikipedie: název encyklopedie „Wikipedie: Otevřená encyklopedie“, rok poslední úpravy stránky.' },
  { id: 'report', label: 'Zpráva, doporučení, publikace instituce', entry: 'report',
    fields: ['author', 'title', 'subtitle', 'type', 'location', 'publisher', 'year', 'number', 'url', 'urldate'],
    req: ['author', 'title', 'publisher', 'year'],
    labels: { type: 'Druh dokumentu', publisher: 'Vydavatel (instituce)' },
    hint: 'Autorem bývá instituce → zaškrtněte „instituce“.' },
  { id: 'thesis', label: 'Závěrečná práce (maturitní, bakalářská …)', entry: 'thesis',
    fields: ['author', 'title', 'subtitle', 'type', 'institution', 'location', 'year', 'url', 'urldate'],
    req: ['author', 'title', 'type', 'institution', 'year'],
    choices: { type: ['Maturitní práce', 'Seminární práce', 'Bakalářská práce', 'Diplomová práce', 'Disertační práce'] } },
  { id: 'patent', label: 'Patent', entry: 'patent',
    fields: ['author', 'title', 'number', 'holder', 'date', 'url', 'urldate'],
    req: ['author', 'title', 'number', 'date'],
    labels: { author: 'Vynálezci', number: 'Číslo patentu', date: 'Datum zveřejnění' },
    hint: 'Číslo i se zkratkou země, např. CZ 123456.' },
  { id: 'movie', label: 'Film, video (i YouTube)', entry: 'movie',
    fields: ['author', 'title', 'howpublished', 'location', 'publisher', 'year', 'url', 'urldate'],
    req: ['title', 'year'],
    labels: { author: 'Autor / režisér / kanál' },
    choices: { howpublished: ['online; video', 'film', 'DVD', 'televizní pořad'] } },
  { id: 'music', label: 'Hudba, zvukový záznam, podcast', entry: 'music',
    fields: ['author', 'title', 'howpublished', 'location', 'publisher', 'year', 'url', 'urldate'],
    req: ['author', 'title', 'year'],
    choices: { howpublished: ['CD', 'online; zvukový záznam', 'online; podcast'] } },
  { id: 'ai', label: 'Nástroj umělé inteligence (ChatGPT, Claude …)', entry: 'misc',
    fields: ['author', 'title', 'howpublished', 'year', 'url', 'urldate'],
    req: ['author', 'title', 'year', 'url', 'urldate'],
    labels: { author: 'Firma (tvůrce nástroje)', title: 'Název a verze nástroje', year: 'Rok verze' },
    choices: { howpublished: ['online; AI chatbot', 'online; AI generátor obrázků', 'online; AI vyhledávač', 'online; AI překladač'] },
    institutionAuthor: true,
    hint: 'Cituje se jen doslovně převzatý výstup (text, obrázek, kód), a to jako software. ' +
          'Použití AI vždy popište v prohlášení; konverzaci přiložte jako přílohu.' },
  { id: 'software', label: 'Software, aplikace', entry: 'misc',
    fields: ['author', 'title', 'howpublished', 'year', 'url', 'urldate'],
    req: ['title', 'year'],
    labels: { author: 'Tvůrce (firma / autoři)', title: 'Název a verze' },
    choices: { howpublished: ['online; software', 'software', 'mobilní aplikace'] } },
  { id: 'legal', label: 'Zákon, vyhláška, nařízení', entry: 'misc',
    fields: ['author', 'title', 'organization', 'year', 'howpublished', 'url', 'urldate'],
    req: ['author', 'title', 'year'],
    labels: { author: 'Stát / vydavatel', title: 'Název předpisu', organization: 'Sbírka' },
    institutionAuthor: true,
    defaults: { author: 'Česko', organization: 'Sbírka zákonů' },
    choices: { howpublished: ['', 'online'] },
    hint: 'Název celý, např. „Zákon č. 121/2000 Sb., o právu autorském“. Předpisy EU: autor „Evropská unie“.' },
  { id: 'standard', label: 'Norma (ČSN, ISO …)', entry: 'misc',
    fields: ['title', 'subtitle', 'location', 'publisher', 'year'],
    req: ['title', 'year'],
    labels: { title: 'Označení normy', subtitle: 'Název normy' },
    defaults: { location: 'Praha', publisher: 'Česká agentura pro standardizaci' } },
  { id: 'dataset', label: 'Datová sada, tabulky dat', entry: 'misc',
    fields: ['author', 'title', 'howpublished', 'publisher', 'year', 'doi', 'url', 'urldate'],
    req: ['author', 'title', 'year'],
    fixed: { howpublished: 'online; datová sada' } },
  { id: 'interview', label: 'Rozhovor, osobní sdělení', entry: 'misc',
    fields: ['author', 'title', 'location', 'date'],
    req: ['author', 'title', 'date'],
    labels: { author: 'Kdo poskytl rozhovor', title: 'Téma / název', date: 'Datum rozhovoru' },
    fixed: { howpublished: 'osobní rozhovor' } },
  { id: 'misc', label: 'Jiný zdroj', entry: 'misc',
    fields: ['author', 'title', 'subtitle', 'howpublished', 'location', 'publisher', 'year', 'url', 'urldate'],
    req: ['title'],
    hint: 'Když nic jiného nesedí. Médium popište slovy, např. „mapa“, „plakát“, „rukopis“.' },
];

export const FIELDS = F;
export const typeById = id => TYPES.find(t => t.id === id);

export function fieldLabel(type, f) {
  return (type.labels && type.labels[f]) || F[f].label;
}

// --- Jména: [{last, first, inst}] → "Příjmení, Jméno and {{Instituce}}" ---
export function formatNames(list) {
  return (list || [])
    .filter(n => (n.last || '').trim() || (n.first || '').trim())
    .map(n => {
      const last = escapeTeX((n.last || '').trim());
      const first = escapeTeX((n.first || '').trim());
      if (n.inst) return '{' + last + '}';            // celé pole je pak {{…}}
      return first ? `${last}, ${first}` : last;
    })
    .join(' and ');
}

// Znaky, které mají v LaTeXu zvláštní význam. V adresách (url) se nemění.
const SPECIAL = { '%': '\\%', '&': '\\&', '#': '\\#', '$': '\\$', '_': '\\_' };
export function escapeTeX(s) {
  return String(s).replace(/(\\?)([%&#$_])/g, (m, bs, ch) => bs ? m : SPECIAL[ch]);
}

// Klíč pro \cite: příjmení prvního autora (nebo první slovo názvu) + rok, jen a–z a číslice.
export function makeKey(values, taken = []) {
  const n = (values.author || []).find(a => (a.last || '').trim());
  let base = n ? (n.inst ? n.last.trim().split(/\s+/)[0] : n.last) : (values.title || 'zdroj').split(/\s+/)[0];
  base = base.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!base) base = 'zdroj';
  const year = values.year || (values.date || '').slice(0, 4);
  let key = base + (year || '');
  if (!taken.includes(key)) return key;
  for (const c of 'bcdefghijklmnopqrstuvwxyz') if (!taken.includes(key + c)) return key + c;
  return key + Date.now();
}

// Sestaví záznam. values = {pole: hodnota, author: [{last, first, inst}] …}
// key = vlastní klíč (z nahraného .bib — student jím už cituje), extra = další
// pole ze souboru {pole: zdrojový text hodnoty}, připojí se beze změny.
// Vrací {key, text, problems: [{level: 'chyba'|'pozor', msg}]}.
export function buildEntry(typeId, values, taken = [], { key: ownKey, extra = {} } = {}) {
  const t = typeById(typeId);
  if (!t) throw new Error('Neznámý druh zdroje: ' + typeId);
  const v = { ...(t.defaults || {}), ...values, ...(t.fixed || {}) };
  // jména zadaná jako text (výchozí hodnoty) → seznam
  for (const f of Object.keys(F)) if (F[f].kind === 'names' && typeof v[f] === 'string')
    v[f] = v[f] ? [{ last: v[f], first: '', inst: true }] : [];
  const problems = [];

  const present = f => {
    if (F[f] && F[f].kind === 'names') return (v[f] || []).some(n => (n.last || '').trim());
    return String(v[f] ?? '').trim() !== '';
  };
  for (const f of t.req) if (!present(f)) problems.push({ level: 'chyba', field: f, msg: `Chybí povinné pole „${fieldLabel(t, f)}“.` });

  // Kontroly obsahu
  for (const f of ['author', 'editor', 'holder']) for (const n of (v[f] || [])) {
    if (!n.inst && /,|\sand\s|;/.test(n.first + ' ' + n.last))
      problems.push({ level: 'pozor', msg: `„${n.last} ${n.first}“: každého autora zadejte na samostatný řádek.` });
    if (!n.inst && n.last && !n.first && n.last.trim().includes(' '))
      problems.push({ level: 'pozor', msg: `„${n.last}“ vypadá jako instituce — zaškrtněte „instituce“.` });
  }
  if (v.year && !/^\d{4}$/.test(String(v.year).trim())) problems.push({ level: 'pozor', msg: 'Rok má mít čtyři číslice.' });
  if (v.doi && /^https?:/.test(v.doi)) v.doi = v.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
  if (present('url') && !present('urldate') && t.fields.includes('urldate'))
    problems.push({ level: 'pozor', msg: 'U zdroje s adresou uveďte datum citování.' });
  if (v.url && !/^https?:\/\//.test(v.url.trim())) problems.push({ level: 'pozor', msg: 'Adresa má začínat https:// nebo http://.' });
  if (v.url && /[%#]/.test(v.url)) problems.push({ level: 'pozor', msg: 'Adresa obsahuje % nebo #. Kdyby překlad hlásil chybu, zkraťte ji (část od # smažte).' });

  const key = ownKey || makeKey(v, taken);
  if (ownKey && taken.includes(ownKey))
    problems.push({ level: 'chyba', msg: `Klíč ${ownKey} má i jiný zdroj v seznamu — klíče se nesmí opakovat.` });
  const lines = [];
  for (const f of t.fields.concat(Object.keys(t.fixed || {}))) {
    if (lines.some(l => l.startsWith(`  ${f} `))) continue;
    if (f === 'urldate' && !String(v.url ?? '').trim()) continue;   // datum citování jen s adresou
    let val;
    if (F[f].kind === 'names') {
      val = formatNames(v[f]);
      if (t.institutionAuthor && f === 'author' && val && !val.startsWith('{')) {
        // firma/stát jako autor (OpenAI, Česko) — celé jako instituce
        val = '{' + escapeTeX((v[f][0].last + ' ' + (v[f][0].first || '')).trim()) + '}';
      }
    } else {
      val = String(v[f] ?? '').trim();
      if (!val) continue;
      if (f === 'pages') val = val.replace(/\s*[-–—]+\s*/g, '--');
      else if (f === 'number' && typeId === 'patent') val = escapeTeX(val);
      else if (!['url', 'doi', 'urldate', 'date'].includes(f)) val = escapeTeX(val);
    }
    if (!val) continue;
    lines.push(`  ${f} = {${val}},`);
  }
  for (const [f, raw] of Object.entries(extra))
    if (!lines.some(l => l.startsWith(`  ${f} `))) lines.push(`  ${f} = ${raw},`);
  const text = `@${t.entry}{${key},\n${lines.join('\n')}\n}`;
  return { key, text, problems };
}

// --- Dohledání podle DOI (Crossref) — vrací hodnoty pro formulář ---
export function fromCrossref(msg) {
  const typeMap = { 'journal-article': 'article', 'book': 'book', 'monograph': 'book', 'edited-book': 'book',
    'book-chapter': 'incollection', 'proceedings-article': 'inproceedings', 'report': 'report',
    'dissertation': 'thesis', 'dataset': 'dataset', 'posted-content': 'online' };
  const parts = (msg.issued && msg.issued['date-parts'] && msg.issued['date-parts'][0]) || [];
  // Crossref dává iniciály často bez tečky („S“) → „S.“
  const dot = s => (s || '').replace(/(^|[\s.-])(\p{Lu})(?=$|[\s-])/gu, '$1$2.');
  const vals = {
    author: (msg.author || []).map(a => a.family ? { last: a.family, first: dot(a.given) } : { last: a.name || '', first: '', inst: true }),
    editor: (msg.editor || []).map(a => ({ last: a.family || '', first: dot(a.given) })),
    title: (msg.title || [])[0] || '',
    subtitle: (msg.subtitle || [])[0] || '',
    year: parts[0] ? String(parts[0]) : '',
    volume: msg.volume || '', number: msg.issue || '', pages: msg.page || '',
    publisher: msg.publisher || '', doi: msg.DOI || '',
    isbn: (msg.ISBN || [])[0] || '', issn: (msg.ISSN || [])[0] || '',
  };
  const container = (msg['container-title'] || [])[0] || '';
  const type = typeMap[msg.type] || 'article';
  if (type === 'article') vals.journaltitle = container; else vals.booktitle = container;
  return { type, values: vals };
}

// --- Dohledání podle ISBN (Google Books / Open Library) ---
export function splitName(full) {
  const p = full.trim().split(/\s+/);
  if (p.length === 1) return { last: p[0], first: '' };
  return { last: p[p.length - 1], first: p.slice(0, -1).join(' ') };
}
export function fromGoogleBooks(info, isbn) {
  return { type: 'book', values: {
    author: (info.authors || []).map(splitName),
    title: info.title || '', subtitle: info.subtitle || '',
    publisher: info.publisher || '', year: (info.publishedDate || '').slice(0, 4), isbn } };
}
export function fromOpenLibrary(b, isbn) {
  return { type: 'book', values: {
    author: (b.authors || []).map(a => splitName(a.name)),
    title: b.title || '', subtitle: b.subtitle || '',
    publisher: ((b.publishers || [])[0] || {}).name || '',
    location: ((b.publish_places || [])[0] || {}).name || '',
    year: ((b.publish_date || '').match(/\d{4}/) || [''])[0], isbn } };
}

// =========================================================
// Nahrání vlastního .bib: text → záznamy → hodnoty pro formulář
// =========================================================

// Rozdělí s na místech, kde odpovídá re (s příznakem y), ale jen mimo složené závorky.
function splitTop(s, re) {
  const out = [];
  let depth = 0, from = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') depth--;
    else if (depth === 0) {
      re.lastIndex = i;
      const m = re.exec(s);
      if (m && m[0]) { out.push(s.slice(from, i)); i += m[0].length - 1; from = i + 1; }
    }
  }
  out.push(s.slice(from));
  return out.map(x => x.trim()).filter(Boolean);
}

// {celé v závorkách} — ne {\v{C}}apek
function wholeBraced(s) {
  if (s[0] !== '{') return false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}' && --depth === 0) return i === s.length - 1;
  }
  return false;
}

// Pole jednoho záznamu: {pole: {raw: zdrojový text, value: hodnota bez závorek/uvozovek}}
function parseFields(s, strings, where, errors) {
  const out = {};
  let i = 0;
  for (;;) {
    while (i < s.length && /[\s,]/.test(s[i])) i++;
    if (i >= s.length) break;
    const m = /^([^\s=,{}"#]+)\s*=\s*/.exec(s.slice(i));
    if (!m) { errors.push(`${where}: nečitelné pole „${s.slice(i, i + 25).trim()}…“ (chybí = nebo čárka?).`); break; }
    const name = m[1].toLowerCase();
    i += m[0].length;
    const from = i;
    let value = '';
    for (;;) {
      if (s[i] === '{' || s[i] === '"') {
        const q = s[i] === '"';
        let depth = q ? 0 : 1, j = i + 1;
        for (; j < s.length; j++) {
          if (s[j] === '{') depth++;
          else if (s[j] === '}') { depth--; if (!q && depth === 0) break; }
          else if (q && s[j] === '"' && depth === 0) break;
        }
        value += s.slice(i + 1, j);
        i = j + 1;
      } else {
        const w = /^[^\s,#{}"]+/.exec(s.slice(i));
        if (!w) break;
        i += w[0].length;
        value += /^\d+$/.test(w[0]) ? w[0] : (strings[w[0].toLowerCase()] ?? w[0]);
      }
      while (/\s/.test(s[i] || '')) i++;
      if (s[i] !== '#') break;                      // spojování "a" # b
      i++;
      while (/\s/.test(s[i] || '')) i++;
    }
    out[name] = { raw: s.slice(from, i).trim(), value };
  }
  return out;
}

const MONTHS = Object.fromEntries('jan feb mar apr may jun jul aug sep oct nov dec'.split(' ').map((m, i) => [m, String(i + 1)]));

// Vrací {entries: [{entry, key, fields, source}], head: [@string/@preamble/@comment], skipped, errors: [text]}.
// source = záznam přesně tak, jak byl v souboru. head se nezobrazuje, jen uloží.
// skipped = počet vynechaných @Control{biblatex-control} — biblatex si je při
// překladu vytváří sám (soubor *-blx.bib), stará kopie by jen škodila.
export function parseBib(text) {
  const entries = [], head = [], errors = [], strings = { ...MONTHS };
  let skipped = 0;
  const lineOf = i => text.slice(0, i).split('\n').length;
  let i = 0;
  while ((i = text.indexOf('@', i)) !== -1) {
    const m = /^@\s*([A-Za-z]+)\s*([{(])/.exec(text.slice(i, i + 40));
    if (!m) { i++; continue; }
    const kind = m[1].toLowerCase(), paren = m[2] === '(';
    const start = i, body0 = i + m[0].length;
    let depth = 0, j = body0;
    for (; j < text.length; j++) {
      if (text[j] === '{') depth++;
      else if (text[j] === '}') { if (depth === 0 && !paren) break; depth--; }
      else if (text[j] === ')' && paren && depth === 0) break;
    }
    const where = `řádek ${lineOf(start)}`;
    if (j >= text.length) { errors.push(`${where}: záznam @${m[1]} nemá konec (chybí zavírací závorka).`); break; }
    const body = text.slice(body0, j), source = text.slice(start, j + 1);
    i = j + 1;
    if (kind === 'control' || /^\s*biblatex-control\s*,/.test(body)) { skipped++; continue; }
    if (kind === 'comment' && /^\$ biblatex /.test(body)) continue;   // hlavička *-blx.bib
    if (kind === 'comment' || kind === 'preamble') { head.push(source); continue; }
    if (kind === 'string') {
      for (const [k, f] of Object.entries(parseFields(body, strings, where, errors))) strings[k] = f.value;
      head.push(source);
      continue;
    }
    const comma = body.indexOf(',');
    const key = (comma < 0 ? body : body.slice(0, comma)).trim();
    const fields = parseFields(comma < 0 ? '' : body.slice(comma + 1), strings, `${where} (${key || 'bez klíče'})`, errors);
    entries.push({ entry: kind, key, fields, source });
  }
  return { entries, head, skipped, errors };
}

// Akcenty LaTeXu → Unicode: {\'a} → á, \v{c} → č, \"o → ö; \% \& \# → znak.
const ACC = { "'": '́', '`': '̀', '^': '̂', '"': '̈', '~': '̃', '=': '̄', '.': '̇',
              v: '̌', u: '̆', H: '̋', c: '̧', k: '̨', r: '̊' };
const LETTERS = { ss: 'ß', aa: 'å', AA: 'Å', o: 'ø', O: 'Ø', l: 'ł', L: 'Ł', ae: 'æ', AE: 'Æ', oe: 'œ', OE: 'Œ' };
const base = x => x === '\\i' ? 'i' : x === '\\j' ? 'j' : x;
export function fromTeX(s) {
  return String(s)
    .replace(/\\([`'^"~=.])\s*(?:\{\s*(\\[ij]|[A-Za-z])\s*\}|(\\[ij]|[A-Za-z]))/g, (m, a, x, y) => base(x || y) + ACC[a])
    .replace(/\\([vuHckr])(?:\s*\{\s*(\\[ij]|[A-Za-z])\s*\}|\s+([A-Za-z]))/g, (m, a, x, y) => base(x || y) + ACC[a])
    .replace(/\\(ss|aa|AA|ae|AE|oe|OE|o|O|l|L)(?![A-Za-z])(\{\}|\s*)/g, (m, x) => LETTERS[x])
    .normalize('NFC')
    .replace(/\{([^\x00-\x7f])\}/gu, '$1')
    .replace(/\\([%&#$_])/g, '$1');
}

// Jen pro zobrazení v přehledu: {\LaTeX} --- \emph{x} → LaTeX — x (do .bib se nepoužívá)
export function plainTeX(s) {
  return fromTeX(s)
    .replace(/(^|[^\\])~/g, '$1 ')
    .replace(/\\~\{\}/g, '~')
    .replace(/\\(XeLaTeX|LaTeX|BibTeX|TeX)(?![A-Za-z])/g, '$1')
    .replace(/\\ /g, ' ')
    .replace(/\\[A-Za-z]+\s*/g, '')
    .replace(/---/g, '—').replace(/--/g, '–')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ').trim();
}

// "Příjmení, Jméno and Jméno Příjmení and {Instituce}" → [{last, first, inst}]
export function parseNames(s) {
  const clean = x => fromTeX(x).replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
  return splitTop(s, /\s+and\s+/iy).map(n => {
    if (wholeBraced(n)) return { last: clean(n.slice(1, -1)), first: '', inst: true };
    const parts = splitTop(n, /\s*,\s*/y);
    if (parts.length > 1) return { last: clean(parts[0]), first: clean(parts[parts.length - 1]), inst: false };
    const words = splitTop(n, /\s+/y);
    return { last: clean(words[words.length - 1]), first: clean(words.slice(0, -1).join(' ')), inst: false };
  });
}

const ENTRY = { book: 'book', mvbook: 'book', manual: 'book', collection: 'book', mvcollection: 'book', booklet: 'book',
  inbook: 'inbook', bookinbook: 'inbook', incollection: 'incollection', inproceedings: 'inproceedings',
  conference: 'inproceedings', article: 'article', periodical: 'periodical', online: 'online', www: 'online',
  electronic: 'online', inreference: 'inreference', report: 'report', techreport: 'report', thesis: 'thesis',
  mastersthesis: 'thesis', phdthesis: 'thesis', patent: 'patent', movie: 'movie', video: 'movie',
  music: 'music', audio: 'music', software: 'software', dataset: 'dataset' };
const ALIAS = { journal: 'journaltitle', address: 'location', school: 'institution' };

// Záznam z parseBib → {type, values, extra, key} pro formulář a buildEntry.
export function toForm(e) {
  const f = e.fields, val = k => (f[k] ? f[k].value : '');
  let type = ENTRY[e.entry];
  if (!type) {                                     // @misc, @unpublished … podle obsahu
    const how = fromTeX(val('howpublished')), title = fromTeX(val('title'));
    type = /\bAI\b/.test(how) ? 'ai' : /software|aplikace/i.test(how) ? 'software'
         : /datov/i.test(how) ? 'dataset' : /rozhovor/i.test(how) ? 'interview'
         : /^(zákon|vyhláška|nařízení)/i.test(title) ? 'legal' : /^(ČSN|ISO|EN)\b/.test(title) ? 'standard' : 'misc';
  }
  const t = typeById(type), values = {}, extra = {};
  for (const [name, { raw, value }] of Object.entries(f)) {
    let k = ALIAS[name] && !f[ALIAS[name]] ? ALIAS[name] : name, v = value;
    if (type === 'report' && k === 'institution' && !f.publisher) k = 'publisher';
    if (k === 'date' && !t.fields.includes('date') && t.fields.includes('year') && !f.year) { k = 'year'; v = v.slice(0, 4); }
    if (t.fixed && k in t.fixed) continue;
    if (!t.fields.includes(k) || k in values) { extra[name] = raw; continue; }
    if (F[k].kind === 'names') values[k] = parseNames(v);
    else if (['url', 'doi'].includes(k)) values[k] = v.trim();
    else values[k] = fromTeX(v).replace(/\s+/g, ' ').trim();
  }
  if (type === 'thesis' && !values.type)
    values.type = { mastersthesis: 'Diplomová práce', phdthesis: 'Disertační práce' }[e.entry];
  return { type, values, extra, key: e.key };
}
