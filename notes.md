# Notes

These are some notes that currently don't have a good place to live. Most will probably become GitHub issues.

## From the OpenSMILES SourceForge Mailing List

- sulfoxide stereo
  - > C[S@](=O)Cl means C[S@"LP"](O)Cl - that is, the lone pair, oxygen and chlorine appear anticlockwise from the carbon.
  - https://sourceforge.net/p/blueobelisk/mailman/message/26175803/
- isotope 0
  - [Re: [BlueObelisk-SMILES] [S] vs. [0S]](https://sourceforge.net/p/blueobelisk/mailman/message/36153314/)
    - > I once again propose that the specification be changed so that "[0S]" means "undefined" or "unspecified" rather than "isotope of 0".
- configuration
  - maybe not so much unaddressed but rather poorly addressed
  - [\[BlueObelisk-SMILES\] non-tetrahedral chirality](https://sourceforge.net/p/blueobelisk/mailman/message/28279635/)
  - [The SMILES stereochemistry enigma](http://timvdm.blogspot.com/2010/09/smiles-stereochemistry-enigma.html)
    - mentions that the OH group is incorrect, but not why or how to fix it
  - [TB/OH](https://sourceforge.net/p/blueobelisk/mailman/message/34911574/)
- implicit hydrogen
  - [Re: [BlueObelisk-SMILES] Preferred SMILES for hypervalent organic subset atoms](https://sourceforge.net/p/blueobelisk/mailman/message/35698839/)
    - `FIF` allowed, or must it be written `[FIF]`?
- ring closure digits
  - [Re: [BlueObelisk-SMILES] Reuse of bond closure symbols](https://sourceforge.net/p/blueobelisk/mailman/message/36094628/)
    - > 99 open ring closure digits

## Extensions

There are several extensions. Studying them can offer insights into how to define an extension interface.

- [Jmol SMILES and Jmol SMARTS: specifications and applications](https://jcheminf.biomedcentral.com/articles/10.1186/s13321-016-0160-4)
  - superset, so doesn't address any of the problems in OpenSMILEs
  - oligonucleotide with 100 BP
  - proposal: `C%(123)`

## References

- [Names and symbols of the elements with atomic numbers 113, 115, 117 and 118 (IUPAC Recommendations 2016)](https://www.degruyter.com/document/doi/10.1515/pac-2016-0501/html)
- [Improve performance of aromaticity detection for large molecules](https://github.com/rdkit/rdkit/pull/3253)
- [RULES FOR THE NOMENCLATURE OFORGANICHEMISTRY SECTION E:STEREOCHEMISTRY](http://publications.iupac.org/pac/1976/pdf/4501x0011.pdf)
- [Cheminformatics toolkits: a personal perspective](https://www.slideshare.net/)NextMoveSoftware/cheminformatics-toolkits-a-personal-perspective
- [FAIR chemical structures in the Journal of Cheminformatics](https://jcheminf.biomedcentral.com/articles/10.1186/s13321-021-00520-4)