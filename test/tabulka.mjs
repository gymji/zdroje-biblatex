// Vygeneruje tabulku povinných a volitelných polí z TYPES (bib.js)
// a vloží ji do README.md mezi značky <!-- tabulka:zacatek --> a <!-- tabulka:konec -->.
// Spuštění: node test/tabulka.mjs   (po každé změně TYPES)
import { readFileSync, writeFileSync } from 'node:fs';
import { TYPES, fieldLabel } from '../bib.js';

const pole = (t, f) => `${fieldLabel(t, f)} (\`${f}\`)`;

const radky = TYPES.map(t => {
  const povinna = t.req.map(f => pole(t, f)).join(', ');
  const volitelna = t.fields.filter(f => !t.req.includes(f) && !(t.fixed && f in t.fixed)).map(f => pole(t, f)).join(', ') || '–';
  const pevna = Object.entries(t.fixed || {}).map(([f, v]) => `\`${f} = {${v}}\``);
  const typ = '`@' + t.entry + '`' + (pevna.length ? '<br>' + pevna.join(', ') : '');
  return `| ${t.label} | ${typ} | ${povinna} | ${volitelna} |`;
});

const tabulka = [
  '| Druh zdroje | Typ v `.bib` | Povinná pole | Volitelná pole |',
  '|---|---|---|---|',
  ...radky,
].join('\n');

const soubor = new URL('../README.md', import.meta.url);
const readme = readFileSync(soubor, 'utf8');
const re = /(<!-- tabulka:zacatek -->)[\s\S]*?(<!-- tabulka:konec -->)/;
if (!re.test(readme)) throw new Error('V README.md chybí značky <!-- tabulka:zacatek --> / <!-- tabulka:konec -->.');
writeFileSync(soubor, readme.replace(re, `$1\n${tabulka}\n$2`));
console.log(`README.md: tabulka polí, ${TYPES.length} druhů zdrojů.`);
