# Dialect

A chemical line notation based on SMILES. For an introduction, see [the blog post](https://depth-first.com/articles/2021/09/22/beyond-smiles/). A [reference implementation](https://github.com/rapodaca/dialect.rs) is in progress on GitHub.

## Goals

The purpose of the manuscript is to fully specify Dialect, a language for molecular serialization. Dialect's compact string representation makes it suitable for the storage, retrieval, and manipulation of molecular structures.

With few exceptions, noted in the manuscript, Dialect is a *subset* of SMILES. In other words, every feature present in Dialect will probably be found in SMILES. The reverse is not true. This form of compatibility means that existing SMILES implementations will generally be capable of reading all Dialect strings. Dialect readers, however, may not be able to read every SMILES string. Dialect is a more restrictive form of SMILES. Reasons to omit a SMILES feature include: ambiguity; erroneous definition; poor return on implementation effort; and obsolescence.

For the purposes of the manuscript, SMILES is defined as the language described by David Weininger in two primary literature sources: a [paper](https://doi.org/10.1021/ci00057a005) and [a book chapter](https://doi.org/10.1002/9783527618279.ch5). Other sources were rejected due to low authority, low accessibility, narrow focus, lack of new matter, or a combination of these factors. This focus simplifies the formidable tasks of defining SMILES, designing a language based on it, comparing differences, and creating tools.

The Dialect core language is closed to extension, with one exception: the addition of new two-character element symbols as soon IUPAC approves them. Ideas for extending Dialect are discussed, but the core language will remain as defined in the manuscript. The primary reason is that SMILES offers nothing in the way of versioning and so neither can Dialect. Allowing an unversionable language to be extended would create many of the same problems Dialect is trying to address.

To ensure maximum compatibility of Dialect-branded readers and writers, certain aspects of implementation are addressed.

## Non-Goals

- to add any feature to SMILES
- to support SMARTS, SMIRKS, Reaction SMILES, or SMILES File compatibility
- to prescribe any particular style of string
- to prescribe or require any form of canonicalization
- to maintain compatibility with any single SMILES implementation (e.g., Daylight Toolkit, OpenEye, or JChem).
- to define a path for base language extensions, other than new element symbols
- to preserve any terminology or concepts used to define SMILES
- to leave any aspect of Dialect, regardless of perceived importance, undefined

## FAQ

- *Will Dialect support multi-center bonding?* No. Dialect is based on the valence bond (VB) model, which views a bond as a feature consisting of two atoms and a nonzero, even electron count drawn equally from each atom. This simplification is key to Dialect's brevity. Any structure compatible with the VB model can be encoded and decoded through Dialect without information loss. Other structures can be encoded and decoded using more capable (and verbose) methods should they become available.

# Building the PDF

Install [Tex](https://www.latex-project.org/get/) and [Pandoc](https://pandoc.org).

On macOS, running Homebrew, this can be accomplished with:

```bash
brew install mactex # takes a long time
brew install pandoc
```

Build the PDF with:

```bash
bin/build.sh
```