#!/usr/bin/env bash

mkdir -p ./build
pandoc --citeproc --pdf-engine=xelatex --resource-path=src -s src/manuscript.md -o build/manuscript.pdf