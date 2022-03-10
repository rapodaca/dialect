---
title: "Dialect: A Subset of the SMILES Language"
author:
  - "Richard L. Apodaca^[rapodaca@metamolecular.com]"
bibliography: citations.bib
csl: acs.csl
classoption:
header-includes:
  - \usepackage{algorithm2e}
papersize: a4paper
---

# Abstract

# Introduction

Simplified Molecular Input Line Entry System (SMILES) was first described by Weininger in 1988.[@weininger1988] As a line notation,[@wiswesser1968] SMILES represents molecules as single line character sequences, or strings. SMILES strings can be read and written algorithmically, and can be canonicalized[@weininger1989] to yield unique molecular identifiers.

SMILES has since been widely adopted. Read and write functionalities are routinely supported by popular cheminformatics toolkits, including: Open Babel;[@oBoyle2011] RDKit;[@rdkit] Chemistry Development Kit;[@steinbeck2003] JChem Base;[@jchemBase] the Daylight Toolkit;[@daylightToolkit] and OEChem TK.[@oeChemTk] SMILES encodings can be found in many public-facing databases, including: PubChem;[@kim2016] ChEBI;[@degtyarenko2007] ZINC;[@irwin2005] ChEMBL;[@gaulton2012] and Wikipedia.[@wikipedia] Raw SMILES strings have been used extensively in machine learning applications.[@sousa2021] SMILES has also been extended to carry various forms of metadata, as exemplified by Jmol SMILES[@hanson2016], CurleySMILES[@drefahl2011], BigSMILES[@lin2019] and CXSMILES[@cxsmiles].

Despite its many applications, SMILES remains a language with an incomplete specification. Weininger's 1988 paper (referred to herein as "the Paper") leaves the following either fully or incompletely specified: (1) stereochemical configuration; (2) double bond conformation; (3) the meaning handling of "aromatic" features; (4) the computation of implicit hydrogen count, especially as related to aromatic features; (5) formal syntax; (6) constraints on quantities such as mass number and charge; and (7) enumeration of error states.

Earlier descriptions of SMILES were published in various media, although these are not cited by Weininger. An accessible example is a 1987 report to the US Environmental Protection Agency.[@anderson1987] Although the language described in that report shares many features with later descriptions, there are important differences as well.

Since 1988, a few sources have attempted to clarify or revise Weininger's 1988 description of SMILES. A 2003 book chapter by Weininger (referred to herein as "the Book Chapter") addressed some of the limitations of the paper. The Daylight Theory Manual ("the Manual"), a website maintained by SMILES's corporate sponsor, Daylight Chemical Information Systems, Inc. ("Daylight"), recapitulates much of the material in the Paper and the Book Chapter.[@daylightTheory].

In 2007 a documentation effort that would become known as OpenSMILES began.[@openSMILES] OpenSMILES was conceived as "a non-proprietary specification for the SMILES language," and it addressed many of the points left open by previous SMILES documentation efforts. Noteworthy contributions included: the first formal grammar; many refinements around stereochemistry; and introduction of the idea of "standard form." Absent were detailed procedures for assigning and interpreting aromatic features, and a detailed procedure for computing implicit hydrogen count. OpenSMILES also left several points of syntactic and semantic ambiguity unaddressed.

In 2019 IUPAC announced the SMILES+ initiative.[@smilesPlus] Noting the limitations of existing SMILES documentation, the SMILES+ effort seeks to "establish a formalized recommended up-to-date specification of the SMILES format." SMILES+ took as its starting point the documentation produced by the OpenSMILES project. Efforts to extend this starting point are in progress online through a public repository, but no formal recommendation has to date resulted.[@smilesPlusRepo]

The ongoing lack of a comprehensive SMILES documentation suite has caused several problems. First, authors of new SMILES implementations have limited guidance when resolving ambiguities and so must invent them on an ad hoc basis. Second, maintainers of existing SMILES implementations lack a blueprint for working toward a common feature set. Third, standards bodies draw from a limited set of source material when preparing recommendations. Fourth, a lack of detailed documentation hinders the development of compliance suites, thereby interfering with efforts to validate cross-implementation compatibility. Finally, extensions to SMILES only make sense in the context of a rigorously defined base language.

The lack of a detailed, comprehensive, and universally-applied SMILES specification also hampers broader data integrity efforts. The FAIR Guiding Principles [@wilkinson2016] identify four qualities essential for extracting maximum utility from published scholarly data: *F*indability; *A*ccessibility; *I*nteroperability; and *R*eusability. Interoperability in particular requires that "(meta)data" use a formal, accessible, shared, and broadly applicable language for knowledge representation." Although SMILES may be a shared, accessible, and broadly applicable language, its formal underpinnings leave room for improvement.

This situation has persisted long enough that the notion of a SMILES "standard" may not currently be feasible. A dozen or more slightly different implementations are now in use. None of them can be considered a reference standard. Some have introduced extensions not recognized by the others, contributing to language "drift" while compounding the already formidable difficulties faced by implementors. Others claim SMILES compatibility while ignoring certain aspects of written documentation. The Daylight implementation, like some of the others, is distributed under a non-Open Source license that restricts use.[@daylightToolkit] For several years Daylight operated a publicly-accessible web service based on its toolkit that depicted SMILES strings, but it has since been decommissioned.[@depict] Although SMILES may underpin modern chemical information exchange, the foundations of this system are weathered and showing signs of stress.

This paper attempts to resolve these these issues with Dialect, a fully-specified subset of the SMILES language. The following sections present Dialect from three perspectives: as a compact system for molecular representation; as a text-based language; and as a specification for software intended to convey chemical structure information across organizational and temporal boundaries.

# Goals, Design, and Tradeoffs

Dialect's purpose is to solve the *molecular serialization* problem. Serialization refers to the process of translating a data structure into a format that can be transmitted over a communication channel for later reconstruction. Serializations utility lies in enabling general-purpose devices and networks to convey complex pieces of domain-specific information. Receiver and recipient may be separated by time, space, or both. Molecular serialization extends the concept of serialization to molecular structure.

Two concerns factor prominently in any serialization scheme: *syntax* and *semantics*. Syntax sets the vocabulary of symbols to be used and how they may be arranged. Semantics set the rules determining what various arrangements of symbols mean. Failure to fully specify syntax can lead to needless loss of data. Failure to fully specify semantics can result in needless data corruption. Semantics in particular play an important role in Dialect due the the inherently complex nature of molecular representations.

Beyond syntax and semantics, a serialization scheme should be useful. Utility in this context follows directly from the scope of supported molecular representations. Constrain this scope too much and the system will cover too few molecules to be interesting. Relax the constraints too much and the system could become verbose, difficult to implement, or both. Dialect aims squarely for the middle ground: a system of molecular representation that is specific enough to yield a compact language, but general enough to cover a large amount of interesting chemical space.

Dialect's molecular representation system is based on four mutually-exclusive components, each of which is constrained as follows:

- *Constitution*. The atoms present in a molecule and how they are connected with each other through bonds. Dialect supports elements having two-letter IUPAC designations and all bonding arrangements available through the valence bond model (as described in detail later).
- *Conformation*. The kind of stereoisomerism resulting from restricted rotation about a bond. Dialect can encode those conformations arising from restricted rotation about double bonds, which includes both alkene and cumulene stereoisomerism.
- *Configuration*. The kind of stereoisomerism resulting from the arrangement of neighboring atoms in three-dimensional space. Dialect supports configurations for tetracoordinate atoms (those attached to four neighbors) having tetrahedral symmetry.
- *Delocalization*. A type of bonding relationship in which electrons are distributed over two or more bonds, among three or more atoms, or across some combination of atoms and bonds. Dialect supports a limited form of delocalization operating over paths of alternating single and double bonds.

To support uses in fields other than organic chemistry, Dialect supports the atomic "extension" attribute. This enables the association of an atom or a group of atoms with arbitrary metadata.

![Representative Dialect Examples with Structures](svg/placeholder.svg)

# Molecular Graph

Dialect's system of representation is based on the *molecular graph* concept.[@balaban1985] A graph is a data structure comprised of a set of nodes (which map to "atoms") and a set of pairwise relationships between them called edges (which map to "bonds"). A molecular graph is a specialized graph onto which atomic and bonding metadata have been overlaid. Molecular graphs are ubiquitous in cheminformatics, appearing in contexts such as data formats like Chemical Markup Language[@murrayrust2011], CDXML[@cdxml], and Molfile[@ctfileFormats], as well as in-memory data structures found in cheminformatics toolkits. Like these systems, Dialect augments its underlying graph with node and edge labels.

A Dialect molecule consists of a graph with zero or more nodes and zero or more edges. The "empty molecule", devoid of atoms and bonds, is allowed. Dialect imposes no upper bound on the number of atoms or bonds. However, practical limitations related to memory, storage, and CPU time will likely limit the size of molecules in practice.

The edges of a Dialect molecular graph are defined as a set of unordered pairs of non-identical nodes. The practical consequences of this are threefold. First, *loops* are not allowed. A loop is an edge joining a node to itself. Second, edges are *undirected*. An undirected edge is equivalent to another edge whose terminals are swapped. An undirected edge between nodes A and B is therefore identical to an undirected edge between nodes B and A. Third, *parallel edges* are disallowed. Edges are said to be parallel if they connect the same two nodes.

A molecular graph contains one or more *connected components*. A connected component is a graph in which any two vertices are connected to each other by at least one path. Dialect places no restriction on the number of connected components, although practical limitations are likely to impose one.

# Data Model

Dialect uses several abstractions collectively known as the *data model*. The data model defines data types and relationships between them for the purpose of lossless molecular representation.

The data model is expressed in terms of a small set of *primitives*. A primitive is an irreducible data type. The following table enumerates Dialects primitives.

| Name | Description | Values |
| --- | --- | --- |
| `Option<Type>` | Optional value | `None`, `Type` |
| `Index` | Unsigned integer | 0...2<sup>32</sup> |
| `Ten` | Integer count | 0..10 |
| `PlusMinusTen` | Integer count | -9...10 |
| `Thousand` | Integer count | 0...1000  |
| `Element` | IUPAC-approved element symbol | `Ac`, `Ag`, `Al`, ... `Zn` |
| `HydrogenCount` | Hydrogen count | `Implicit`, `Ten`               |
| `Configuration` | Configurational descriptor  | `Clockwise`, |
|                 |                             | `Counterclockwise` |
| `Direction`     | Conformational descriptor   | `Up`,  |
|                 |                             | `Down` |
| `boolean` | Boolean | `true`, `false` |
: Data Model Primitives

The following table defines atomic attributes. Not all combinations of values ("atomic state") are valid. Implementations must ensure either the impossibility of an invalid state, or an error condition in the event that one is created.

| Attribute | Description | Type  | Default  |
| --- | --- | --- | --- |
| `index` | A unique identifier | `Index` | - |
| `isotope` | Sum of proton and | `Option<Thousand>` | `None` |
|           | neutron counts    |                    |        |
| `element` | Elemental symbol | `Option<Element>` | `None` |
| `hydrogens` | Hydrogen count | `HydrogenCount` | 0 |
| `configuration` | Configurational |`Option<Configuration>` | `None` |
|                 | descriptor | | |
| `charge` | Formal charge | `PlusMinusTen` | 0 |
| `extension` | Application | `Option<Thousand>` | `None` |
| | -specific data | | |
| `selected` | Whether the atom | `boolean` | `false` |
|            | is selected |          |           |         |
: Atomic Attributes

Three restrictions apply to atomic state:

1. The value of `index` must be unique over the molecular graph.
2. If `hydrogens` equals `Implicit`, then `isotope`, `configuration`, `charge`, and `extension` must equal their default values. Furthermore, `element` must equal one of `B`; `C`; `N`; `O`; `P`; `S`; `F`; `Cl`; `Br`; `I`.
3. If `selected` equals `true`, then `element` must equal one of: `C`; `N`; `O`; `P`; or `S`.

The following table enumerates the attributes associated with bonds.

| Attribute | Description | Type | Default |
| --- | --- | --- | --- |
| `index` | A unique identifier | `Index` | - |
| `source` | Index of source | `Index` | - |
|          | Atom | | |
| `target` | Index of target | `Index` | - |
|          | Atom | | |
| `order`  | Bond order | `Three` | 1 |
| `elided` | Whether the bond | `boolean` | `false` |
|          | is elided. | | |
| `direction` | Conformational descriptor | `Option<Direction>` | `None`
: Bond Attributes

The following restrictions apply to bond state:

1. The value of `index must be unique over the molecular graph.
2. The `source` and `target` attributes must reference valid atomic `index` attributes.
3. If `direction` is non-default (any value other than `None`), `order` must equal 1.
4. If the value of `elided` is `true`, the values of `order` and `direction` must equal 1 and `None`, respectively.

The data model provides a link between syntax and semantics. Dialect-compatible software may, of course, use any suitable internal data model. Dialect implementations must, however, ensure that their internal data model is consistent with the one provided here.

# Constitution

A Dialect molecule is described at the lowest level by its constitution. Constitution consists of a set of atomic nuclei (nodes), a set of pairwise bonding relationships between them (edges), and those attributes needed to associate every valence electron with a specific node or edge. Constitution excludes attributes related to stereochemistry, or any other feature whose attributes extend over more than one atom or bond.

Two attributes characterize an atom's nucleus: `element` and `isotope`. The `element` attribute is an optional one- or two-letter character sequence selected from the set designated by the IUPAC/IUPAP Working Party.[@iupac2016] When the Working Party authorizes additional symbols, they will become valid values for the `element` attribute. If the elemental identity of an atom is unknown, its `element` attribute can be omitted. The `isotope` attribute is an optional integer value representing an atom's nuclear mass number, where mass number is the sum of proton and neutron count. Omitting the `isotope` property means that the isotopic composition is unspecified. When present, the lower bound on `isotope` equals one. This constraint leaves room for physically meaningless negative implied neutron count as in, for example, <sup>5</sup>C. The lower bound for isotope applies even if the `element` attribute is not defined.

The atomic `hydrogens` attribute records the number of associated *virtual hydrogens*. A virtual hydrogen is an atom whose presence is recorded, not as a node and edge, but rather as a unit contribution to an integer tally. For example, methane can be represented by a molecular graph having five nodes and four edges. But methane can also be represented as a graph of one node having a `hydrogens` attribute set to four. The `hydrogens` attribute, if present, may assume integer values ranging from zero to nine. Only monovalent hydrogens with unspecified isotopic composition are eligible for virtualization.

The two remaining constitutional attributes support *electron counting*. The purpose of electron counting is to ensure that every valence electron, whether bonding or nonbonding, can be associated with either an atom or a bond. Accurate electron counting is crucial for any molecular representation system given their influence on charge, bond order, and mass.

Electron counting in Dialect is based on the well-known *valence bond model* (VB Model).[@lewis1916] Although not commonly considered as such, the VB model can be thought of as an algorithm for molecular assembly. The perspective is especially useful given that Dialect itself can be viewed as a programming language for molecular assembly.

A simplified algorithm for electron counting can be summarized as follows. A molecular graph starts as a set of atoms, where each atom consists of a nucleus (as described above) and an integer electron count equal to the atomic number of the atom's element. Two nodes (nuclei) are selected as the terminals of a bond. From each atom, the same positive electron count is deducted. The total electron count deducted from each atom is simultaneously credited to the bond's electron count. For example, if each atom contributes one electron to a bond, then the bond's electron count will increment by two.

![Generalized Valence Bond Electron Counting. Two unconnected nodes are chosen for bonding (left). One electron is subtracted from each atom, and both electrons are added to the bond's count (right).](svg/placeholder.svg)

For convenience, the actual model used by Dialect differs slightly from the above description. Neither nodes nor edges carry an explicit electron count attribute. Instead, edges carry a `bond_order` attribute, and nodes carry a `charge` attribute. Bond order equals electron count divided by two. Formal charge equals the number of electrons gained or lost due to ionizations events outside of bond formation. Gaining an electron decrements the `charge` attribute, whereas losing an electron increments it. If no electrons are gained or lost to ionization outside of bond formation, the formal charge equals zero. 

![Electron counting shorthand. Rather than explicit electron counts, atoms and bonds possess charge and order attributes. The atomic charge attribute captures deviations from generalized counting.](svg/placeholder.svg)

From these rules follow some important consequences. For example, bond order must be an integer greater than zero. This follows from the definition of bond formation. The electron count deducted from each atom is *n*, an integer greater than zero. Given bond formation deducts an equal number of electrons from each atom, the total number of electrons associated with the newly-formed bond is 2*n*. By definition, bond order is the bond's electron count divided by two, therefore *n* is the bond order. Fractional, negative, and zero bond orders are all disallowed by Dialect for this reason.

Dialect imposes an upper limit of three on formal bond order. The relative scarcity of bond orders greater than three in molecules conforming the the VB Model makes this restriction unlikely to meaningfully restrict applicability.

Whereas negative bond order is disallowed by definition, Dialect places no restrictions on *hypervalence*. Hypervalence occurs when an atom undergoes enough bonding operations to leave it with a negative implied valence electron count. Consider lithium, which possesses one valence electron. Formation of one single bond leaves lithium with zero implied valence electrons. Application of a second bond formation leaves lithium with a zero charge and an implied valence electron count of -1. Such an arrangement may be physically meaningless, but Dialect explicitly supports it. Software using Dialect may or may not reject such species for semantic reasons.

![Hypervalence. Depletion of atomic electron count through excessive bonding. Hypervalent atoms are valid by default, although chemically nonsensical.](svg/placeholder.svg)

# Bond Elision

To promote compact string representations, Dialect supports *bond elision*. An single bond may be elided by marking it as such. An elided bond nevertheless has a bond order of one. A bond may be elided for one of two reasons. First, elided bonds are not written during serialization, allowing for increased information density. The second reason relates to a feature described in the next section.

# Delocalization Subgraph

A molecular representation based solely on the valence bond model can yield artifacts resulting from *delocalization induced molecular equality* (DIME). DIME occurs in a molecular graph when one or more equivalent representations exist, each one differing from the original only in the distribution of single and double bonds. DIME may be recognized as "resonance" or "aromaticity," but those terms are avoided here due to their ambiguity.[@randic2018;@kerber2006]

![Delocalization-induced molecular equality (DIME). Two chemically equivalent molecular graphs differ on the basis of delocalization.](svg/placeholder.svg)

DIME can interfere with *canonicalization*, or the selection of a single representation for a molecular graph. The presence of multiple equivalent molecular graphs differing only in the placement of single and double bonds complicates selection rules and invariants, which must be adapted to account for the artificial asymmetry.

To eliminate DIME and thereby streamline canonicalization, Dialect representations support a *delocalization subgraph* (DS). A DS is a possibly empty node-induced subgraph of a molecular graph. The membership of a DS is drawn from the set of atoms and bonds that participate in DIME within a given molecular graph.

A non-empty DS must possess a *perfect matching*. A matching is a subgraph in which no two edges share a common node. Equivalently, a matching is a subgraph in which all nodes have degree one. A perfect matching includes all the nodes of its parent graph. Every atom added to a DS must therefore be part of a perfect matching over it.

![Perfect Matching. A subgraph with all of the nodes of its parent, but in which all nodes have degree one.](svg/placeholder.svg)

Only some atoms are eligible for inclusion (or "selection") in a DS. Atoms whose `element` values are one of `C`, `N`, `O`, `P`, or `S`, or `None`, may be selected &mdash; regardless of cycle membership. Atoms having other `element` values must not be selected.

To support the construction of a DS, eligible atoms carry a `selected` boolean attribute. Setting this attribute to `true`, adds the atom to the DS. Otherwise, the atom is excluded from the DS. All ineligible atoms are excluded from the DS.

A bond will be added to the DS only if both of the following conditions are met: (1) both terminals are selected; and (2) the bond itself is elided. No other bond will be added to the DS. This behavior makes it possible to exclude a specific bond from the DS by making its bond order explicit.

A filled DS can be emptied through a two-step process of *deselection*. First, a perfect matching over the DS is found. Next, each matched edge is replaced by a double bond. Because the presence of a filled DS implies a perfect matching over it, kekulization always succeeds. A popular algorithm for matching, the Edmunds "blossom algorithm"[@edmunds65] has a time complexity of O(|E|V|2), where |E| is the number of edges and |V| is the number of nodes. Although more efficient algorithms are known, they are either much more difficult to implement or lack generality.

![Deselection. Unsetting the atomic selected flag with simultaneous promotion of matching bonds.](svg/placeholder.svg)

The opposite operation can be accomplished with a *selection algorithm*. A selection algorithm selects two or more eligible atoms, thereby adding them to the DS. The only requirement for a selection algorithm is that the resulting DS must have a perfect matching. Depending on the application, other criteria may be applied. For example, a selection algorithm can restrict candidate atoms to those found in cycles. Electron-counting techniques can also be introduced to approximate the chemical concept of "aromaticity." A double bond between two selected atoms may or may not be elided, depending on the application.

![Selection Algorithm. Those atoms with bonds contributing to DIME are added to the delocalization subgraph.](svg/placeholder.svg)

# Implicit Hydrogens and Subvalence

In addition to virtual hydrogen count, Dialect supports a second form of hydrogen suppression called *implicit hydrogens*. Like a virtual hydrogen, an implicit hydrogen is monovalent, has only default attributes, and is present as an integer tally associated with a particular atom. But unlike a virtual hydrogen, the presence of an implicit hydrogen can only be deduced through computation. Implicit hydrogens are an integral yet invisible component of many molecular graphs.

To support implicit hydrogen counting, Dialect uses the concept of *valence*. Valence is a non-negative integer computed as the sum of bond orders at a given atom. Single bonds contribute one to the tally, double bonds two, and triple bonds three. Every other bond contributes one, as does each virtual hydrogen. For example, the valence of a methyl carbon having a `hydrogens` attribute of three is four. In contrast, the valence of a methyl carbon with a `hydrogens` attribute of `Implicit` is one.

Only some atoms are eligible for implicit hydrogen counting. These are called *eligible atoms*. An atom becomes eligible by fulfilling two requirements: (1) its `hydrogens` attribute equals `Implicit`; and (2) its `element` attribute is associated with at least one *default valence*.

A default valence is a value associated with an element that represents the number of hydrogens that can be attached to an isolated atom. Table 1 lists those elements possessing at least one default valence. All other elements have no default valences. The target valence of 4 for carbon, for example, means that a fully-saturated carbon atom will be bound to four hydrogen atoms. Likewise, a fully-saturated oxygen atom will be bound to two hydrogen atoms. However, iron has no default valences. Some elements such as nitrogen have multiple target valences. In these cases, multiple saturated forms are possible. For example, nitrogen has the target valences three and five. Both ammonia and nitrogen pentahydride (NH~5~) are fully saturated forms of nitrogen according to Table 1.

| Element | Target<br>Valence |
| :-----: | :------------: |
|   B     |       3        |
|   C     |       4        |
|   N     |      3,5       |
|   O     |       2        |
|   F     |       1        |
|   P     |      3,5       |
|   S     |     2,4,6      |
|   Cl    |       1        |
|   Br    |       1        |
|   I     |       1        |
: Target Valences

Given one or more default valences, *subvalence* can be computed. Subvalence is the number of hydrogens that can be added to an eligible atom without exceeding the lowest possible default valence. If no default valence less than a default valence exists, then the subvalence is zero. The subvalence for an eligible atom (`a`) can be computed with Algorithm 1.

\begin{algorithm}[H]
  \SetKwInOut{Input}{input}
  \SetKwInOut{Output}{output}
  \SetKwFunction{BondOrderSum}{BondOrderSum}
  \SetKwFunction{TargetValences}{TargetValences}
  \caption{Compute implicit hydrogen count}
  
  \Input{An eligible atom $a$}
  \Output{The subvalence of $a$}
  \Begin{
    $v \leftarrow$ Valence($a$)\;
    $T \leftarrow$ TargetValences($a$)\;
    \For{$t \in T$}{
      $d \leftarrow t-v$\;
      \If{$d >= 0$}{
        \Return{$d$}\;
      }
    }
    \Return{$0$}\;
  }
\end{algorithm}

The algorithm accepts an eligible atom `a` as input and returns its subvalence. First, the valence (sum of bond orders) for `a` is computed. Next, the ordered list of target valences (`T`) is obtained from Table 1. For each target valence (`t`), the difference (`d`) between `t` and `v` is computed. If this difference is non-negative, `d` is returned as the implicit hydrogen count. If no suitable target valence can be found, zero is returned.

Consider an isolated atom having a `symbol` of "N" and a `hydrogens` attribute of `Implicit`. The atom's bond order sum is zero. Its default valences are 3 and 5. The difference `d` is found to be three (3 - 0). Therefore, subvalence of this atom is three.

The carbonyl carbon atom of acetaldehyde illustrates the effects of substitution and multiple bonding. This atom uses implicit hydrogen counting (`hydrogens` equals `Implicit`). Valence is therefore three (2 + 1). The first and only default valence for carbon is four. Subtracting three from four yields one, which is returned as the atom's subvalence.

The phosphorous atom in phosphorous acid (H3PO3) illustrates the use of Algorithm 1 for atoms with multiple target valences. Given a `hydrogens` attribute of `Implicit`, the atom's bond order sum is four (2 + 1 + 1). The first target valence is 3, but subtracting that value from four yields a negative number (-1). Continuing to the next default valence, 5, a difference of 1 is obtained. Therefore, the subvalence of the phosphorous-bearing atom is reported as 1.

The subvalence of some atoms exceeds the largest default valence. In these cases, subvalence is reported as zero. Consider sodium perchlorate (NaClO4). The chlorine atom has a bond order sum of seven (2 + 2 + 2 + 1). From Table 1, the only target valence for chlorine is one. Subtracting seven yields a negative number (-6). Therefore, the subvalence is reported as zero.

The subvalence for ineligible atoms is zero.

# Computing Implicit Hydrogen Count

For unselected atoms, implicit hydrogen count equals subvalence. Consider an oxygen atom with a `hydrogens` attribute of `Implicit`. Subvalence equals two and so does implicit hydrogen count. However, an oxygen atom with a `hydrogens` attribute equal to one will have an implicit hydrogen count of zero.

For selected atoms, a modified procedure is used. If subvalence is greater than zero, then the implicit hydrogen count equals subvalence minus one. This subtraction models the unpaired electron that would would be required for delocalized bonding, or localized bonding if the atom were deselected. Consider a selected carbon atom in benzene whose `hydrogens` attribute equals `Implicit`. Subvalence equals two, so implicit hydrogen count equals one (2 - 1).

A selected atom with a `hydrogens` attribute of `Implicit` and subvalence equal to zero has an implicit hydrogen count of zero. The semantics of such a state may seem suspect. If an atom has no unpaired electrons, how can it participate in delocalized bonding? As will be explained in more detail later (Pruning), this situation can arise through gratuitous atom selection. Returning zero avoids miscalculation of the implicit hydrogen count.

An implicit hydrogen count may or may not correlate with chemical intuition or experimental data. Consider the phosphorous-bearing atom of hypophosphorous acid (HOP(O)H2). We might expect the implicit hydrogen count to equal the experimentally-determined hydrogen count (2). However, the subvalence for the phosphorous atom is found to be three (2 + 1 - 3). The implicit hydrogen count is therefore zero (3 - 3) rather than the expected two. Similar atoms must be encoded using virtual hydrogens.

![Implicit hydrogen count. The number of hydrogens is set algorithmically.](svg/placeholder.svg)

# Atom Index

To support the assignment and interpretation stereochemical features, each node is assigned a sequential, unique, non-negative integer `index` attribute ("index"). The value of an atom's index equals zero for a molecular's graph's first atom. The index for each subsequently-added atom equals the order (node count) of the graph prior to the addition. For example, the index for the second atom is one, the index for the third atom is two, and so on. The maximum value of an atomic index is 2<sup>32</sup> - 1.

Indexes impose an ordering over the atoms in a molecular graph. An atom with an index less than another atom is said to *precede* it. An atom with an index grater than another atom *succeeds* it. No special significance is ascribed to the atom whose index is zero, except that every other atom succeeds it.

# Conformation

The second major component of molecular representation in Dialect is *conformation*. Conformation is a rotational restriction about one or more bonds. Dialect limits conformation to just one of many possible types: rotational restrictions occurring at individual double bonds.

Organic chemistry uses the parity descriptors *entgegen* (*E*) and zusammen (*Z*) to label conformational parity. This system is based on prioritization of the atoms neighboring the double bond. One pattern of priority yields the *E* parity, and the other yields *Z*. Conveniently, the parity descriptor can be localized at the double bond.

![Traditional conformational stereodescriptors.](svg/placeholder.svg)

Dialect takes a different approach by introducing *partial parity bonds* (PPB). As the name implies, a PPB expresses a portion of the parity characterizing a conformationally-restricted double bond. Constructing the full parity requires the double bond itself, and at least two PPBs. At least two PPBs must flank the double bond.

![Partial parity bond. Bond conformational parity is distributed over two or more bonds.](svg/placeholder.svg)

To support this system, each bond carries a nullable `state` attribute. When present, the `state` attribute may assume one of the two values `Up` or `Down`. These values refer to a geometrical model in which the two terminals of a double bond and their neighbors are assigned local relative coordinates in a plane. The double bond terminals are placed on the x-axis such that the terminal with the lowest `index` attribute appears to the left of the terminal with the higher atomic `index` attribute. These terminals are designated "left terminal" and "right terminal," respectively. Each neighbor of a terminal is then assigned a relative coordinate based on the `index` attribute and the state of its PPB bond.

![Interpreting partial parity bonds.](svg/placeholder.svg)

The following procedure assigns a relative coordinate to a neighbor of the left terminal. First, determine the relative order of the indexes for the neighbor and the left terminal. If the neighbor succeeds the left terminal, place the neighbor to the upper left of the terminal if the bond state is `Up`, or to the lower left if the bond state is `Down`. If the terminal succeeds its neighbor, reverse these assignments.

An analogous procedure assigns relative coordinates to a neighbor of the right terminal. If a neighbor succeeds the right terminal, place the neighbor to the upper right given an `Up` state, or to the lower right given a `Down` state. Reverse these assignments if the right terminal succeeds its neighbor.

In some cases the placement of a terminal neighbor can be deduced from the placement of a sibling, without the presence of an explicit PPB. For example, a left terminal has two neighbors, but only one of them uses a PPB. The neighbor with the PPB can then be placed explicitly. Doing so allows the remaining neighbor without a PPB to be placed as well. For example, if the neighbor of a left terminal is placed in the upper left quadrant, then the sibling without a PPB can only occupy the lower left quadrant.

![Implied neighbor placement. Bond states can be omitted when inferrable.](svg/placeholder.svg)

The assignment of relative coordinates to both terminals and all neighbors yields a double bond conformation.

Consider the encoding of PPBs for (*E*)-2-butene. Assume that indexes are assigned sequentially from left to right and the goal is to arrive at a trans (or anti) substituent orientation. Begin by placing the two double bond terminals on the x-axis. Left and right terminals are placed on the basis of succession. The left terminal (Atom 1) succeeds its neighbor (Atom 0), which should be placed in the lower-left quadrant. To achieve this, assign a PPB state of 'Up'. The right terminal (Atom 2) precedes its neighbor (Atom 3), which should be placed in the upper-right quadrant. To active this, assign a PPB state of 'Up'.

![Assigning partial parity bonds to *trans*-2-butene.](svg/placeholder.svg)

In a similar manner assigned PPBs can be decoded. The process starts by placing Atom 1 to the left of Atom 2 along the x-axis. The PPB between the left terminal and its neighbor (Atom 0) uses the `Up` state. The neighbor precedes the left terminal, so Atom 0 should be placed in the lower-left quadrant. The PPB between the right terminal and its neighbor (Atom 3) uses the `Up` state. The neighbor (Atom 3) succeeds the right terminal (Atom 2). Therefore, Atom 3 is placed in the upper right quadrant. This results in the expected conformation (*E*).

The above procedures assume that all PPBs are expressed in *normal form*. In normal form, a PPB's source precedes it target. In other words, `source` is less than `target`. If a PPB is not in normal form, it must be *inverted* before quadrants can be assigned. Inversion swaps the values of `source` and target attributes while simultaneously toggling the `state` attribute. Inversion occurs in two contexts: conjugated polyenes and cycles. In the case of polyenes, the same PPB carries partial conformation for at least two different double bond systems. In the case of cycles, non-normal PPBs can be generated at bonds forming cycles. However, readers and writers must be capable of inverting PPBs wherever they appear.

Consider (*E*)-2-butene. The PPB spanning atoms 0 and 1 will typically be encoded as the tuple `(0, 1, Up)` because this orientation tracks the order of atom index. However, the PPB can be equivalently encoded as the tuple `(1, 0, Down)`. Before this representation can be used, it must first be inverted into the equivalent form represented by the tuple `(0, 1, Up)`.

![Partial parity bond inversion. State must be inverted for bonds not expressed in normal form.](svg/placeholder.svg)

The distributed nature of conformational encoding means that several additive error states are possible:

- Overspecification. This state occurs when two or more PPBs share a common ancestor and simultaneously use the same parity, thus placing multiple neighbors into the same quadrant.
- Underspecification. A required and non-deducible PPB is absent. This state occurs when a double bond terminal connects to at least one neighbor through a PPB, but the terminal's mate does not.
- Misspecification. A PPB is used between atoms lacking at least one double bond.

A reader that detects one of these error conditions must abort the molecular graph being read and report the error state. It is possible for a conformation to be both overspecified and underspecified.

![Error bond states. Because conformational descriptions are defined over three or more bonds, a variety of error states are possible.](svg/placeholder.svg)

An exception to the underspecification rule applies in the case of conjugated polyenes. In this case a double bond with a terminal bearing a PPB does not require the opposing terminal to also bear a neighbor with a PPB. If the opposing terminal lacks neighbors, no error is generated and reading continues normally. If the opposing terminal has at least one neighbor, the bond to it need not be a PPB. In either case the conformation of the double bond in question remains undefined.

![Error state exceptions. Conjugated dienes sharing a common PPB can lead to exceptional cases.](svg/placeholder.svg)

Given that conformational specification is distributed over three or more bonds, some conformations will be difficult or possible to represent. Cyclooctatetraene offers an example. Although the (*E*, *E*, *E*, *E*) conformation is accessible, the (*Z*, *E*, *E*, *E*) conformation is not. This problem arises because the same PPB encodes a partial conformation of two different double bonds.

![Cyclooctatetraene. Some double bond conformations are not expressable.](svg/placeholder.svg)

# Configuration

The third major element of molecular representation is *configuration*. Configuration is the three-dimensional arrangement of neighbors about an atom. Dialect limits configuration to the special case of an atom with exactly four substituents placed at the vertexes of a tetrahedron. Here, "substituent" means an atomic neighbor; lone electron pairs are not considered substituents. One of the four substituents may be a virtual hydrogen.

A configuration is comprised of two components: an ordering of bonds to a central atom; and a *configurational descriptor*. A configurational descriptor is a template for the relative three-dimensional positioning of neighbors about a central atom. Dialect supports two configurational descriptors: `TH1` and `TH2`. For reasons that will soon become clear, these descriptors are also known as "clockwise" and "counterclockwise," respectively.

The descriptors `TH1` and `TH2` restrict neighboring atoms to the vertices of a tetrahedron whose center is the central atom. First, the mate of the first bond to the central atom is placed at an arbitrary vertex. Then shift the frame of reference by sighting along the first bond from the neighbor toward the central atom. Finally, arrange the remaining neighbors using the ordering of bonds to the central atom. For the `TH1` descriptor, use a counterclockwise distribution. For the `TH2` descriptor, use a clockwise distribution.

![Configurational descriptor. Configuration is either encoded or reconstructed using the same model.](svg/placeholder.svg)

If an atom bears one virtual hydrogen and three substituents, a modified procedure is used. The virtual hydrogen is first placed at an arbitrary vertex of the tetrahedron. The tetrahedron is then oriented along the axis pointing from the virtual hydrogen to the center. Neighbor atoms are then distributed in a counterclockwise (`TH1`) or clockwise (`TH2`) pattern to the remaining vertices.

![Configurational descriptor with one virtual hydrogen. In this case, hydrogen assumes the role of the first substituent.](svg/placeholder.svg)

The association of a configurational descriptor with an atom implies a neighbor count of either four if no virtual hydrogens are present, or three if exactly one virtual hydrogen is present. In any other context, the use of a configurational descriptor is considered an error.

This restriction places some constraints around the use of configuration. For example, the use of `TH1` and `TH2` descriptors with the elongated tetrahedron of allenes and other cumulenes might seem valid. However, this use is invalid because the central atom lacks four substituents. Similarly, it is invalid to consider lone pairs for placement within the tetrahedral template. Chiral sulfoxides represent a class of molecules in which such features are present.

![Invalid uses of configurational descriptors. Only configuration about four-coordinate tetrahedral atoms is supported.](svg/placeholder.svg)

A configurational descriptor may be applied without regard to bond type. In other words, single, double, triple, and partial parity bond types can all be present. The only requirement that must be satisfied is four substituents or, equivalently, three substituents and a virtual hydrogen.

It is sometimes useful to manipulate a configuration in a way that preserves the relative three-dimensional positioning of neighbor atoms. This process is called *transformation*. Five rules suffice to transform any configuration into any other:

- *Virtualize*. Replaces an atomic hydrogen neighbor with a virtual hydrogen. If the deleted bond was first in the bond ordering, toggle the configurational descriptor.
- *Reify*. Replaces a virtual hydrogen with an atomic hydrogen neighbor. The bond ordering must place the new neighbor in the second position.
- *Swap*. Exchanges any two bonds ordered second or higher while simultaneously toggling the configurational descriptor.
- *Slide Left*. Re-orders a bond from the first position to the second position. Disabled if the central atom carries a virtual hydrogen.
- *Slide Right.* Re-orders a bond from the second position to the first position. Disabled if the central atom carries a virtual hydrogen.

[Figure: Transformations]

It is an error to assign a stereodescriptor to any atom that is not tetracoordinate, or which has more than one virtual hydrogen.

Not all tetracoordinate atoms will be *stereocenters*. A stereocenter is an atom whose "ligand permutation produces stereoisomers," as defined by Mislow and Siegel.[@mislow1984] In the context of Dialect, a stereocenter must be tetracoordinate. Readers should avoid the assignment of stereodescriptors to atoms that are not stereocenters.

Special handling is required for *undefined stereocenters*. A stereocenter is undefined if it lacks a stereodescriptor. Omitting a stereodescriptor conveys to readers that no information about the stereocenter's configuration is known. The configuration could correspond to `TH1` or `TH2`. Alternatively, a mixture of configurations may be present. This interpretation is consistent with the one used by molfile format.[@ctfileFormats]

# Syntax

A Dialect string ("string") is a UTF-encoded sequence of zero or more characters chosen from the set: `A`; `B`; `C`; `D`; `E`; `F`; `G`; `H`; `I`; `K`; `L`; `M`; `N`; `O`; `P`; `R`; `S`; `T`; `U`; `V`; `W`; `X`; `Y`; `Z`; `a`; `b`; `c`; `d`; `e`; `f`; `g`; `h`; `i`; `k`; `l`; `m`; `n`; `o`; `p`; `r`; `s`; `t`; `u`; `v`; `0`; `1`; `2`; `3`; `4`; `5`; `6`; `7`; `8`; `9`; `+`; `-`; `.`; `%`; `@`; `*`; `[`; `]`; `/`; `\`; `=`; and `#`. The internal structure of a string reflects a depth-first traversal of the corresponding molecular graphs. As such, the syntax supports branches, cycles, and disconnected components.

Strings conform to an *LL(1) grammar*. An LL(1) grammar is a context-free grammar whose strings can be parsed one character at a time from left to right with at most one character of lookahead. Additionally, LL(1) grammars expand the leftmost non-terminal first. This set of features makes LL(1) grammars such as the one used by Dialect a good fit for manually-written recursive descent parsers. LL(1) grammars can also be used as a basis for auto-generated parsers through packages such as ANTLR.[@parr2014] The full grammar for Dialect strings is available as a text file in this paper's Supporting Material.

Dialect's formal grammar is presented as a series of *production rules* (aka "productions"). A production rule defines a transformation allowed under the grammar. These transformations collectively define the set of valid Dialect strings. Production rules can be used in the forward direction, when writing a string, or in the reverse direction, when reading a string. 

A production rule is composed of two kinds of elements: *terminals* and *non-terminals*. A terminal is a character literal (e.g., "A"). A non-terminal is a reference to another production rule. This reference occurs through a name, which appears to the left of a separator (`::=`) in a production rule. To the right of a separator appear the allowed terminals and non-terminals for the rule.

Consider a hypothetical language composed of variable-length sequences of the lowercase letter "a". Such a language could be cast as the following two production rules:

```
<text> ::= <a>*
<a>    ::= "a"
```

The quantifier (`*`) indicates that a text in this language consists of a sequence of zero or more instances of the production `<a>`. This production in turn is defined as the lowercase letter "a". Therefore, valid texts in this language include the empty string, `a`, `aa`, and `aaaaaa` to name a few.

## Atom

Atoms carry most of the information in a Dialect string. The non-terminal `<atom>` is a selection among four alternatives.

```
<atom> ::= <star> | <shortcut> | <selection> | <bracket>
```

The first atomic non-terminal, `<star>`, can assume one terminal value, the asterisk character (`*`). This "star atom" represents an `Atom` in which every attribute assumes its default value. The implicit hydrogen count of a star atom is zero.

`<star> ::= "*"`

The next atomic production rule, `<shortcut>` is a non-terminal selected from the list: "B"; "C"; "N"; "O"; "P"; "S"; "F"; "Cl"; "Br"; and "I". An `Atom` encoded in this way ("shortcut atom") assigns the corresponding symbol to the `element` attribute. All other attributes retain their default values. The implicit hydrogen count of a shortcut atom is determined by the algorithm previously given.

```
<shortcut> ::= "B" "r"? | "C" "l"? | "N" | "O" | "P" | "S" | "F"
             | "I"
```

The third atomic production rule, `<selection>` is a non-terminal selected from the list: "c"; "n"; "o"; "p"; and "s". An `Atom` encoded in this way ("selected shortcut atom") assigns the corresponding atom symbol to the `element` attribute and sets the `selected` attribute to `true`. All other atomic attributes retain their default values. The implicit hydrogen count of a selected shortcut atom is determined as described previously.

```
<selection> ::= "c" | "n" | "o" | "p" | "s"
```

The fourth and most complex atomic production rule is `<bracket>` ("bracket atom"). A bracket atom can be used to set any atomic attribute. A bracket atom must be used when the `element` attribute of an `Atom` makes it ineligible for implicit hydrogen counting. Attributes not set within the `<bracket>` production rule will leave the corresponding atomic values in their default states.

```
<bracket> ::= "[" <isotope>? <symbol> <stereodescriptor>?
              <virtual_hydrogen>? <charge>? <extension>? "]"
```

The value of a bracket atom's `isotope` attribute is determined by the optional `<isotope>` non-terminal. It consists of between one and three digits encoding the integers 0-999. Leading zeros are disregarded when assigning the value of the `isotope` attribute. In other words, "007" and "7" are considered equivalent expressions of the value 7.

```
<isotope> ::= <digit> <digit>? <digit>?
```

The values of a bracket atom's `element` and `selected` attributes are determined by the `<symbol>` production rule ("symbol"). Three non-terminal options are available: `<star>`; `<element>`; and `<selection>`.

```
<symbol> ::= <star> | <element> | <selection>
```

The `<star>` non-terminal leaves the atomic `element` and `selected` attributes in their default values (`undefined` and `false`, respectively).

The `<element>` non-terminal option assigns the atomic `element` attribute to the corresponding value while leaving the `selected` attribute as its default value. Given the large number of choices within the `<element>` non-terminal, the following production rule only defines the first several. For a complete list of alternative, see the full grammar in the Supporting Information.

```
<element> ::= "A" ( "c" | "g" | "l" | "m" | "r" | "s" | "t" | "u" )
            | "B" ( "a" | "e" | "h" | "i" | "k" | "r" )?
            ...
```

A `<selection>` non-terminal found within a symbol sets the atomic `selected` attribute to `true`. The corresponding `element` attribute is assigned by capitalization. For example, the terminal `p` would assign the atomic `element` and `selected` attributes to the values `P` and `true`, respectively.

The `stereodescriptor` attribute of a bracket atom is determined by the `<stereodescriptor>` non-terminal. Allowed values are "@" and "@@", corresponding to the `stereodescriptor` values `Counterclockwise` and `Clockwise`, respectively.

```
<stereodescriptor> ::= "@" "@"?
```

The `hydrogens` attribute of a bracket atom is controlled by the `<virtual_hydrogen>` non-terminal. This non-terminal is comprised of the terminal `H` followed by an optional `<digit>` non-terminal. A digit appearing after the `H` terminal sets `hydrogens` to the corresponding virtual hydrogen count. A digit of 0 (i.e., `H0`) sets the `hydrogens` attribute to zero. If no digit is present, `hydrogens` is set to one.

```
<virtual_hydrogen> ::= "H" <digit>?
```

The `<charge>` production rule sets the `charge` attribute of a bracket atom. This non-terminal begins with either the plus or minus terminals (`+`, `-`, respectively) and ends with an optional `<digit>` non-terminal. A missing digit causes the atomic `charge` attribute to be set to one. In other words, `+` sets the `charge` attribute to one and `-` sets it to minus one. A digit of zero (e.g., `+0` or `-0`) sets the `charge` attribute to zero.

```
<charge> ::= ( "+" | "-" ) <digit>?
```

The presence of an `<extension>` non-terminal sets the atomic `extension` attribute. If a colon terminal (`:`) is present, it must be followed by one, two, three, or four `<digit>` nonterminals. The resulting `extension` attribute must therefore assume a value between 0 and 9999, inclusive. As with the `isotope` attribute, leading zeros are disregarded. The extensions `0007`, `007`, and `7` are all considered equivalent.

```
<extension> ::= ":" <digit>? <digit>? <digit>? <digit>
```

Should an optional bracket non-terminal not be present, the atom must retain its corresponding default value. For example, the bracket `[C@H+]` lacks the `<isotope>` non-terminal so the value of the `isotope` attribute will remain as `None`. Similarly, the bracket `[13CH+]` lacks the `<stereodescriptor>` non-terminal, so the corresponding `configuration` attribute remains `None`.

## Bond

An `Atom` may be connected to zero or more neighbors through a `Bond`, encoded with the non-terminal `<bond>`.

```
<bond> ::= "-" | "=" | "#" | | "/" | "\"
```

Five variants are available (`-`, `=`, `#`, `/`, and `\`). The first three (`-`, `=`, `#`) set the `order` attribute of a `Bond` to `single`; `double`; and `triple`, respectively. The last two, `/` and `\`, set the `order` attribute to `single` while also setting the `state` attribute to `Up` and `Down`, respectively.

## Sequence

An `Atom` may be assigned zero or more children through the `<sequence>` non-terminal ("sequence"). A sequence starts with a required `<atom>` non-terminal. If no allowed non-terminals follow, the corresponding `Atom` will have no children. Allowed non-terminals are chosen from the list: `<union>`; `<branch>`; and `<sequence>`.

```
<sequence> ::= <atom> ( <union> | <branch> | <split> )*
```

The `<union>` non-terminal consists of an optional `<bond>` non-terminal followed by a mandatory non-terminal selected from the list: `<cut>` or `<sequence>`. If either of these latter non-terminals are detected but `<bond>` is not, bond elision is used. 

```
<union> ::= <bond>? ( <cut> | <sequence> )
```

A sequence can contain a union, which in turn can contain a sequence. This is an example of recursion, transitive though it may be. Although left-recursion is disallowed in LL(1) grammars, right recursion of the kind in `<sequence>` is allowed. Right recursion also occurs within the `<union>` and `<branch>` non-terminals.

The `<cut>` non-terminal ("cut") can takes two forms. A digit non-terminal can be used, enabling single-digit cut indexes. Double- or single-digit cut indexes, supporting the values zero through 99 inclusive, are available by prepending the percent character (`%`).

```
<cut> ::= <digit> | "%" <digit> <digit>
```

A cut signifies the disconnection of an `Atom` from its neighbor. The most common use for cut is to encode a cycle. The cut index serves as a placeholder for the neighboring `Atom`, which is located by scanning either forward or backward along a string. If the number of previous appearances of the cut index is even, then the string is scanned right. Otherwise, the string is scanned left. Although often used for cycles, cuts can be used for any bond, regardless of cycle membership. The only requirement is that a cut must be paired with another cut having the same index.

![Cut. Each cycle yields a bond that must be cut.](svg/placeholder.svg)

To prevent overflow, a cut index may be reused provided that it appears to the right of its last paired appearance.

An alternative to `<union>` within a sequence is the `<branch>` non-terminal ("branch"). Like union, branch joins a parent and child node through a bond. Wrapped by opening and closing parenthesis terminals (`(` and `)`, respectively), branch encodes a sequence that may or may not be attached to its parent. Attachment occurs if the `<bond>` non-terminal is included. Alternatively, the subgraph will be detached if the `<detachment>` non-terminal appears. If neither `<bond>` nor `<detachment>` non-terminals are detected between the parentheses but a sequence is, then bonding of parent and child occurs through an elided bond.

```
<branch> ::= "(" ( <detachment> | <bond> )? <sequence> ")"
```

The third option for associating a parent Atom with a child within a sequence is the `<split>` non-terminal ("split"). A split is a sequence of `<detachment>` and `<sequence>` non-terminals. The `<detachment>` non-terminal serves the same purpose as it does within a branch: the prevent the bonding of the parent `Atom` with a child.

```
<split> ::= <detachment> <sequence>
```

Having defined sequence, it's now possible to define a string as an optional sequence. In other words, a Dialect string is either empty or contains a sequence. A string without a sequence encodes a molecular graph of zero nodes and zero edges.

```
<string> ::= <sequence>?
```

# Reading Strings

The goal of a Dialect reader is to transform a string input into a data structure output consistent with the string's content. The output data structure can take many forms. For example, a reader can merely validate a string by returning a boolean type. A more sophisticated reader can return a molecular graph capturing all `Atom` and `Bond` attributes and connectivity relationships.

Dialect strings are read one character at a time starting at the leftmost character and finishing at the rightmost character. The first character sets an initial reader state, and each subsequent character causes a state transition. The cumulative application of these state transitions yields the data structure to be returned.

Readers that capture `Atom`-`Atom` connectivity will typically maintain a reference to a *root atom*. The root atom is initially undefined. On reading the first complete `<atom>` non-terminal, the corresponding `Atom` is constructed and set as the root atom. Subsequently processing a complete `<union>`, `<branch>`, or `<split>` non-terminal triggers three changes: (1) a child `Atom` is constructed; (2) the child is connected to the current root atom, unless a `<detachment>` non-terminal intervenes; and (3) the root atom is replaced with the child atom.

The presence of a branch adds some nuances over a union. The leading open parenthesis terminal (`(`) signifies that the current root atom will later be re-exposed. This operation can be supported by a stack. At the start of a branch, the current root is pushed to the stack. At the end of the branch, the stack is popped and its top value is assigned as the new root atom.

![Stack for branches.](svg/placeholder.svg)

Further workflow adjustments can handle cuts. The necessary state can be maintained by a 100-element array. The first occurrence of a cut creates an entry in the array at the cut index consisting of the bond and the root atom. The second occurrence of a cut takes the entry at the cut index, attaching the atom in the entry to the current root atom. Either the leftmost or rightmost bond can be used to make the connection, provided they are *compatible*.

![Array for cuts. The array's fixed length reflects the syntactic constraint on cut index.](svg/placeholder.svg)

Two cut bonds are compatible if they possess the same `order` attributes, and their `state` attributes are complementary. Bonds with undefined `state` are always complementary. A bond with a defined `state` is complementary to any `Bond` with an undefined state, or a `Bond` with an opposing `state`. For example, an elided `Bond` is compatible with a single `Bond`. Likewise, two elided `Bond`s are compatible. A `Bond` with a `state` of `Up` is incompatible with another `Bond` with a `state` of `Up`, but compatible with one having a `state` of `Down`.

![Bond compatibility. Two non-elided bonds across a cut must have compatible `order` and `direction` attributes.](svg/placeholder.svg)

Decoding atomic configuration from a string requires the order of attachment from each `Atom` to its neighbors to be recorded. Cuts are treated as if the neighboring atom itself were detected. In this regard, the first member of a cut pair requires special attention. The neighboring `Atom` won't be available until the paired cut index is found. Nevertheless, it must ultimately appear before the neighbors in subsequent unions, branches, and splits. This can be accomplished though the use of a placeholder or some other mechanism that preserves the overall relative order of attachment. No such special treatment is needed for the second member of a cut pair.

![Order of attachment. A placeholder target index preserves the order of attachment.](svg/placeholder.svg)

Readers must not assume that detachment (the period character, `.`) implies the presence of disconnected components. This assumption is most likely to arise in the context of ad-hoc parsers using regular expressions, string matching, and the like. For example, the single molecule propane can be encoded using the string `C1C.C1`.

The partial parity bond model is unusual in that it spreads conformational information over three or more bonds. Regardless, readers must report as an error any string containing an isolated PPB (e.g., `C/C`). Beyond this check, generating (*E*) and (*Z*) stereodescriptors from PPBs is not a straightforward process. Performing such a conversion requires a method capable of translating PPB into a localized bond descriptor. One approach is to first consider the parity of each double bond terminal individually. A separate step would then relate the individual terminal parities to a double bond conformation parity. This intermediate parity can then be used to perform the final conversion.

![Localized configurational descriptor. Such a representation can be useful when bridging Dialect to other representations.](svg/placeholder.svg)

A reader must assume that any input string can contain errors, and take appropriate steps to report them. The most useful errors will report a specific cause. Some will also report one or more cursor indexes. The most common mandatory errors are:

- Invalid character (position). An unexpected character was encountered. A list of acceptable characters is helpful, but not required.
- Unexpected end-of-line. Input ended unexpectedly.
- Unbalanced cut (position). A cut with a given index appears an odd number of times.
- Incompatible cut bonds (position, position). The bonds to a pair of cuts are incompatible.
- Delocalization subgraph lacks perfect matching. Before reporting this error, steps to remove ineligible atoms should be taken as described in the next section.
- Partial parity bond not allowed (position). Neither terminal of a PPB possesses a double bond. Strings such as `C/C` and `C\\C` contain isolated PPBs, which are invalid. A reader encountering such strings must report an error.

A reader may also report optional errors, including:

- Impossible isotope. A negative implied mass number results from the atom. For example, `[2C]`.
- Impossible valence. The valence at an `Atom` is impossibly high. For example, `C(C)(C)(C)(C)C`.
- Impossible charge. An `Atom`'s charge gives it an apparent negative electron count. For example, `[C+7]`.

# Pruning

As noted previously, a delocalization subgraph is invalid if it lacks a perfect matching. The one exception is when a selected atom can be deleted from the delocalization subgraph through *pruning*. Pruning unsets the `selected` attribute of a selected atom without corresponding promotion of any attached bonds.

An atom must be pruned if its subvalence equals zero. None of the bonds to such an atom can be promoted without altering the atom's `charge` attribute. Pruning the atom ensures the stability of its `charge` attribute, without interfering with bond promotion elsewhere. Viewed from another perspective, an atom with zero subvalence lacks unpaired electrons - at least within the narrow boundaries of the Dialect valence model. Such atoms can only form double bonds through changes to atomic charge. 

If a selected atom bears a non-zero `charge` attribute, subvalence is computed using the isoelectronic element's default valences. For example, a selected nitrogen atom with a charge of +1 would use the default valences for carbon. A selected phosphorous atom with a charge of -1 would use the default valences of sulfur. And so on. If no default valences are found in this way (e.g., `[c+2]`), a reader must generate an error. Writers must not encode such atoms.

![Gratuitous selection.](svg/placeholder.svg)

Pruning becomes necessary in cases of gratuitous atomic selection. This occurs whenever style, tradition, or convenience overrides necessity. Consider furan represented as the string `c1ccco1`. Selecting any atom is unnecessary because furan does not exhibit DIME. But selecting the oxygen atom is particularly unnecessary because it lacks an unpaired electron and so will never lead to DIME. It is nevertheless convenient to select the carbon atoms because all bonds can then be elided. The resulting representation, `c1cccO1` leads to a delocalization subgraph with a perfect matching and hydrogen counts consistent with the original encoding.

Writers are encouraged, but not required, to avoid gratuitous atom selection. Readers, however, must always be prepared to prune.

# Writing Strings

Whereas a reader transforms a string into a data structure, the goal of a writer is the opposite: to transform a data structure into a valid string. This data structure will most commonly take the form of a molecular graph, but other forms are possible. Although a graph itself could be used as the basis for an input representation, a more primitive representation such as an adjacency list could also be used. For practical reasons, the input data structure is likely to resemble the output from a reader. Such an arrangement makes it possible to encode and decode strings with minimal intermediate translation.

Regardless of the form taken by the input data structure, it must be traversable in *depth-first* order. A depth-first traversal operates over a set of nodes bound by a set of connectivity relationships, which are typically edges. Traversal proceeds by successively replacing each node as the center of focus, or root. Each new root is selected from the untraversed neighbors of the current root. Iteration eventually selects all nodes, at which point the traversal ends.

![Depth-first traversal](svg/placeholder.svg)

A writer intercepts the depth-first traversal of an input data structure to write node and edge representations. The `<atom>` and `<bond>` non-terminals are used for this purpose. There are no requirements around style. For example, it's equally valid to represent the carbon atom of methane as either `C` or `[CH4]`. Single bonds may be elided or not. Similarly, selection can be used or not for eligible atoms. Although an organization may seek to standardize certain styles of string output, any syntactically-valid string must be considered valid by a reader.

The presence of branches within an input data structure is encoded via the `<branch>` data structure. A useful tool for this purpose is a *stack*. A stack is a data structure that allows items to be added individually and removed ("popped") in the reverse order of addition. A writer begins by pushing the current branch onto the stack and extending it. When a new branch is encountered, it is pushed to the stack and extended. When the branch terminates, the current branch is popped and its contents are appended to the stack's new top item.

![Stack for branch assembly.](svg/placeholder.svg)

Cycles are encoded using the `<cut>` non-terminal. This one- or two-digit integer replaces one terminal of a cycle closure bond. The challenge is to unambiguously supply these integers while allowing re-use to avoid overflow. This can be accomplished with a *pool*. A pool is a data structure that yields a numerical index given an ordered pairing of atomic indexes. The numerical index will not be re-issued until the pool receives the corresponding reversed pairing.

![Pool for assigning cut indexes.](svg/placeholder.svg)

A pool can be used by a writer in the following way. The presence of a cycle during depth-first traversal is indicated by an atom that has already been traversed. On encountering a cycle, a writer requests an index from the pool, submitting the corresponding atomic indexes as an ordered pair. Later, the same bond must be reversed in the reverse direction. When it is, the writer once again requests an index, but this time using a reversed pairing. Doing so yields the same index, while simultaneously freeing it for later use.

The encoding of cuts is likely to pose special challenges for writers. For a cut across a PPB, care must be taken to report the correct parity. Consider *trans*-cyclooctene. The correct encoding accounts for the reverse in parity at the left-hand side (e.g., `C\1C=C/CCCCC/1`). Moreover, the double-encoding of the PPB bond type can lead to inconsistencies that must be reported by a reader (e.g., the invalid string `C/1C=C/CCCCC/1`). Such errors can be avoided by encoding the bond type of one side or the other side of a cut, but not both. (e.g., `C\1C=C/CCCCC/1` or `C1C=C/CCCCC/1`). A cut across a bond attached to an atom with a stereodescriptor must take bond ordering into consideration. For example, the string `O[C@H]1NC1` encodes the same absolute configuration as the string `O[C@H](C1)N1`, but the *opposite* configuration as `O[C@H](N1)C1`. 

![Difficult cuts.](svg/placeholder.svg)

The presence of conformational restriction about a double bond presents a special challenge to writers. Few other molecular graph systems distribute a conformation descriptor over two or more bonds the way that PPBs does. Instead, descriptors are more likely to be localized at the double bond. Producing the necessary PPBs from a descriptor localized at the double bond is likely to be non-trivial. An approach to the reverse problem was presented previously (Reading Strings section). That approach can also be adapted to the reverse problem.

![Writing partial parity bonds through a localized conformation descriptor.](svg/placeholder.svg)

Writers should carefully weigh the non-negligible costs of atom selection. Algorithms for doing so sometimes involve the perceptions of cycles, and often exhibit superlinear time complexity. Very often a reader must perform a global deselection to arrive at a localized valence bond representation, which at the very least requires pruning and a maximal matching procedure. In this sense atom selection imposes two sets of costs: one on the writer and the other on every subsequent reader forever into the future.

Writers must ensure that all selected atoms can be deselected. Consider pyrrole, erroneously encoded as the string `n1cccc1`. The nitrogen atom can not be pruned because its subvalence is 1 (3 - 2). The DS therefore contains all five atoms and all five bonds. A perfect matching does not exist. A reader receiving such a string must report an error. To avoid this outcome, a writer can consume the subvalence by adding a virtual hydrogen, as in the string `[nH]1cccc1`. The subvalence of nitrogen in this case is zero, so the atom can be pruned. Doing so leaves a DS with four nodes, four edges, and a perfect matching. Readers will consider the string valid. Nevertheless, the larger question of gratuitous selection remains.

# SMILES Compatibility

To maximize compatibility with contemporary software, Dialect is based on the SMILES language. Given the widespread adoption of "SMILES," arriving at a specific definition of the language is surprisingly challenging. No single document completely specifies SMILES syntax and semantics. The first description of the SMILES language in the primary literature is contained within a 1988 article (referenced here as "the article").[@weininger1988] The article, by its own admission, is incomplete: "... isomeric SMILES \[defined in the book chapter as covering isotopism, conformation, configuration, and extension\ (p. 91)] is not otherwise covered in this paper." (p. 34). Weininger later refined and expanded SMILES in a 2003 book chapter,[@weininger2008] referred to here as "the book chapter." A third major source of information is the Daylight Theory Manual (referred to here as "the manual"), a website operated by Daylight Chemical Information Systems, Inc.[@daylightTheory] Information about SMILES is also contained in various software packages and associated documentation, slide decks, websites, mailing lists, and private communications.

For the purpose of providing a foundation for Dialect, "SMILES" was defined as the language described in the article and the book chapter. All other sources &mdash; irrespective of quality or apparent claim to authority &mdash; were considered out of scope. The manual was disregarded because it merely recapitulated material in the article and chapter, and due to the possibility of future alteration. The remaining sources were disregarded due to lack of authority, poor accessibility, or both. This narrow focus simplifies the task of evaluating compatibility between Dialect and SMILES. However, it does not provide a method for testing compatibility due to the lack of an authoritative SMILES compliance suite.

It is nevertheless possible to compare Dialect and SMILES on a feature-by-feature basis. Dialect is intended to be a subset of SMILES, meaning that every feature present in Dialect is ideally also present in SMILES. As will be seen, certain factors make this undesirable in the strictest sense. With a few notable exceptions, however, Dialect can be viewed as a subset of SMILES.

The book chapter defines a fixed set of element symbols which even at the time of publication was obsolete (p. 83). The symbol for element 105 is given as Ha (Hahnium), despite IUPAC's resolution of this naming controversy in favor of the symbol Db (Dubnium) years prior.[@ohrstrom1997] Accordingly, Dialect disallows the symbol Ha. To support the full set of currently-named transuranium elements, Dialect adds the symbols: Db; Sg; Bh; Hs; Mt; Rg; Cn; Nh; Fl; Mc; Lv; Ts; and Og. Moreover, Dialect explicitly accepts all future element symbols approved by IUPAC. These additions are one of the reasons Dialect can't be considered a strict subset of SMILES.

The article implies that comma (`,`) is either an element symbol or a valid SMILES character: "This subset uses only the symbols H, C, N, O, P, S, F, Cl, Br, I, and (,) and digits, with the following four rules..." (p. 33). The comma character is explicitly disallowed in Dialect.

The book chapter defines a recursive grammar for branching which, perhaps without the knowledge of the author, results in multiple branching (p. 86). Dialect disallows the multiple branching constructs, including for example `*((*))*` and `*(((*)))*`.

"Reaction SMILES" is an extension described in the book chapter (p. 89), but disallowed in Dialect. Specifically, the greater than symbol (`>`) is not a valid Dialect character. This precludes strings such as `*>>*` in Dialect.

Dialect only supports two stereodescriptors, encoded as `@` and `@@`. The book chapter provides a recursive grammar for stereodescriptors that allows multi-symbol descriptors such as `@@@` and `@@@@` (p. 94). The book chapter also discusses non-tetrahedral descriptors including `@AL1`, `@AL2`, `@1`, and `@SP1`. None of these are supported by Dialect. Nor does Dialect support the application of the `@` and `@@` tetracoordinate stereodescriptors to odd cumulenes as described in the book chapter. Although some of these forms of configuration are supported today, it's unusual to find them all supported. The reason is simple: in the context in which SMILES is most often used, these forms of stereochemistry are rare. To support them places a burden on implementors with little payoff.

Along these lines, Dialect does not recognize atoms bearing either arsenic (As) or selenium (Se) as selectable. Doing so would increase the complexity of Dialect unnecessarily. Although the paper implies selectability ("Elements other than C, N, O, P, S, As, and Se are not yet dealt with in an aromatic context." p35), default valences for the latter two atoms are not provided. Even if they were, the elements As and Se must be bracketed. As such, special rules for handling them in the context of pruning would be required. Moreover, molecules bearing the elements As or Se rarely exhibit DIME. Consider the arsenic analog of pyrrole ("arsole"). Selecting the arsenic-bearing atom is gratuitous because it does not contribute to DIME. Finally, allowing the selection of atoms bearing As or Se does nothing to address molecules with atoms bearing germanium (Ge), tin (Sn), or other heavy main group elements that may be discovered in the future to participate in DIME.

It's not clear whether SMILES allows a virtual hydrogen count on hydrogen itself. The article implies that the element symbol H (hydrogen) must not have an implicit hydrogen count when used within a bracket sequence: "There are few exceptions to the hydrogen-suppression convention, the most obvious being specification of a proton, \[H+\], and molecular hydrogen, \[H\]\[H\]." (p. 34) If so, the author may have erroneously believed that parsers would be incapable of processing constructs such as `[HH]`. The book chapter appears to reiterate this view, noting that "explicit hydrogen specification is required" in the case of "hydrogens connected to other hydrogens, e.g. \[H\]\[H\], molecular hydrogen" (p. 97). To be clear, Dialect supports any valid virtual hydrogen count on hydrogen itself. For example, the following are all valid, if chemically nonsensical, strings: `[HH]`; `[HH2]`; and `[HH3]`. Depending on interpretation, this support may or may not render Dialect a superset of SMILES.

The book chapter ascribes ambiguous meaning to detachments: "... In terms of the valence model being represented, the dot literally represents a bond of formal order zero: the atoms on either side of the dot are explicitly not bonded to each other." (p. 88). The state of not being bonded and the state of having a zero-order bond are not necessarily equivalent.[@clark2011] To be clear, Dialect explicitly disallows the zero bond order interpretation of detachments and the dot character.

SMILES assigns no explicit upper or lower bounds to numerical atomic attributes. These boundaries are nevertheless crucial for implementors, who often seek a data type just large enough to prevent underflow or overflow. For this reason, Dialect sets both upper and lower bounds on the following atomic attributes: isotope (0 <= value < 1000); charge (-10, < value < 10); virtual hydrogen ("hcount", 0 <= value < 10); and extension ("map", 0 <= value < 1000). Although it might be argued that lower bounds on physical quantities such as isotope and hcount should be obvious in SMILES, the lack of specificity in SMILES forces implementors to complete work that should have been done by the language's creator.

Dialect provides a few semantic clarifications not fully addressed in SMILES. A detailed algorithm for determining implicit hydrogen count is provided, together with the required valence table. Unlike SMILES, Dialect explicitly considers the case of computing implicit hydrogens on selected atoms. Dialect also provides detailed algorithms, absent in SMILES, for selection and deselection. These are based in graph theory rather than the ambiguous and overloaded chemical concept of "aromaticity" used in SMILES. Uniquely, Dialect introduces the concepts of "pruning" and "gratuitous selection." Neither the paper nor the book chapter indicate those bonds that can be promoted during deselection, but Dialect does. Finally, Dialect syntax is based on a formal grammar and tooling rooted in decades of computer science research, whereas SMILES syntax is based for the most part on imprecise natural language descriptions.

Dialect also resolves some internal contradictions within SMILES. The article reports 3 as the only default valence for nitrogen (p. 34), whereas the book chapter reports two default valences: 3 and 5 (p. 84). Dialect uses the latter default valences. Eligible atoms ("the organic subset") are reported in the article as: B; C; N; O; P; S; F; Cl; Br; and I (p. 32). However, an example later in the article indicates that `Hn1cccc1` with its unbracketed hydrogen is a valid string (p. 35). Dialect explicitly rejects strings containing unbracketed hydrogen atoms. On the topic of atom selection ("aromaticity"), the article implies that selected atoms must be part of a cycle: "To qualify as aromatic, all atoms in the ring must be sp2 hybridized and the number of available 'excess' $π$ electrons must satisfy Hückel’s 4*N* + 2 criterion." (p. 34). The book chapter, however, presents two examples of valid strings that do not encode cycles (`cc` and `cccc`, p. 85). Consistent with the latter view, Dialect explicitly allows the selection of atoms regardless of cycle membership.

| Feature                                                  | SMILES | Dialect |
| -------------------------------------------------------- | :----: | :-----: |
| element symbol Ha | yes | no |
| element symbols Db; Sg; Bh; Hs; Mt; Rg; Cn; Nh; Fl; Mc; Lv; Ts; and Og | no | yes |
| future element symbols approved by IUPAC | no | yes |
| comma symbol (`,`) | maybe | no |
| multiple branching e.g., `*((*))*`) | yes | no |
| reactions using greater than symbol (`>`) | yes | no |
| extended stereodescriptors e.g., `@@@`, `@@@@`, `@AL1`, `@1`, and `@SP1` | yes | no |
| use of stereodescriptors on odd cumulene centers | yes | no |
| virtual hydrogen count on hydrogen | no | yes |
| detachments are bonds of "formal order zero" | maybe | no |
| upper and lower bounds on atomic properties | no | yes |
| nitrogen default valence includes 5 | maybe | yes |
| unbracketed hydrogen atom | maybe | no |
| acyclic atom selection | maybe | yes |
| atoms with elements As and Se are selectable | yes | no |
| non-elided bonds may be promoted during selection | maybe | no |
: Some Differences between SMILES and Dialect

# Discussion

Dialect's main advantage as a molecular serialization format is high information density. The most common atom types can be represented with just one character. The worst case atom, using every available atomic attribute, requires 14 characters. The most common bond types can be encoded implicitly. In the worst case one character per bond is required.

These metrics compare favorably with alternatives. Consider the molfile (V2000) format. 32 characters per atom are required in the best case, and 51 characters in the worst. All bonds, regardless of type, require between nine and 12 characters. Atomic charges and isotopes typically require additional characters.

The information density of Dialect strings makes them attractive for several applications. In memory-constrained environments such as those found on handheld devices and network serialization, many more Dialect strings can be present than alternative encodings. In-memory structure search over large collections becomes feasible. Because a Dialect string often fits within one line on a terminal, it can be used for data entry in manual interactive shells such as a real-eval-print loops (REPLs) or notebooks.

Another advantage is lossless serialization and deserialization. The line notation InChI might appear to compete with Dialect in this sense. Although InChI can be read and written, the InChI Technical manual notes that InChI's value lies in molecular identification. The authors of InChI have repeatedly noted that InChI is not a solution to the molecular serialization problem. The reason presumably lies with the fact that both serialization and deserialization require intimate knowledge of the InChI canonicalization algorithm. To date, no third-party reader or writer of InChI has ever been released.

Despite its information density, Dialect can faithfully encode and decode most of what chemists would consider "organic molecules." This is evidenced by the widespread presence of Dialect strings within large, public-facing databases such as PubChem, ChEMBL, ChEBI, and eMolecules.

Dialect's compact representation requires some tradeoffs regarding expressiveness. Extended bonding beyond the delocalization subgraph is not supported. This limitation excludes many types of molecule, including organometallics and delocalization-stabilized ions. Zero-order bonds are not supported, making it difficult to accurately encode coordination complexes. Only four-coordinate, tetrahedral stereocenters can be encoded, excluding many forms of chirality, including helical chirality, all forms of non-tetrahedral stereochemistry, and lone-pair tetrahedral centers. Conformational restrictions beyond the isolated double bond are not supported, which excludes important molecules such as those exhibiting atropisomerism. Other formats such as CDXML and molfile support enhanced stereochemical features enabling the differentiation of various kinds of partial stereochemical information, but Dialect does not.

Applications requiring features beyond those supported by Dialect can use the atomic extension field. This integer field allows atoms to be individually associated with one of ten thousand unique labels whose values range from 0 to 9999, inclusive. When used with an application-specific dictionary, the extension field allows atoms to carry a wide range of additional attributes. Readers must report the contents of this field, allowing extension code to capture extension values for later use.

Broader expansion of Dialect's capabilities could be possible through *metaformats*. A metaformat embeds one or more Dialect strings within a surrounding serialization format. As noted previously, SMILES itself defines a reaction metaformat, using the greater than symbol (`>`) to separate reactant, agent, and product molecules. In a similar manner, two- or three-dimensional coordinates could be associated with each atom through a metaformat that includes a dictionary mapping atomic index to coordinate. Collections of atoms could likewise be encoded to replicate the enhanced stereochemistry features of other formats. And so on. However, the utility of such extensions should be weighed against Dialect's main value proposition: high information density. An application attempting to use a verbose metaformat may benefit from adopting better-suited format instead.

Setting aside the many technical and usability issues a metaformat would raise, versioning is likely to play an important role. Dialect itself lacks any mechanism to convey the concept of version. This stands in contrast to InChI, which not only encodes a version identifier, but has done so from its first release. Adding a version identifier would, unfortunately, break compatibility with the large number of existing SMILES software. Metaformats offer an opportunity to address this limitation.

The most noteworthy feature of Dialect is its compatibility with SMILES. Contemporary SMILES implementations will be able to read and write Dialect strings &mdash; at least to a point. Incompatibilities will arise from two main sources: (1) those features of SMILES that Dialect has deliberately omitted; and (2) those aspects of the SMILES language that are incompletely-specified, ambiguous, or self-contradictory.

The availability of a minimal yet highly functional, fully-specified core language offers many opportunities to improve data quality. One of the most important will be a reference implementation, the design and source code of which will be discussed later. A freely-available reference implementation in turn makes automated validation suites possible. These suites can improve data quality by reporting syntax and semantic differences among implementations, preferably before release. A reference implementation taken together with the guidelines for readers and writers in this paper should make it possible to write software that conforms to a very high level of precision, regardless of programming language or paradigm. Given verified implementations, performance optimizations can be considered. The existence of a core language specification should also aid standardization efforts, either for Dialect itself, or SMILES. Finally, the development of better line notations is only possible given a thorough understanding of the scope and limitations of existing options. Here, metaformats could offer a bridge from the present to the future.

# Conclusion

This paper describes Dialect, a subset of the widely-used SMILES line notation. Dialect's features are detailed at four levels: constitution; delocalization; conformation; and configuration. Constitutionally, Dialect can encode any molecule conforming to the valence bond model. In the event of undesired symmetry artifacts due to delocalization, Dialect offers a mitigation based in graph theory. Conformational isomerism of alkenes is supported by partial parity bonds. The configurations of tetracoordinate, stereogenic atoms are encoded through the use of a parity enumeration and conventions around its use.

Dialect's syntax is described in detail through both graphical diagrams and a formal grammar. The latter method concisely summarizes the complete set of strings that could be considered valid Dialect representations. The formal grammar was deliberately structured to be used either directly with an automated parser generator or with a hand-written recursive-descent parser.

The complete set of operations needed to interpret Dialect's syntax semantically are described in detail. This is a crucial component of the language's definition because Dialect achieves its information density largely by favoring convention over encoding. As an aid to difficult cases, guidelines for readers and writers are included.

As a subset of SMILES, Dialect can be used with a wide range of SMILES software today. In this sense, Dialect may seem to offer nothing new or even of value. However, Dialect has been defined at a level of detail that SMILES never was. This difference makes it possible to use Dialect in unique ways. Open reference implementations and validation suites can now be developed and deployed. Families of extensions can be built, each one based on the same unambiguous foundation. Formal standardization becomes more feasible given detailed reference material on which to draw. Finally, it is only through the clear demarcation of boundaries that the frontier becomes visible.

# References
