---
title: "Dialect: A Dialect of the SMILES Language"
---

# Abstract

# Introduction

Simplified Molecular Input Line Entry System (SMILES) was first described by Weininger in 1988.[^Weininger88] As a line notation,[^Wiswesser68] SMILES represents molecules as single line character sequences, or strings. SMILES strings can be read and written algorithmically, and can be canonicalized[^Weininger288] to yield unique molecular identifiers.

SMILES has since been widely adopted. Read and write functionalities are routinely supported by popular cheminformatics toolkits, including: Open Babel; RDKit; Chemistry Development Kit; JChem; the Daylight Toolkit; OEChem; and JChem. SMILES encodings can be found in many public-facing databases, including: PubChem; Kegg; ChEBI; the eMolecules Catalog; ZINC; and ChEMBL. Increasingly, raw SMILES strings are being used in both predictive and generative machine learning applications.

Despite its widespread adoption, SMILES remains a language with an incomplete specification. Weininger's 1989 paper either fails to address several crucial points entirely, or addresses them only superficially. Examples include: (1) no discussion of stereochemical configuration; (2) no specific protocol for encoding and decoding "aromatic" features; (3) an incomplete protocol for computing implicit hydrogen count; (4) no formal syntax description; (5) no constraints around quantities such as mass number or charge; (6) several points of ambiguity; and (7) no explicit enumeration of error states.

Additional SMILES documentation is available from the Daylight Theory Manual ("the Manual").[^DaylightTheoryManual]. Maintained by SMILES' corporate sponsor, Daylight Chemical Information Systems, Inc. (Daylight), the Manual further refines the SMILES language specification. The Manual also introduces a few extensions, including one for stereoisomerism. Some points around computing implicit hydrogen count were also addressed.

An implementation of SMILES is available through the Daylight Toolkit.[^DaylightToolkit] Although this implementation could potentially address issues not resolved through documentation, the software's commercial distribution model restricts this use. For several years Daylight operated a web service that could interactively depict SMILES strings,[^DepictWebsite], but has since been decommissioned.

In 2007 a documentation effort that would become known as OpenSMILES began.[^OpenSMILES] OpenSMILES was conceived as "a non-proprietary specification for the SMILES language," and it addressed many of the points left open by previous SMILES documentation efforts. Noteworthy contributions included: the first formal grammar; many refinements around stereochemistry; and introduction of the idea of "standard form." Absent were detailed procedures for assigning and interpreting aromatic features, and a detailed procedure for computing implicit hydrogen count. OpenSMILES also left several points of semantic ambiguity unaddressed.

In 2019 IUPAC announced the SMILES+ initiative.[^SMILESPlus] Noting the limitations of existing SMILES documentation, the SMILES+ effort seeks to "establish a formalized recommended up-to-date specification of the SMILES format." SMILES+ took as its starting point the documentation produced by the OpenSMILES project. Efforts to extend this starting point are in progress online through a public repository,[^SMILESPlusRepo] but no formal recommendation has to date resulted.

The ongoing lack of a comprehensive SMILES documentation suite has caused several problems. First, authors of new SMILES implementations have limited guidance for resolving ambiguities and so must invent their own. Second, maintainers of existing SMILES implementations lack a blueprint for working toward a common feature set. Third, standards bodies draw from a limited set of source material when preparing recommendations. Fourth, a lack of detailed documentation hinders the development of compliance suites, thereby interfering with efforts to validate cross-implementation compatibility. Finally, extensions to SMILES only make sense in the context of a rigorously defined base language.

This situation has persisted long enough that the notion of a SMILES "standard" may not currently be practical. A dozen or more slightly different implementations are now in use. None of them, not even the one developed by Daylight, can be considered a reference standard. SMILES has become a collection of dialects, some of which are better documented than others.

A more practical goal than creating a standard would be to merely document any SMILES dialect in sufficient detail that it could be reduced to a software implementation, a goal that to my knowledge has never been accomplished. Here I describe an attempt to address this problem "Dialect." This paper presents Dialect from three perspectives: as a system for molecular representation; as a text-based language; and as a specification for software intended to communicate chemical structures across organizational and temporal boundaries. 

# Goals, Design, and Tradeoffs

Dialect's purpose is to solve the *molecular serialization* problem. Serialization refers to the process of translating a data structure into a format that can be transmitted over a communication channel for later reconstruction. Serializations utility lies in enabling general-purpose devices and networks to convey complex pieces of domain-specific information. Receiver and recipient may be separated by time, space, or both. Molecular serialization extends the concept of serialization to molecular structure.

Two concerns factor prominently in any serialization scheme: *syntax* and *semantics*. Syntax sets the vocabulary of symbols to be used and how they may be arranged. Semantics set the rules determining what various arrangements of symbols mean. Failure to fully specify syntax can lead to needless loss of data. Failure to fully specify semantics can result in needless data corruption. Semantics in particular play an important role in Dialect due the the inherently complex nature of molecular representations.

Beyond syntax and semantics, a serialization scheme should be useful. Utility in this context follows directly from the scope of supported molecular representations. Constrain this scope too much and the system will cover too few molecules to be interesting. Relax the constraints too much and the system could become verbose, difficult to implement, or both. Dialect aims squarely for the middle ground: a system of molecular representation that is specific enough to yield a compact language, but general enough to cover a large amount of interesting chemical space.

Dialect's molecular representation system is based on four mutually-exclusive components, each of which is constrained as follows:

- *Constitution*. The atoms present in a molecule and how they are connected with each other through bonds. Dialect supports elements having two-letter IUPAC designations and all bonding arrangements available through the valence bond model (as described in detail later).
- *Conformation*. The kind of stereoisomerism resulting from restricted rotation about a bond. Dialect can encode those conformations arising from restricted rotation about double bonds, which includes both alkene and cumulene stereoisomerism.
- *Configuration*. The kind of stereoisomerism resulting from the arrangement of neighboring atoms in three-dimensional space. Dialect supports configurations for tetracoordinate atoms having tetrahedral symmetry.
- *Delocalization*. A type of bonding relationship in which electrons are distributed over two or more bonds, among three or more atoms, or across some combination of atoms and bonds. Dialect supports a limited form of delocalization operating over paths of alternating single and double bonds.

For flexibility, Dialect also supports the atomic "extension" attribute. As will be shown, this attribute can be expressed either as an integer or as a bitmask to enable application-specific functionality.

[FIGURE: Representative Dialect Examples together with Structures]

# Molecular Graph

Dialect's system of representation is based on the *molecular graph* concept.[^Balaban1985] A graph is a data structure comprised of a set of nodes (which map to "atoms") and a set of pairwise relationships between them called edges (which map to "bonds"). A molecular graph is a specialized graph onto which atomic and bonding metadata have been overlaid. Molecular graphs are ubiquitous in cheminformatics, appearing in contexts such as data formats like Chemical Markup Language[^Murray-Rust2011], CDXML[^CDXML], and Molfile[^BIOVIA], as well as in-memory data structures found in cheminformatics toolkits. Like these systems, Dialect augments its underlying graph with node and edge labels.

A Dialect molecule consists of a graph with at least one node and zero or more edges. The "empty molecule", devoid of atoms and bonds, is therefore disallowed. Dialect imposes no upper bound on the number of atoms or bonds. However, practical limitations related to memory, storage, and CPU time will likely limit the size of molecules in practice.

The edges of a molecular graph are defined as a set of unordered pairs of non-identical nodes. This definition has three important consequences. First, *loops* are not allowed. A loop is an edge joining a node to itself. Second, *parallel edges* are disallowed. Edges are said to be parallel if they connect the same two nodes. Third, edges are *undirected*. An undirected edge ascribes no meaning to the order in which its two nodes are given. Thus, the undirected edge between nodes A and B is identical to to the undirected edge between nodes B and A.

A molecular graph contains one or more *connected components*. A connected component is a graph in which any two vertices are connected to each other by at least one path. Dialect places no restriction on the number of connected components, although practical limitations are likely to impose one.

Two enable stereochemical and delocalized bonding features, each node is given two properties. The first is a non-negative integer index (`index`), assigned in the order in which the node was added. The second property is a boolean property (`selected`).

# Constitution

A Dialect molecule is described at the lowest level by its constitution. Constitution consists of a set of atomic nuclei (nodes), a set of pairwise bonding relationships between them (edges), and those attributes needed to associate every valence electron with a specific node or edge. Constitution excludes attributes related to stereochemistry, or any other feature whose attributes extend over more than one atom or bond.

Two attributes characterize an atom's nucleus: `element` and `isotope`. The `element` attribute is an optional one- or two-letter character sequence selected from the set designated by the IUPAC/IUPAP Working Party.[^IUPAC2016] When the Working Party authorizes additional symbols, they will become valid values for the `element` attribute. If the elemental identity of an atom is unknown, its `element` attribute can be omitted. The `isotope` attribute is an optional integer value representing an atom's nuclear mass number, where mass number is the sum of proton and neutron count. Omitting the `isotope` property means that the isotopic composition is unspecified. When present, the lower bound on `isotope` is equal to the atomic number of the element. This restriction renders physically meaningless constructs such as <sup>5</sup>C invalid. If the element attribute is not defined, the lower bound on `isotope` is one.

The atomic `hydrogens` attribute records the number of associated *virtual hydrogens*. A virtual hydrogen is an atom whose presence is recorded, not as a node and edge, but rather as a unit contribution to an integer tally. For example, methane can be represented by a molecular graph having five nodes and four edges. But methane can also be represented as a graph of one node having a `hydrogens` attribute set to four. The `hydrogens` attribute, if present, may assume integer values ranging from zero to nine. Only monovalent hydrogens with unspecified isotopic composition are eligible for virtualization.

Electron counting in Dialect is based on the well-known "valence bond model."[^Lewis1916] This model can most clearly be viewed as a series of assembly events. It starts with a set of atomic nuclei, where each nucleus is associated with an integer electron count. A bond is created by first identifying two nodes. Then, from each node the same positive electron count is deducted, and credited to the new bond's electron count.

[FIGURE: Generalized Valence Bond Electron Counting]

For convenience, Dialect modifies the electron counting protocol described above. Neither nodes nor edges carry an explicit electron count attribute. Instead, edges carry a *formal bond order* attribute, and nodes carry a *formal charge* attribute. Bond order equals electron count divided by two. Formal charge equals the number of electrons gained or lost due to ionizations events outside of bond formation. If no electrons are gained or lost to ionization outside of bond formation, the formal charge equals zero. 

[FIGURE: Dialect's Electron Counting Shorthand]

From these rules follow some important consequences. For example, bond order must be an integer greater than zero. This follows from the bond formation operation itself. The electron count drawn from each atom is *n*, an integer greater than zero. Given bond formation draws an equal number of electrons from each atom, the total number of electrons associated with a bond is 2*n*. By definition, bond order is the bond's electron count divided by two, therefore *n* is the bond order. Fractional, negative, and zero bond orders are all excluded.

Dialect imposes an upper limit of four on formal bond order. The relative scarcity of bond orders greater than three makes this restriction unlikely to meaningfully restrict applicability.

Whereas negative bond order is disallowed, Dialect places no restrictions on *hypervalence*. Hypervalence occurs when an atom participates enough bonding operations to leave it with a negative implied valence electron count. Consider lithium, which possesses one valence electron. Formation of one single bond leaves lithium with zero implied valence electrons. Application of a second bond formation leaves lithium with a zero charge and an implied valence electron count of -1. Such an arrangement may be physically meaningless, but Dialect explicitly supports it. Software using Dialect may or may not reject such species on semantic grounds.

[FIGURE: LiCl2]

# Hydrogen Suppression

\[TODO\]

# Conformation

\[TODO\]

# Configuration

\[TODO\]

# Delocalization Subgraph

\[TODO\]

# Syntax

\[TODO\]

# Reading Dialect

\[TODO\]

# Pruning the Delocalization Subgraph

\[TODO\]

# Writing Dialect

\[TODO\]

# Reference Implementation

\[TODO\]

# Discussion

\[TODO\]

# Conclusion

\[TODO\]

# References

[^Weininger88]: http://pubs.acs.org/cgi-bin/doilookup/?10.1021/ci00057a005
[^Wisweser68]:
[^Weininger288]: http://pubs.acs.org/cgi-bin/doilookup/?10.1021/ci00062a008
[^Weininger03]: https://onlinelibrary.wiley.com/doi/abs/10.1002/9783527618279.ch5
[^DaylightTheoryManual]: https://www.daylight.com/dayhtml/doc/theory/theory.smiles.html
[^DaylightToolkit]: https://www.daylight.com/products/toolkit.html
[^DepictWebsite]: https://www.daylight.com/dayhtml/help/depict-help.html
[^OpenSMILES]: http://opensmiles.org/opensmiles.html
[^SMILESPlus]: https://iupac.org/projects/project-details/?project_nr=2019-002-2-024
[^SMILESPlusRepo]: https://github.com/IUPAC/IUPAC_SMILES_plus
[^Balaban1985]: https://doi.org/10.1021/ci00047a033
[^Murray-Rust2011]: https://doi.org/10.1186/1758-2946-3-44
[^BIOVIA]: https://discover.3ds.com/ctfile-documentation-request-form
[^CDXML]: https://www.cambridgesoft.com/services/documentation/sdk/chemdraw/cdx/IntroCDXML.htm
[^Lewis1916]: https://doi.org/10.1021/ja02261a002
[^IUPAC2016]: https://doi.org/10.1515/pac-2016-0501