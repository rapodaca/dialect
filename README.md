# Dialect

A compact chemical line notation based on SMILES. For an introduction, see [the blog post](https://depth-first.com/articles/2021/09/22/beyond-smiles/). A [reference implementation](https://github.com/rapodaca/dialect.rs) is in progress on GitHub.

## Goals

The purpose of the manuscript is to fully specify Dialect, a language for molecular serialization. Dialect's compact string representation makes it suitable for the storage, retrieval, and manipulation of molecular structures.

With few exceptions, noted in the manuscript, Dialect is a *subset* of SMILES. In other words, every feature present in Dialect will probably be found in SMILES. The reverse is not true. This form of compatibility means that existing SMILES implementations will generally be capable of reading all Dialect strings. Dialect readers, however, may not be able to read every SMILES string. Dialect is a more restrictive form of SMILES. Reasons to omit a SMILES feature include: ambiguity; erroneous definition; poor return on implementation effort; and obsolescence.

More precisely, Dialect is designed to be a language subset of *ProtoSMILES*. ProtoSMILES is the language described by David Weininger in two primary literature sources: a [paper](https://doi.org/10.1021/ci00057a005) and [a book chapter](https://doi.org/10.1002/9783527618279.ch5). Because it is based on authoritative, substantial sources, ProtoSMILES is likely to encompass everything most in the field would consider to be part of SMILES. Designing Dialect as a subset of ProtoSMILES, rather than "SMILES," makes detailed feature comparisons possible without getting bogged down in decades-old discussions of what SMILES is or isn't.

The Dialect core language is closed to extension, with one exception: the addition of new two-character element symbols as soon IUPAC approves them. Ideas for extending Dialect are discussed, but the core language will remain as defined in the manuscript. The primary reason is that ProtoSMILES offers nothing in the way of versioning and so neither can Dialect. Allowing an unversionable language to be extended would create many of the same problems Dialect is trying to address.

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