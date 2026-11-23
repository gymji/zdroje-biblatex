# Zdroj → BibLaTeX

Webový formulář v češtině, který z údajů o zdroji vytvoří záznam do souboru
`Bibliografie.bib` (BibLaTeX). Je určený studentům, kteří píšou maturitní nebo
seminární práci v LaTeXu (šablona maturitní práce, Overleaf).

**Stránka:** https://gymji.github.io/zdroje-biblatex/

- 20 druhů zdrojů: kniha, kapitola, sborník, článek, časopis, web, encyklopedie,
  zpráva instituce, závěrečná práce, patent, video, hudba, nástroj AI, software,
  zákon, norma, datová sada, rozhovor, jiný zdroj
- dohledání podle DOI (Crossref), ISBN (Google Books, Open Library, Citoid) a adresy
  webové stránky (Wikimedia Citoid — např. Wikipedie, weby univerzit, repozitáře prací)
- kontrola povinných údajů, klíč pro `\cite`, „Moje zdroje“ a stažení celého `.bib`
- nahrání vlastního `.bib`: přehled se stavem každého záznamu, úprava ve formuláři
  (klíč i další pole jako `abstract` zůstanou), neupravené záznamy se stáhnou beze změny
- podobu citace podle ČSN ISO 690 zařídí LaTeX (`biblatex-iso690`,
  `style=iso-numeric` nebo `style=iso-authoryear`)

Statická stránka bez serveru a bez sběru dat; „Moje zdroje“ zůstávají jen v prohlížeči.

## Druhy zdrojů a pole

Povinná pole formulář kontroluje (bez nich záznam označí jako chybný), volitelná
doplňte, pokud je znáte. Tabulka se generuje z `bib.js` příkazem `node test/tabulka.mjs`,
ručně ji neupravujte.

<!-- tabulka:zacatek -->
| Druh zdroje | Typ v `.bib` | Povinná pole | Volitelná pole |
|---|---|---|---|
| Kniha (i e-kniha, manuál, CD/DVD) | `@book` | Autoři (`author`), Název (`title`), Nakladatel / vydavatel (`publisher`), Rok vydání (`year`) | Podnázev (`subtitle`), Vydání (`edition`), Místo vydání (`location`), ISBN (`isbn`), Médium / druh (`howpublished`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Kapitola v knize (autor kapitoly = autor knihy) | `@inbook` | Autoři (`author`), Název kapitoly (`title`), Název knihy / sborníku (`booktitle`), Nakladatel / vydavatel (`publisher`), Rok vydání (`year`) | Vydání (`edition`), Místo vydání (`location`), Strany (`pages`), ISBN (`isbn`) |
| Kapitola ve sborníku / kolektivní monografii | `@incollection` | Autoři kapitoly (`author`), Název kapitoly (`title`), Název knihy / sborníku (`booktitle`), Nakladatel / vydavatel (`publisher`), Rok vydání (`year`) | Editoři (ed.) (`editor`), Místo vydání (`location`), Strany (`pages`), ISBN (`isbn`) |
| Příspěvek z konference | `@inproceedings` | Autoři (`author`), Název příspěvku (`title`), Název sborníku (`booktitle`), Rok vydání (`year`) | Editoři (ed.) (`editor`), Místo vydání (`location`), Nakladatel / vydavatel (`publisher`), Strany (`pages`), ISBN (`isbn`), DOI (`doi`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Článek v časopise (tištěný i online) | `@article` | Autoři (`author`), Název článku (`title`), Název časopisu (`journaltitle`), Rok vydání (`year`) | Podnázev (`subtitle`), Ročník (`volume`), Číslo (`number`), Strany (`pages`), ISSN (`issn`), DOI (`doi`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Celé číslo časopisu | `@periodical` | Název časopisu (`title`), Rok vydání (`year`) | Místo vydání (`location`), Nakladatel / vydavatel (`publisher`), Ročník (`volume`), Číslo (`number`), ISSN (`issn`) |
| Webová stránka / příspěvek na webu | `@online` | Název stránky (`title`), Adresa (URL) (`url`), Datum citování (`urldate`) | Autoři (`author`), Podnázev (`subtitle`), Název webu / sbírky (`organization`), Provozovatel webu (`publisher`), Datum zveřejnění (`date`) |
| Heslo v encyklopedii (i Wikipedie) | `@inreference` | Heslo (`title`), Název encyklopedie (`booktitle`) | Autoři (`author`), Místo vydání (`location`), Nakladatel / vydavatel (`publisher`), Rok vydání (`year`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Zpráva, doporučení, publikace instituce | `@report` | Autoři (`author`), Název (`title`), Vydavatel (instituce) (`publisher`), Rok vydání (`year`) | Podnázev (`subtitle`), Druh dokumentu (`type`), Místo vydání (`location`), Číslo (`number`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Závěrečná práce (maturitní, bakalářská …) | `@thesis` | Autoři (`author`), Název (`title`), Druh práce (`type`), Škola / instituce (`institution`), Rok vydání (`year`) | Podnázev (`subtitle`), Místo vydání (`location`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Patent | `@patent` | Vynálezci (`author`), Název (`title`), Číslo patentu (`number`), Datum zveřejnění (`date`) | Majitel patentu (`holder`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Film, video (i YouTube) | `@movie` | Název (`title`), Rok vydání (`year`) | Autor / režisér / kanál (`author`), Médium / druh (`howpublished`), Místo vydání (`location`), Nakladatel / vydavatel (`publisher`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Hudba, zvukový záznam, podcast | `@music` | Autoři (`author`), Název (`title`), Rok vydání (`year`) | Médium / druh (`howpublished`), Místo vydání (`location`), Nakladatel / vydavatel (`publisher`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Nástroj umělé inteligence (ChatGPT, Claude …) | `@misc` | Firma (tvůrce nástroje) (`author`), Název a verze nástroje (`title`), Rok verze (`year`), Adresa (URL) (`url`), Datum citování (`urldate`) | Médium / druh (`howpublished`) |
| Software, aplikace | `@misc` | Název a verze (`title`), Rok vydání (`year`) | Tvůrce (firma / autoři) (`author`), Médium / druh (`howpublished`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Zákon, vyhláška, nařízení | `@misc` | Stát / vydavatel (`author`), Název předpisu (`title`), Rok vydání (`year`) | Sbírka (`organization`), Médium / druh (`howpublished`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Norma (ČSN, ISO …) | `@misc` | Označení normy (`title`), Rok vydání (`year`) | Název normy (`subtitle`), Místo vydání (`location`), Nakladatel / vydavatel (`publisher`) |
| Datová sada, tabulky dat | `@misc`<br>`howpublished = {online; datová sada}` | Autoři (`author`), Název (`title`), Rok vydání (`year`) | Nakladatel / vydavatel (`publisher`), DOI (`doi`), Adresa (URL) (`url`), Datum citování (`urldate`) |
| Rozhovor, osobní sdělení | `@misc`<br>`howpublished = {osobní rozhovor}` | Kdo poskytl rozhovor (`author`), Téma / název (`title`), Datum rozhovoru (`date`) | Místo vydání (`location`) |
| Jiný zdroj | `@misc` | Název (`title`) | Autoři (`author`), Podnázev (`subtitle`), Médium / druh (`howpublished`), Místo vydání (`location`), Nakladatel / vydavatel (`publisher`), Rok vydání (`year`), Adresa (URL) (`url`), Datum citování (`urldate`) |
<!-- tabulka:konec -->

## Soubory

| Soubor | Co dělá |
|---|---|
| `index.html`, `style.css` | stránka |
| `app.js` | ovládání formuláře, dohledání, moje zdroje |
| `bib.js` | druhy zdrojů a sestavení záznamu (bez závislosti na stránce) |
| `test/vzorky.mjs` | vzorový záznam od každého druhu → `test/generated.bib`; test nahrání `.bib` |
| `test/preklad.sh` | přeloží vzorky v obou stylech (XeLaTeX + bibtex, jako šablona MP) |
| `test/tabulka.mjs` | tabulka povinných/volitelných polí v tomto README (z `bib.js`) |

**Po každé změně** zvyšte číslo verze `?v=…` u `style.css` a `app.js` v `index.html`
a u importu `./bib.js?v=…` v `app.js` (všude stejné), jinak prohlížeče studentů
mohou až 10 minut míchat staré a nové soubory.

## Test

```sh
node test/vzorky.mjs        # jen vygeneruje test/generated.bib
test/preklad.sh             # + překlad test-numeric.pdf a test-authoryear.pdf
```

Typy bez vlastního ovladače v `biblatex-iso690` (nástroj AI, software, zákon,
norma, datová sada, rozhovor) se zapisují jako `@misc` s polem `howpublished`
(v PDF v hranatých závorkách, např. `[online; AI chatbot]`).

## Licence

© 2026 Gymnázium Jírovcova 8, České Budějovice (https://www.jirovcovka.net),
licence [MIT](LICENSE) — volné použití, úpravy i šíření se zachováním údaje o autorovi.
