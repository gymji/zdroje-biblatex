// Vzorová data pro každý druh zdroje → generated.bib (test: node test/vzorky.mjs)
import { TYPES, buildEntry, parseBib, toForm, plainTeX } from '../bib.js';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const A = (last, first = '', inst = false) => ({ last, first, inst });
const S = {
  book: { author: [A('Halliday', 'David'), A('Resnick', 'Robert'), A('Walker', 'Jearl')], title: 'Fyzika', subtitle: 'vysokoškolská učebnice obecné fyziky', edition: '2', location: 'Brno', publisher: 'VUTIUM', year: '2013', isbn: '978-80-214-4123-1' },
  inbook: { author: [A('Feynman', 'Richard P.')], title: 'Gravitace', booktitle: 'Feynmanovy přednášky z fyziky', location: 'Havlíčkův Brod', publisher: 'Fragment', year: '2000', pages: '101-120' },
  incollection: { author: [A('Novák', 'Jan')], title: 'Měření v hodinách fyziky', editor: [A('Svoboda', 'Petr')], booktitle: 'Moderní výuka fyziky', location: 'Praha', publisher: 'Karolinum', year: '2019', pages: '45 – 60' },
  inproceedings: { author: [A('Staacks', 'Sebastian'), A('Hütz', 'Simon')], title: 'Phyphox in the classroom', booktitle: 'Veletrh nápadů učitelů fyziky 23', location: 'Praha', publisher: 'Univerzita Karlova', year: '2018', pages: '10-15' },
  article: { author: [A('Staacks', 'Sebastian'), A('Hütz', 'Simon'), A('Heinke', 'Heidrun'), A('Stampfer', 'Christoph')], title: 'Advanced tools for smartphone-based experiments: phyphox', journaltitle: 'Physics Education', year: '2018', volume: '53', number: '4', pages: '045009', doi: 'https://doi.org/10.1088/1361-6552/aac05e' },
  periodical: { title: 'Československý časopis pro fyziku', location: 'Praha', publisher: 'Fyzikální ústav AV ČR', year: '2020', volume: '70', number: '3', issn: '0009-0700' },
  online: { author: [A('RWTH Aachen University', '', true)], title: 'phyphox', subtitle: 'Physical Phone Experiments', organization: 'phyphox.org', date: '2024-05-02', url: 'https://phyphox.org', urldate: '2026-11-23' },
  inreference: { title: 'Kyvadlo', booktitle: 'Wikipedie: Otevřená encyklopedie', year: '2025', url: 'https://cs.wikipedia.org/wiki/Kyvadlo', urldate: '2026-11-23' },
  report: { author: [A('Národní pedagogický institut ČR', '', true)], title: 'Umělá inteligence do škol', subtitle: 'Doporučení pro pedagogy & vedení škol', type: 'Metodické doporučení', location: 'Praha', publisher: 'NPI ČR', year: '2024' },
  thesis: { author: [A('Dvořák', 'Tomáš')], title: 'Měření tíhového zrychlení mobilním telefonem', type: 'Maturitní práce', institution: 'Gymnázium', location: 'České Budějovice', year: '2025' },
  patent: { author: [A('Novák', 'Jan')], title: 'Zařízení pro měření kmitů', number: 'CZ 123456', holder: [A('Univerzita Karlova', '', true)], date: '2020-05-04' },
  movie: { author: [A('Veritasium', '', true)], title: 'How Do Pendulums Work?', howpublished: 'online; video', year: '2021', url: 'https://www.youtube.com/', urldate: '2026-11-23' },
  music: { author: [A('Dvořák', 'Antonín')], title: 'Symfonie č. 9 e moll „Z Nového světa“', howpublished: 'CD', location: 'Praha', publisher: 'Supraphon', year: '1990' },
  ai: { author: [A('OpenAI')], title: 'ChatGPT-5.2', howpublished: 'online; AI chatbot', year: '2025', url: 'https://openai.com/chatgpt/', urldate: '2025-11-28' },
  software: { author: [A('Python Software Foundation', '', true)], title: 'Python 3.12', howpublished: 'online; software', year: '2023', url: 'https://www.python.org', urldate: '2026-11-23' },
  legal: { title: 'Zákon č. 121/2000 Sb., o právu autorském', year: '2000', howpublished: 'online', url: 'https://www.e-sbirka.cz', urldate: '2026-11-23' },
  standard: { title: 'ČSN ISO 690', subtitle: 'Informace a dokumentace – Pravidla pro bibliografické odkazy a citace informačních zdrojů', year: '2022' },
  dataset: { author: [A('Český hydrometeorologický ústav', '', true)], title: 'Historická data: meteorologie a klimatologie', year: '2025', url: 'https://www.chmi.cz', urldate: '2026-11-23' },
  interview: { author: [A('Kovář', 'Pavel')], title: 'Rozhovor o měření kyvadlem', location: 'České Budějovice', date: '2026-03-12' },
  misc: { title: 'Mapa Českých Budějovic', howpublished: 'mapa', location: 'Praha', publisher: 'Kartografie', year: '2010' },
};

const taken = [], out = [];
for (const t of TYPES) {
  const r = buildEntry(t.id, S[t.id], taken);
  taken.push(r.key);
  out.push(`% ${t.label}\n${r.text}`);
  for (const p of r.problems) console.log(`${t.id}: ${p.level}: ${p.msg}`);
}
const bib = out.join('\n\n') + '\n';
writeFileSync(new URL('generated.bib', import.meta.url), bib);
console.log(`OK: ${TYPES.length} záznamů → test/generated.bib`);

// Nahrání .bib: vlastní výstup → parseBib → toForm → buildEntry = totéž
const p = parseBib(bib);
assert.deepEqual(p.errors, []);
assert.equal(p.entries.length, TYPES.length);
p.entries.forEach((e, i) => {
  const f = toForm(e);
  assert.equal(f.type, TYPES[i].id, e.key);
  assert.deepEqual(f.extra, {}, e.key);
  assert.equal(buildEntry(f.type, f.values, [], { key: f.key }).text, e.source, e.key);
});
console.log(`OK: round-trip ${p.entries.length} záznamů`);

// Cizí soubor (Zotero, JabRef …): akcenty, aliasy polí, @string, uvozovky, další pole
const cizi = parseBib(String.raw`% Encoding: UTF-8
@string{pe = "Physics Education"}
@Comment{jabref-meta: databaseType:biblatex;}
@Control{biblatex-control,
  options = {3.11:0:0:1:0:1:1:0:0:0:0:1:2:1:99:1:0:0:3:1:79:+:+:nty},
}
@ARTICLE{Novak:2020,
  author = {Nov{\'a}k, Jan and Petr {\v{C}}ern{\'y} and {{Fyzik\'aln\'i \'ustav AV \v{C}R}}},
  title = "M{\v e}{\v r}en{\'\i} \& kyvadlo",
  journal = pe # " (CZ)",
  year = 2020, month = jan,
  pages = {1--10},
  abstract = {Dlouhý {abstrakt}
    na dva řádky},
}
@book{bezklice,
  author={Hawking, Stephen W.}, title={Stručná historie času}, address={Praha},
  publisher={Mladá fronta}, date={1991-01}, isbn={80-204-0185-8}
}
@misc{chatgpt, author={{OpenAI}}, title={ChatGPT}, howpublished={online; AI chatbot}, year={2025}}
@online{web, title={Kyvadlo}, url={https://cs.wikipedia.org/wiki/Kyvadlo}, year={2025}}`);
assert.deepEqual(cizi.errors, []);
assert.deepEqual(cizi.head, ['@string{pe = "Physics Education"}', '@Comment{jabref-meta: databaseType:biblatex;}']);
assert.equal(cizi.skipped, 1);
assert.equal(cizi.entries.length, 4);
const [a, k, ai, web] = cizi.entries.map(toForm);
assert.equal(a.type, 'article');
assert.equal(a.key, 'Novak:2020');
assert.deepEqual(a.values.author, [
  { last: 'Novák', first: 'Jan', inst: false },
  { last: 'Černý', first: 'Petr', inst: false },
  { last: 'Fyzikální ústav AV ČR', first: '', inst: true }]);
assert.equal(a.values.title, 'Měření & kyvadlo');
assert.equal(a.values.journaltitle, 'Physics Education (CZ)');
assert.equal(a.values.year, '2020');
assert.deepEqual(a.extra, { month: 'jan', abstract: '{Dlouhý {abstrakt}\n    na dva řádky}' });
const ra = buildEntry(a.type, a.values, ['Novak:2020'], { key: a.key, extra: a.extra });
assert.match(ra.text, /^@article\{Novak:2020,/);
assert.match(ra.text, /title = \{Měření \\& kyvadlo\}/);
assert.match(ra.text, /author = \{Novák, Jan and Černý, Petr and \{Fyzikální ústav AV ČR\}\}/);
assert.match(ra.text, /  month = jan,\n  abstract = \{Dlouhý/);
assert.ok(ra.problems.some(x => x.level === 'chyba' && /Novak:2020/.test(x.msg)), 'duplicitní klíč');
assert.equal(k.type, 'book');
assert.equal(k.values.location, 'Praha');
assert.equal(k.values.year, '1991');
assert.equal(ai.type, 'ai');
assert.equal(web.type, 'online');
assert.deepEqual(web.extra, { year: '{2025}' });
assert.ok(buildEntry(web.type, web.values, [], { key: web.key }).problems.some(x => /Datum citování/.test(x.msg)));
console.log('OK: nahrání cizího .bib');

// Přehled Mých zdrojů: názvy bez příkazů LaTeXu
assert.equal(plainTeX('The \\LaTeX\\ Companion'), 'The LaTeX Companion');
assert.equal(plainTeX('{\\LaTeX} --- Wikipedie, otevřená encyklopedie'), 'LaTeX — Wikipedie, otevřená encyklopedie');
assert.equal(plainTeX('{Zur Elektrodynamik bewegter K{\\"o}rper}. ({German}) [{On} the \\emph{bodies}]'),
  'Zur Elektrodynamik bewegter Körper. (German) [On the bodies]');
console.log('OK: názvy pro přehled');
