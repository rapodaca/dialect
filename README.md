# Dialect

**This repository has been replaced by [Balsadoc](https://github.com/metamolecular/balsadoc/) and has been left here for documentation purposes only.**

A compact chemical line notation based on SMILES. For an introduction, see [the blog post](https://depth-first.com/articles/2021/09/22/beyond-smiles/). A [reference implementation](https://github.com/rapodaca/dialect.rs) is in progress on GitHub.

## Goals

The purpose of the manuscript is to fully specify Dialect, a language for molecular serialization. Dialect's compact string representation makes it suitable for the storage, retrieval, and manipulation of molecular structures.

Dialect is grounded in the concept of a *language subset*. A language subset contains some of the features of its parent, but adds none of its own. This means that in principle every feature found in Dialect will also be found in SMILES. The opposite is, however, not true. Existing SMILES implementations should in general be capable of reading all Dialect strings. Dialect readers, however, may not be able to read every SMILES string. As a language subset, Dialect subtracts features from SMILES due to obsolescence, errors in specification, low utility, or ambiguity.

There is no single, widely-recognized SMILES specification, a shortfall that poses barriers to users and developers alike. This problem was resolved through the introduction of *ProtoSMILES*. As described in the manuscript, ProtoSMILES is the language [defined](https://doi.org/10.1002/9783527618279.ch5) by David Weininger in a 2003 book chapter. Because it is based on an authoritative, substantial source, ProtoSMILES is likely to span every feature likely to be considered part of SMILES. Defining Dialect as a subset of ProtoSMILES, rather than "SMILES," bypasses the problem of defining SMILES in the first place.

Dialect is closed to further modification, but open to further extension. Ideas for extending Dialect are discussed, but the core language will remain as defined in the manuscript. The main reason is that ProtoSMILES offers no support whatsoever for versioning, a limitation Dialect must inherit. Allowing an unversionable language to be extended would just create many of the same problems Dialect is trying to address.

To ensure maximum compatibility of Dialect-branded readers and writers, certain aspects of implementation are addressed.

## Non-Goals

- to add any feature to SMILES
- to support SMARTS, SMIRKS, Reaction SMILES, or SMILES File compatibility
- to preserve any aspect of SMILES that is ambiguous, redundant, or self-contradictory
- to prescribe any particular style of string
- to prescribe or require any form of canonicalization
- to maintain compatibility with any single SMILES implementation (e.g., Daylight Toolkit, OpenEye, or JChem).
- to define a path for base language extensions, other than new element symbols
- to preserve any legacy terms or concepts used previously for SMILES
- to leave any aspect of Dialect undefined, regardless of perceived importance

## FAQ

- *Will Dialect support multi-center bonding?* No. Dialect is based on the valence bond (VB) model, which views a bond as a feature consisting of two atoms and a nonzero, even electron count drawn equally from each atom. This simplification is key to Dialect's brevity. Any structure compatible with the VB model can be encoded and decoded through Dialect without information loss. Other structures can be encoded and decoded using more capable (and verbose) methods should they become available.

# Building the PDF

Given [pdflatex](http://www.math.rug.nl/~trentelman/jacob/pdflatex/pdflatex.html) and [BibTex](http://www.bibtex.org) installations, a PDF can be built with:

```bash
./bin/build.sh
```