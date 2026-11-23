#!/bin/sh
# Přeloží test/test.tex se stylem iso-<styl> (numeric, authoryear) → test/test-<styl>.pdf
# Na stroji bez biblatexu nastavte TEXINPUTS/BSTINPUTS na klony biblatex a biblatex-iso690.
set -e
cd "$(dirname "$0")"
node vzorky.mjs
for bib in generated priklady; do
for styl in ${1:-numeric authoryear}; do
  j=test-$styl; [ $bib = priklady ] && j=priklady-$styl
  for k in 1 2 3; do
    [ $k = 2 ] && bibtex $j >/dev/null
    xelatex -interaction=nonstopmode -jobname=$j "\\def\\STYL{iso-$styl}\\def\\BIB{$bib}\\input{test}" >/dev/null || true
  done
  if grep -q '^!' $j.log; then grep -A3 '^!' $j.log; exit 1; fi
  echo "OK: test/$j.pdf"
done
done
