#!/usr/bin/env bash

mkdir -p ./build
pandoc --citeproc --resource-path=src -s src/manuscript.md -o build/manuscript.pdf