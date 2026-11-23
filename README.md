# Zdroj → BibLaTeX

Webový formulář v češtině, který z údajů o zdroji vytvoří záznam do souboru
`Bibliografie.bib` (BibLaTeX). Je určený studentům, kteří píšou maturitní nebo
seminární práci v LaTeXu (šablona maturitní práce, Overleaf).

**Stránka:** https://gymji.github.io/zdroje-biblatex/

- 20 druhů zdrojů: kniha, kapitola, sborník, článek, časopis, web, encyklopedie,
  zpráva instituce, závěrečná práce, patent, video, hudba, nástroj AI, software,
  zákon, norma, datová sada, rozhovor, jiný zdroj
- dohledání podle DOI (Crossref) a ISBN (Google Books, Open Library)
- kontrola povinných údajů, klíč pro `\cite`, „Moje zdroje“ a stažení celého `.bib`
- nahrání vlastního `.bib`: přehled se stavem každého záznamu, úprava ve formuláři
  (klíč i další pole jako `abstract` zůstanou), neupravené záznamy se stáhnou beze změny
- podobu citace podle ČSN ISO 690 zařídí LaTeX (`biblatex-iso690`,
  `style=iso-numeric` nebo `style=iso-authoryear`)

Statická stránka bez serveru a bez sběru dat; „Moje zdroje“ zůstávají jen v prohlížeči.

## Soubory

| Soubor | Co dělá |
|---|---|
| `index.html`, `style.css` | stránka |
| `app.js` | ovládání formuláře, dohledání, moje zdroje |
| `bib.js` | druhy zdrojů a sestavení záznamu (bez závislosti na stránce) |
| `test/vzorky.mjs` | vzorový záznam od každého druhu → `test/generated.bib`; test nahrání `.bib` |
| `test/preklad.sh` | přeloží vzorky v obou stylech (XeLaTeX + bibtex, jako šablona MP) |

## Test

```sh
node test/vzorky.mjs        # jen vygeneruje test/generated.bib
test/preklad.sh             # + překlad test-numeric.pdf a test-authoryear.pdf
```

Typy bez vlastního ovladače v `biblatex-iso690` (nástroj AI, software, zákon,
norma, datová sada, rozhovor) se zapisují jako `@misc` s polem `howpublished`
(v PDF v hranatých závorkách, např. `[online; AI chatbot]`).
