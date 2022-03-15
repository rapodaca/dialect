mkdir -p build

cp manuscript.bib build
cp manuscript.tex build
cp -r assets build

cd build

pdflatex manuscript
bibtex manuscript
pdflatex manuscript