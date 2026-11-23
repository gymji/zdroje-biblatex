// Vzorová data pro každý druh zdroje → generated.bib (test: node test/vzorky.mjs)
import { TYPES, buildEntry } from '../bib.js';
import { writeFileSync } from 'node:fs';

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
writeFileSync(new URL('generated.bib', import.meta.url), out.join('\n\n') + '\n');
console.log(`OK: ${TYPES.length} záznamů → test/generated.bib`);
