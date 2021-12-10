#!/usr/bin/env bash

node ./bin/build-diagrams.js

mkdir -p ./build
pandoc --citeproc --resource-path=src -s src/manuscript.md -o build/manuscript.pdf