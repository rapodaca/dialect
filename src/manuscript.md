---
title: "Dialect: A Dialect of the SMILES Language"
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

SMILES has since been widely adopted. Read and write functionalities are routinely supported by popular cheminformatics toolkits, including: Open Babel; RDKit; Chemistry Development Kit; JChem; the Daylight Toolkit; OEChem; and JChem. SMILES encodings can be found in many public-facing databases, including: PubChem; Kegg; ChEBI; the eMolecules Catalog; ZINC; and ChEMBL. Increasingly, raw SMILES strings are being used in both predictive and generative machine learning applications. SMILES has also been extended to carry various forms of metadata, as exemplified by Jmol SMILES[@hanson2016], CurleySMILES[@drefahl2011], BigSMILES[@lin2019] and CXSMILES[@cxsmiles].

Despite its widespread adoption, SMILES remains a language with an incomplete specification. Weininger's 1989 paper either fails to address several crucial points entirely, or addresses them only superficially. Examples include: (1) no discussion of stereochemical configuration; (2) no specific protocol for encoding and decoding "aromatic" features; (3) an incomplete protocol for computing implicit hydrogen count; (4) no formal syntax description; (5) no constraints around quantities such as mass number or charge; (6) several points of ambiguity; and (7) no explicit enumeration of error states.

Additional SMILES documentation is available from the Daylight Theory Manual ("the Manual").[@daylightTheory]. Maintained by SMILES' corporate sponsor, Daylight Chemical Information Systems, Inc. (Daylight), the Manual further refines the SMILES language specification. The Manual also introduces a few extensions, including one for stereoisomerism. Some points around computing implicit hydrogen count were also addressed.

An implementation of SMILES is available through the Daylight Toolkit.[@daylightToolkit] Although this implementation could potentially address issues not resolved through documentation, the software's commercial distribution model restricts this use. For several years Daylight operated a web service that could interactively depict SMILES strings, but has since been decommissioned.

In 2007 a documentation effort that would become known as OpenSMILES began.[@openSMILES] OpenSMILES was conceived as "a non-proprietary specification for the SMILES language," and it addressed many of the points left open by previous SMILES documentation efforts. Noteworthy contributions included: the first formal grammar; many refinements around stereochemistry; and introduction of the idea of "standard form." Absent were detailed procedures for assigning and interpreting aromatic features, and a detailed procedure for computing implicit hydrogen count. OpenSMILES also left several points of semantic ambiguity unaddressed.

In 2019 IUPAC announced the SMILES+ initiative.[@smilesPlus] Noting the limitations of existing SMILES documentation, the SMILES+ effort seeks to "establish a formalized recommended up-to-date specification of the SMILES format." SMILES+ took as its starting point the documentation produced by the OpenSMILES project. Efforts to extend this starting point are in progress online through a public repository,[@smilesPlusRepo] but no formal recommendation has to date resulted.

The ongoing lack of a comprehensive SMILES documentation suite has caused several problems. First, authors of new SMILES implementations have limited guidance for resolving ambiguities and so must invent their own. Second, maintainers of existing SMILES implementations lack a blueprint for working toward a common feature set. Third, standards bodies draw from a limited set of source material when preparing recommendations. Fourth, a lack of detailed documentation hinders the development of compliance suites, thereby interfering with efforts to validate cross-implementation compatibility. Finally, extensions to SMILES only make sense in the context of a rigorously defined base language.

The lack of a detailed, comprehensive, and widely-implemented SMILES specification also hampers broader data integrity efforts. The FAIR Guiding Principles [@wilkinson2016] identify four qualities essential for extracting maximum utility from published scholarly data: *F*indability; *A*ccessibility; *I*nteroperability; and *R*eusability. Interoperability in particular requires that "(meta)data" use a formal, accessible, shared, and broadly applicable language for knowledge representation." Although SMILES may be a shared, accessible, and broadly applicable language, its formal underpinnings leave room for improvement.

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

Dialect's system of representation is based on the *molecular graph* concept.[@balaban1985] A graph is a data structure comprised of a set of nodes (which map to "atoms") and a set of pairwise relationships between them called edges (which map to "bonds"). A molecular graph is a specialized graph onto which atomic and bonding metadata have been overlaid. Molecular graphs are ubiquitous in cheminformatics, appearing in contexts such as data formats like Chemical Markup Language[@murrayrust2011], CDXML[@cdxml], and Molfile[@ctfileFormats], as well as in-memory data structures found in cheminformatics toolkits. Like these systems, Dialect augments its underlying graph with node and edge labels.

A Dialect molecule consists of a graph with at least one node and zero or more edges. The "empty molecule", devoid of atoms and bonds, is therefore disallowed. Dialect imposes no upper bound on the number of atoms or bonds. However, practical limitations related to memory, storage, and CPU time will likely limit the size of molecules in practice.

The edges of a molecular graph are defined as a set of unordered pairs of non-identical nodes. This definition has three important consequences. First, *loops* are not allowed. A loop is an edge joining a node to itself. Second, *parallel edges* are disallowed. Edges are said to be parallel if they connect the same two nodes. Third, edges are *undirected*. An undirected edge ascribes no meaning to the order in which its two nodes are given. Thus, the undirected edge between nodes A and B is identical to to the undirected edge between nodes B and A.

A molecular graph contains one or more *connected components*. A connected component is a graph in which any two vertices are connected to each other by at least one path. Dialect places no restriction on the number of connected components, although practical limitations are likely to impose one.

# Constitution

A Dialect molecule is described at the lowest level by its constitution. Constitution consists of a set of atomic nuclei (nodes), a set of pairwise bonding relationships between them (edges), and those attributes needed to associate every valence electron with a specific node or edge. Constitution excludes attributes related to stereochemistry, or any other feature whose attributes extend over more than one atom or bond.

Two attributes characterize an atom's nucleus: `element` and `isotope`. The `element` attribute is an optional one- or two-letter character sequence selected from the set designated by the IUPAC/IUPAP Working Party.[@iupac2016] When the Working Party authorizes additional symbols, they will become valid values for the `element` attribute. If the elemental identity of an atom is unknown, its `element` attribute can be omitted. The `isotope` attribute is an optional integer value representing an atom's nuclear mass number, where mass number is the sum of proton and neutron count. Omitting the `isotope` property means that the isotopic composition is unspecified. When present, the lower bound on `isotope` equals one. This constraint leaves room for physically meaningless negative implied neutron count as in, for example, <sup>5</sup>C. The lower bound for isotope applies even if the `element` attribute is not defined.

The atomic `hydrogens` attribute records the number of associated *virtual hydrogens*. A virtual hydrogen is an atom whose presence is recorded, not as a node and edge, but rather as a unit contribution to an integer tally. For example, methane can be represented by a molecular graph having five nodes and four edges. But methane can also be represented as a graph of one node having a `hydrogens` attribute set to four. The `hydrogens` attribute, if present, may assume integer values ranging from zero to nine. Only monovalent hydrogens with unspecified isotopic composition are eligible for virtualization.

The two remaining constitutional attributes support *electron counting*. The purpose of electron counting is to ensure that every valence electron, whether bonding or nonbonding, can be associated with either an atom or a bond. Accurate electron counting is crucial for any molecular representation system given their influence on charge, bond order, and mass.

Electron counting in Dialect is based on the well-known *valence bond model* (VB Model).[@lewis1916] Although not commonly considered as such, the VB model can be thought of as an algorithm for molecular assembly. The perspective is especially useful given that Dialect itself can be viewed as a programming language for molecular assembly.

A simplified algorithm for electron counting can be summarized as follows. A molecular graph starts as a set of atoms, where each atom consists of a nucleus (as described above) and an integer electron count equal to the atomic number of the atom's element. Two nodes (nuclei) are selected as the terminals of a bond. From each atom, the same positive electron count is deducted. The total electron count deducted from each atom is simultaneously credited to the bond's electron count. For example, if each atom contributes one electron to a bond, then the bond's electron count will increment by two.

[FIGURE: Generalized Valence Bond Electron Counting]

For convenience, the actual model used by Dialect differs slightly from the above description. Neither nodes nor edges carry an explicit electron count attribute. Instead, edges carry a `bond_order` attribute, and nodes carry a `charge` attribute. Bond order equals electron count divided by two. Formal charge equals the number of electrons gained or lost due to ionizations events outside of bond formation. Gaining an electron decrements the `charge` attribute, whereas losing an electron increments it. If no electrons are gained or lost to ionization outside of bond formation, the formal charge equals zero. 

[FIGURE: Dialect's Electron Counting Shorthand]

From these rules follow some important consequences. For example, bond order must be an integer greater than zero. This follows from the definition of bond formation. The electron count deducted from each atom is *n*, an integer greater than zero. Given bond formation deducts an equal number of electrons from each atom, the total number of electrons associated with the newly-formed bond is 2*n*. By definition, bond order is the bond's electron count divided by two, therefore *n* is the bond order. Fractional, negative, and zero bond orders are all disallowed by Dialect for this reason.

Dialect imposes an upper limit of four on formal bond order. The relative scarcity of bond orders greater than three in molecules conforming the the VB Model makes this restriction unlikely to meaningfully restrict applicability.

Whereas negative bond order is disallowed by definition, Dialect places no restrictions on *hypervalence*. Hypervalence occurs when an atom undergoes enough bonding operations to leave it with a negative implied valence electron count. Consider lithium, which possesses one valence electron. Formation of one single bond leaves lithium with zero implied valence electrons. Application of a second bond formation leaves lithium with a zero charge and an implied valence electron count of -1. Such an arrangement may be physically meaningless, but Dialect explicitly supports it. Software using Dialect may or may not reject such species for semantic reasons.

[FIGURE: LiCl2]

# Delocalization Subgraph

A molecular representation based solely on the valence bond model can yield artifacts resulting from *delocalization induced molecular equality* (DIME). DIME occurs in a molecular graph when one or more equivalent representations exist, each one differing from the original only in the distribution of single and double bonds. DIME may be recognized as "resonance" or "aromaticity," but those terms are avoided here due to their extensive history of controversy in organic chemistry.

[Figure: DIME]

DIME can interfere with *canonicalization*, or the selection of a single representation for a molecular graph. The presence of multiple equivalent molecular graphs differing only in the placement of single and double bonds complicates selection rules and invariants, which must be adapted to account for the artificial asymmetry.

To eliminate DIME and thereby streamline canonicalization, Dialect representations support a *delocalization subgraph* (DS). A DS is a possibly empty node-induced subgraph of a molecular graph. The membership of a DS is drawn from the set of atoms and bonds that participate in DIME within a given molecular graph.

A non-empty DS must possess a *perfect matching*. A matching is a subgraph in which no two edges share a common node. Equivalently, a matching is a subgraph in which all nodes have degree one. A perfect matching includes all the nodes of its parent graph. Every atom added to a DS must therefore be part of a perfect matching over it.

[Figure: Perfect Matching]

Only some atoms are eligible for inclusion in a DS. Atoms whose `element` values are one of `C`, `N`, `O`, `P`, or `S` may be added. Additionally an atom having an undefined `element` value is also eligible. All other atoms are ineligible and must not be added to a DS.

To support the construction of a DS, eligible atoms carry a `selected` boolean attribute. Setting this attribute to `true`, adds the atom to the DS. Otherwise, the atom is excluded from the DS. All ineligible atoms are excluded from the DS.

A bond will be added to the DS only if both of the following two conditions are met: (a) both terminals are selected; and (b) the bond itself is elided. No other bond will be added to the DS.

A filled DS can be emptied through a two-step process of *deselection*. First, a perfect matching over the DS is found. Next, each matched edge is replaced by a double bond. Because the presence of a filled DS implies a perfect matching over it, kekulization always succeeds.

[Figure: deselection]

The opposite operation can be accomplished with a *selection algorithm*. A selection algorithm selects two or more eligible atoms, thereby adding them to the DS. The only requirement for a selection algorithm is that the resulting DS must have a perfect matching. Depending on the application, other criteria may be applied. For example, a selection algorithm can restrict candidate atoms to those found in cycles. Electron-counting techniques can also be introduced to approximate the chemical concept of "aromaticity." A double bond between two selected atoms may or may not be elided, depending on the application.

[Figure: selection algorithm]

# Implicit Hydrogens and Subvalence

In addition to virtual hydrogen count, Dialect supports a second form of hydrogen suppression called *implicit hydrogens*. Like a virtual hydrogen, an implicit hydrogen is monovalent, has only default attributes, and is present as an integer tally associated with a particular atom. But unlike a virtual hydrogen, the presence of an implicit hydrogen can only be deduced through computation. Implicit hydrogens are an integral yet invisible component of many molecular graphs.

To support implicit hydrogen counting, Dialect uses the concept of *valence*. Valence is a non-negative integer computed as the sum of bond orders at a given atom. Single bonds contribute one to the tally, double bonds two, triple bonds three, and quadruple bonds four. Every other bond contributes one, as does each virtual hydrogen. For example, the valence of a methyl carbon having a `virtual_hydrogens` attribute of three is four. In contrast, the valence of a methyl carbon with an undefined `virtual_hydrogens` attribute is one.

Only some atoms are eligible for implicit hydrogen counting. These are called *eligible atoms*. An atom becomes eligible by fulfilling two requirements: (1) its `virtual_hydrogen` attribute is undefined; and (2) its `element` attribute is associated with at least one *default valence*.

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
|   At    |       1        |
|   Ts    |       1        |
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

Consider an isolated atom having a `symbol` of "N" and an undefined `virtual_hydrogen` attribute. The atom's bond order sum is zero. Its default valences are 3 and 5. The difference `d` is found to be three (3 - 0). Therefore, subvalence of this atom is three.

The carbon atom of acetaldehyde illustrates the effect of substitution. The valence for the carbon atom is three (2 + 1). The first and only default valence is four. Subtracting three from four yields one, which is returned as the atom's subvalence.

The phosphorous atom in phosphorous acid (H3PO3) illustrates the use of Algorithm 1 for atoms with multiple target valences. Given an undefined `virtual_hydrogen` attribute, the atom's bond order sum is four (2 + 1 + 1). The first target valence is 3, but subtracting that value from four yields a negative number (-1). Continuing to the next default valence, 5, a difference of 1 is obtained. Therefore, the subvalence of the phosphorous-bearing atom is reported as 1.

The subvalence of some atoms exceeds the largest default valence. In these cases, subvalence is reported as zero. Consider sodium perchlorate (NaClO4). The chlorine atom has a bond order sum of seven (2 + 2 + 2 + 1). From Table 1, the only target valence for chlorine is one. Subtracting seven yields a negative number (-6). Therefore, the subvalence is reported as zero.

The subvalence for ineligible atoms is zero.

# Computing Implicit Hydrogen Count

For unselected atoms, implicit hydrogen count equals subvalence. Consider an oxygen atom with undefined `virtual_hydrogens` attribute. Subvalence equals two and so does implicit hydrogen count. However, an oxygen atom with a `virtual_hydrogens` attribute of one will have an implicit hydrogen count of zero.

For selected atoms, a modified procedure is used. If subvalence is greater than zero, then the implicit hydrogen count equals subvalence minus one. This subtraction models the unpaired electron that would would be required for delocalized bonding, or localized bonding if the atom were deselected. Consider a selected carbon atom in benzene whose `virtual_hydrogen` attribute is zero. Subvalence equals two, so implicit hydrogen count equals one (2 - 1).

A selected atom with an undefined `virtual_hydrogens` attribute and subvalence equal to zero has an implicit hydrogen count of zero. The semantics of such a state may seem suspect. If an atom has no unpaired electrons, how can it participate in delocalized bonding? As will be explained in more detail later (Pruning), this situation can arise through gratuitous atom selection. Returning zero avoids miscalculation of the implicit hydrogen count.

An implicit hydrogen count may or may not correlate with chemical intuition or the structures of known substances. Consider the phosphorous-bearing atom of hypophosphorous acid (HOP(O)H2). Given that the phosphorous atom is encoded with an undefined `virtual_hydrogens` attribute, we might expect a virtual hydrogen count of two. However, the subvalence for this atom is found to be three (2 + 1 - 3). The implicit hydrogen count is therefore zero (3 - 3) rather than the expected two. Such atoms must be encoded with a defined `virtual_hydrogens` attribute.

[Figure: Example structures with implicit hydrogen counts]

# Atom Identifier

To support the assignment and interpretation stereochemical features, each node is assigned a sequential, unique, non-negative integer `id` attribute ("identifier"). The value of an atom's identifier equals zero for a molecular's graph's first atom. The identifier for each subsequently-added atom equals the order (node count) of the graph prior to the addition. For example, the identifier for the second atom is one, the identifier for the third atom is two, and so on. There is no upper bound on the value of the identifier, although practical limitations of computer hardware and software will likely impose one.

Identifiers impose an ordering over the atoms in a molecular graph. An atom with an identifier less than another atom is said to *precede* it. An atom with an identifier grater than another atom *succeeds* it. No special significance is ascribed to the atom whose identifier is zero, except that every other atom succeeds it.

# Conformation

The second major component of molecular representation in Dialect is *conformation*. Conformation is a rotational restriction about one or more bonds. Dialect limits conformation to just one of many possible types: rotational restrictions occurring at individual double bonds.

Organic chemistry uses the parity descriptors *entgegen* (*E*) and zusammen (*Z*) to label conformational parity. This system is based on prioritization of the atoms neighboring the double bond. One pattern of priority yields the *E* parity, and the other yields *Z*. Conveniently, the parity descriptor can be localized at the double bond.

[Figure: E and Z]

Dialect takes a different approach by introducing **partial parity bonds** (PPB). As the name implies, a PPB expresses a portion of the parity characterizing a conformationally-restricted double bond. Constructing the full parity requires the double bond itself, and at least two PPBs. At least two PPBs must flank the double bond.

A PPB possesses three attributes: `source`, `target`, and `state`. The `source` and `target` attributes are the identifiers assigned to the PPB's beginning and end terminals, respectively. The atom with the same identifier of a PPB's `source` attribute is called its *source*. The atom with the same identifier as a PPB's `target` attribute is called its *target*. The `state` attribute is an enumeration comprised of the values `Up` and `Down`.

[Figure: Partial Parity Bond]

The PPB `state` attribute refer to a geometrical model in which the two terminals of a double bond and their neighbors are assigned local relative coordinates on a plane. The double bond terminals are placed on the x-axis such that the terminal with the lowest `id` attribute appears to the left of the terminal with the higher atomic `id` attribute. These terminals are designated "left terminal" and "right terminal," respectively. Each neighbor of a terminal is then assigned a relative coordinate based on the `index` attribute and the state of its PPB bond.

[Figure: Interpreting Partial Bonds]

The following procedure assigns a relative coordinate to a neighbor of the left terminal. First, determine the relative order of the identifiers for the neighbor and the left terminal. If the neighbor succeeds the left terminal, place the neighbor to the upper left of the terminal if the bond state is `Up`, or to the lower left if the bond state is `Down`. If the terminal succeeds its neighbor, reverse these assignments.

An analogous procedure assigns relative coordinates to a neighbor of the right terminal. If a neighbor succeeds the right terminal, place the neighbor to the upper right given an `Up` state, or to the lower right given a `Down` state. Reverse these assignments if the right terminal succeeds its neighbor.

In some cases the placement of a terminal neighbor can be deduced from the placement of a sibling, without the presence of an explicit PPB. For example, a left terminal has two neighbors, but only one of them uses a PPB. The neighbor with the PPB can then be placed explicitly. Doing so allows the remaining neighbor without a PPB to be placed as well. For example, if the neighbor of a left terminal is placed in the upper left quadrant, then the sibling without a PPB can only occupy the lower left quadrant.

[Figure: Implied Neighbor Placement]

The assignment of relative coordinates to both terminals and all neighbors yields a double bond conformation.

Consider the encoding of PPBs for (*E*)-2-butene. Assume that identifiers are assigned sequentially from left to right and the goal is to arrive at a trans (or anti) substituent orientation. Begin by placing the two double bond terminals on the x-axis. Left and right terminals are placed on the basis of succession. The left terminal (Atom 1) succeeds its neighbor (Atom 0), which should be placed in the lower-left quadrant. To achieve this, assign a PPB state of 'Up'. The right terminal (Atom 2) precedes its neighbor (Atom 3), which should be placed in the upper-right quadrant. To active this, assign a PPB state of 'Up'.

[Figure: Assigning PPBs to (*E*)-2-butene]

In a similar manner assigned PPBs can be decoded. The process starts by placing Atom 1 to the left of Atom 2 along the x-axis. The PPB between the left terminal and its neighbor (Atom 0) uses the `Up` state. The neighbor precedes the left terminal, so Atom 0 should be placed in the lower-left quadrant. The PPB between the right terminal and its neighbor (Atom 3) uses the `Up` state. The neighbor (Atom 3) succeeds the right terminal (Atom 2). Therefore, Atom 3 is placed in the upper right quadrant. This results in the expected conformation (*E*).

The above procedures assume that all PPBs are expressed in *normal form*. In normal form, a PPB's source precedes it target. In other words, `source` is less than `target`. If a PPB is not in normal form, it must be *inverted* before quadrants can be assigned. Inversion swaps the values of `source` and target attributes while simultaneously toggling the `state` attribute. Inversion occurs in two contexts: conjugated polyenes and cycles. In the case of polyenes, the same PPB carries partial conformation for at least two different double bond systems. In the case of cycles, non-normal PPBs can be generated at bonds forming cycles. However, readers and writers must be capable of inverting PPBs wherever they appear.

Consider (*E*)-2-butene. The PPB spanning atoms 0 and 1 will typically be encoded as the tuple `(0, 1, Up)` because this orientation tracks the order of atom identifiers. However, the PPB can be equivalently encoded as the tuple `(1, 0, Down)`. Before this representation can be used, it must first be inverted into the equivalent form represented by the tuple `(0, 1, Up)`.

[Figure: PPB inversion]

The distributed nature of conformational encoding means that several additive error states are possible:

- Overspecification. This state occurs when two or more PPBs share a common ancestor and simultaneously use the same parity, this placing multiple neighbors into the same quadrant.
- Underspecification. A required and non-deducible PPB is absent. This state occurs when a double bond terminal connects to at least one neighbor through a PPB, but the terminal's mate does not.
- Misspecification. A PPB is used between atoms lacking at least one double bond.

A reader that detects one of these error conditions must abort the molecular graph being read and report the error state. It is possible for a conformation to be both overspecified and underspecified.

[Figure: Error States]

An exception to the underspecification rule applies in the case of conjugated polyenes. In this case a double bond with a terminal bearing a PPB does not require the opposing terminal to also bear a neighbor with a PPB. If the opposing terminal lacks neighbors, no error is generated and reading continues normally. If the opposing terminal has at least one neighbor, the bond to it need not be a PPB. In either case the conformation of the double bond in question remains undefined.

[Figure: Error State Exceptions]

Given that conformational specification is distributed over three or more bonds, some conformations will be difficult or possible to represent. Cyclooctatetraene offers an example. Although the (E, E, E, E) conformation is accessible, the (Z, E, E, E) conformation is not. This problem arises because the same PPB encodes a partial conformation of two different double bonds.

[Figure: Cyclooctatetraene]

# Configuration

The third major element of molecular representation is *configuration*. Configuration is the three-dimensional arrangement of neighbors about an atom. Dialect limits conformation to the special case of an atom with exactly four substituents placed at the vertexes of a tetrahedron. Here, "substituent" means an atomic neighbor; lone electron pairs are not considered substituents. One of the four substituents may be a virtual hydrogen. 

A configuration is comprised of two components: an ordering of bonds to a central atom; and a *configurational descriptor*. A configurational descriptor is a template for the relative three-dimensional positioning of neighbors about a central atom. Dialect supports two configurational descriptors: `TH1` and `TH2`. For reasons that will soon become clear, these descriptors are also known as "clockwise" and "counterclockwise," respectively.

The descriptors `TH1` and `TH2` restrict neighboring atoms to the vertices of a tetrahedron whose center is the central atom. First, the mate of the first bond to the central atom is placed at an arbitrary vertex. Then shift the frame of reference by sighting along the first bond from the neighbor toward the central atom. Finally, arrange the remaining neighbors using the ordering of bonds to the central atom. For the `TH1` descriptor, use a counterclockwise distribution. For the `TH2` descriptor, use a clockwise distribution.

[Figure: Configurational Descriptor]

If an atom bears one virtual hydrogen and three substituents, a modified procedure is used. The virtual hydrogen is first placed at an arbitrary vertex of the tetrahedron. The tetrahedron is then oriented along the axis pointing from the virtual hydrogen to the center. Neighbor atoms are then distributed in a counterclockwise (`TH1`) or clockwise (`TH2`) pattern to the remaining vertices.

[Figure: Configurational Descriptor with Virtual Hydrogen]

The association of a configurational descriptor with an atom implies a neighbor count of either four if no virtual hydrogens are present, or three if exactly one virtual hydrogen is present. In any other context, the use of a configurational descriptor is considered an error.

This restriction places some constraints around the use of configuration. For example, the use of `TH1` and `TH2` descriptors with the elongated tetrahedron of allenes and other cumulenes might seem valid. However, this use is invalid because the central atom lacks four substituents. Similarly, it is invalid to consider lone pairs for placement within the tetrahedral template. Chiral sulfoxides represent a class of molecules in which such features are present.

[Figure: Invalid Uses of Configurational Descriptors]

A configurational descriptor may be applied without regard to bond type. In other words, single, double, triple, quadruple, and partial parity bond types can all be present. The only requirement that must be satisfied is four substituents or, equivalently, three substituents and a virtual hydrogen.

It is sometimes useful to manipulate a configuration in a way that preserves the relative three-dimensional positioning of neighbor atoms. This process is called *transformation*. Five rules suffice to transform any configuration into any other:

- *Virtualize*. Replaces an atomic hydrogen neighbor with a virtual hydrogen. If the deleted bond was first in the bond ordering, toggle the configurational descriptor.
- *Reify*. Replaces a virtual hydrogen with an atomic hydrogen neighbor. The bond ordering must place the new neighbor in the second position.
- *Swap*. Exchanges any two bonds ordered second or higher while simultaneously toggling the configurational descriptor.
- *Slide Left*. Re-orders a bond from the first position to the second position. Disabled if the central atom carries a virtual hydrogen.
- *Slide Right.* Re-orders a bond from the second position to the first position. Disabled if the central atom carries a virtual hydrogen.

[Figure: Transformations]

# Syntax

A Dialect string ("string") is a sequence of one or more UTF-8 characters encoding one or more molecular graphs. The internal structure of a string reflects a depth-first traversal of the corresponding molecular graphs. As such, the syntax supports branches, cycles, and disconnected components.

Strings conform to an *LL(1) grammar*. An LL(1) grammar is a context-free grammar whose strings can be parsed one character at a time from left to right with at most one character of lookahead. Additionally, LL(1) grammars expand the leftmost non-terminal first. This set of features makes LL(1) grammars such as the one used by Dialect a good fit for manually-written recursive descent parsers. LL(1) grammars can also be used as a basis for auto-generated parsers through packages such as ANTLR.[@parr2014] The full grammar for Dialect strings is available as a text file in this paper's Supporting Material.

Rather than present the Dialect formal grammar here, however, a series of *railroad diagrams* will be used instead. A railroad diagram represents the rules for constructing valid strings for a language graphically. Construction begins at the origin, advancing only over rightward-curving lines until the rightmost destination is reached. Both origin and destination are depicted with the double pipe symbol (`||`). Lines passing through a terminal (bounded by an oval) add characters to the string. Lines passing through a non-terminal (bounded by a square) expand to the named diagram. The graphical nature of railroad diagrams allows them to be readily understood by experts and non-experts alike.

## Atom

As noted previously, Dialect's representation is centered on `Atom`. The non-terminal `<atom>` offers four broad approaches to atomic encoding.

![&lt;atom&gt;.](../build/atom.svg)

The first atomic production rule, `<star>`, is a non-terminal whose only possible representation is the asterisk character (`*`). This "star atom" represents and `Atom` whose every attribute is assigned the corresponding default value. The implicit hydrogen count of a start atom is zero.

![&lt;star&gt;.](../build/star.svg)

The next atomic production rule, `<shortcut>` is a non-terminal comprised of the terminal element symbols: "B"; "C"; "N"; "O"; "P"; "S"; "F"; "Cl"; "Br"; "I"; "At"; "Ts"; "P"; and "S". An `Atom` encoded in this way ("shortcut atom") assigns the corresponding symbol to the `element` attribute. All other attributes retain their default values. The implicit hydrogen count of a shortcut atom is determined by the algorithm previously given.

![&lt;shortcut&gt;](../build/shortcut.svg)

The third atomic production rule, `<selected_shortcut>` is a non-terminal comprised of the terminals: "b"; "c"; "n"; "o"; "p"; and "s". An `Atom` encoded in this way ("selected shortcut atom") assigns the corresponding atom symbol to the `element` attribute and sets the `selected` attribute to `true`. All other attributes retain their default values. The implicit hydrogen count of a selected shortcut atom is determined as described previously. Note that pruning may be required.

![&lt;selected_shortcut&gt;.](../build/selected-shortcut.svg)

The fourth, and most complex, atomic production rule is `<bracket>` ("bracket atom"). It can be used to set any atomic attribute other than `element` or `selected`. A bracket atom must be used when the `element` attribute of an `Atom` makes it ineligible for implicit hydrogen counting. Attributes not set within the `<bracket>` production rule will leave the corresponding atomic values in their default states.

![&lt;bracket&gt;.](../build/bracket.svg)

The value of a bracket atom's `isotope` attribute is determined by the `<isotope>` non-terminal. It consists of between one and three digits encoding the integers 1-999. The range of possible integer values was chosen to include all possible physical isotope mass numbers while excluding zero.

![&lt;isotope&gt;.](../build/isotope.svg)

![&lt;non_zero&gt;.](../build/not_zero.svg)

![&lt;digit&gt;.](../build/digit.svg)

The values of a bracket atom's `element` and `selected` attributes are determined by the `<symbol>` production rule ("symbol"). Three non-terminal options are available: `<star>`; `<element>`; and `<selected_element>`.

![&lt;symbol&gt;.](../build/symbol.svg)

Choosing the `<star>` non-terminal within a symbol leaves the atomic `element` and `selected` attributes as their default values (`undefined` and `false`, respectively).

An `<element>` non-terminal found within a symbol assigns the `element` attribute to the corresponding value while leaving the `selected` attribute as its default value. Given the large number of choices within the `<element>` non-terminal, its railroad diagram only presents the first several. For a complete list, see the EBNF grammar in the Supporting Information.

![&lt;element&gt;.](../build/element.svg)

A `<selected_element>` non-terminal found within a symbol sets the atomic `selected` attribute to `true`. The corresponding `element` attribute is assigned by capitalizing the first character. For example, the terminal `as` would assign the atomic `element` and `selected` attributes to the values `As` and `true`, respectively.

![&lt;selected_element&gt;.](../build/selected-element.svg)

The `stereodescriptor` attribute of a bracket atom is determined by the `<stereodescriptor>` non-terminal. Allowed values are "@" and "@@", representing `TH1` (counterclockwise) and `TH2` (clockwise) tetrahedral configurations, respectively.

![&lt;stereodescriptor&gt;.](../build/stereodescriptor.svg)

The `virtual_hydrogens` attribute of a bracket atom is controlled by the `<virtual_hydrogen>` non-terminal. This non-terminal is comprised of the terminal `H` followed by an optional non-zero digit (`1`...`9`). A digit appearing after the `H` terminal sets the atomic `virtual_hydrogen` property to the corresponding value. If a digit does not appear, the `virtual_hydrogen` atomic property is set to one.

![&lt;virtual_hydrogen&gt;.](../build/virtual-hydrogen.svg)

The `<charge>` production rule sets the `charge` attribute of a bracket atom. This non terminal begins with either the plus or minus terminals (`+`, `-`, respectively) and ends with an optional non-zero digit. A missing digit defaults to the value `1`. So `+` becomes `+1` and `-` becomes `-1`.

![&lt;charge&gt;.](../build/charge.svg)

The presence of an `<extension>` non-terminal sets the `extension` attribute of the corresponding bracket atom. A colon terminal (`:`) is followed by between to and four `<hex>` nonterminals. 

![&lt;extension&gt;.](../build/extension.svg)

A `<hex>` non-terminal is in turn chosen from the non-terminals representing the hexadecimal digits (`0`...`9` and `a`...`f`). The `extension` attribute of a bracket atom will therefore assume a hexadecimal value between `0x0000` and `0xffff`, inclusive, given the presence of an `<extension>` non-terminal.

![&lt;hex&gt;.](../build/hex.svg)

## Bond

An `Atom` may be connected to zero or more neighbors through a `Bond`, encoded with the non-terminal `<bond>`.

![&lt;extension;&gt;.](../build/bond.svg)

Six terminals are available (`-`, `=`, `#`, `$`, `/`, and `\`). The first four (`-`, `=`, `#`, `$`) set the `order` attribute of a `Bond` to `single`; `double`; `triple`; and `quadruple`, respectively. The last two, `/` and `\`, set the `order` attribute to `single` while also setting the `state` attribute to `Up` and `Down`, respectively.

## Sequence

An `Atom` may be assigned zero or more children through the `<sequence>` non-terminal ("sequence"). A sequence starts with a required `<atom>` non-terminal. If no allowed non-terminals follow, the corresponding `Atom` will have no children. Allowed non-terminals are chosen from the list: `<union>`; `<branch>`; and `<sequence>`.

![&lt;sequence&gt;.](../build/sequence.svg)

The appearance of the `<sequence>` non-terminal within the non-terminal itself is an example of recursion. Although left-recursion is disallowed in LL(1) grammars, right recursion of the kind in `<sequence>` is allowed. Right recursion also occurs within the `<union>` and `<branch>` non-terminals.

The `<union>` non-terminal consists of an optional `<bond>` non-terminal followed by a mandatory non-terminal selected from the list: `<cut>` or `<sequence>`. If either of these latter non-terminals are detected but `<bond>` is not, bond elision is used. 

![&lt;union&gt;.](../build/union.svg)

The `<cut>` non-terminal ("cut") can takes two forms. A digit terminal (`0`...`9`, inclusive) can be used. This allows for single-digit cut indexes. Two-digit cut indexes, supporting the values zero through 99 inclusive, are available through single- or double-digit indexes serve to mark ring closure.

![&lt;cut&gt;.](../build/cut.svg)

A cut signifies the disconnection of an `Atom` from its neighbor. The most common use for cut is to encode a cycle. The cut index serves as a placeholder for the neighboring `Atom`, which is located by scanning either forward or backward along a string. If the number of previous appearances of the cut index is even, then the string is scanned right. Otherwise, the string is scanned left. Although often used for cycles, cuts can be used for any bond, regardless of cycle membership. The only requirement is that a cut must be paired with another cut having the same index.

[Figure: Cut]

To prevent overflow, a cut index may be reused provided that it appears to the right of its last paired appearance.

An alternative to `<union>` within a sequence is the `<branch>` non-terminal ("branch"). Like `<union>`, branch joins a parent and child node through a bond. Wrapped by opening and closing parenthesis terminals (`(` and `)`, respectively), the purpose of a branch is to define a subgraph. This subgraph is attached to the parent atom if the `<bond>` terminal is included. Alternative, the subgraph will be detached if the `<detached>` non-terminal appears. If neither `<bond>` nor `<detachment>` non-terminals are detected between the parentheses but a sequence is, then bonding of parent and child occurs through elision.

![&lt;branch&gt;.](../build/branch.svg)

The third option for associating a parent Atom with a child within a sequence is the `<split>` non-terminal ("split"). A split is a sequence of `<detachment>` and `<sequence>` non-terminals. The `<detachment>` non-terminal serves the same purpose as it does within a branch: the prevent the bonding of the parent `Atom` with a child.

![&lt;split&gt;.](../build/split.svg)

Having defined these non-terminals, it's now possible to define a string as an optional sequence. In other words, a Dialect string is comprised of one or more sequences. A string without sequences encodes a molecular graph of zero nodes and zero edges.

![&lt;string&gt;.](../build/string.svg)

# Reading Strings

The goal of a Dialect reader is to transform a string input into a data structure output consistent with the string's content. The output data structure can take many forms. For example, a reader can merely validate a string by returning a boolean type. A more sophisticated reader can return a molecular graph capturing all `Atom` and `Bond` attributes and connectivity relationships.

Dialect strings are read one character at a time starting at the leftmost character and finishing at the rightmost character. The first character sets an initial reader state, and each subsequent character causes a state transition. The cumulative application of these state transitions yields the data structure to be returned.

Readers that capture `Atom`-`Atom` connectivity will typically maintain a reference to a *root atom*. The root atom is initially undefined. On reading the first complete `<atom>` non-terminal, the corresponding `Atom` is constructed and set as the root atom. Subsequently processing a complete `<union>`, `<branch>`, or `<split>` non-terminal triggers three changes: (1) a child `Atom` is constructed; (2) the child is connected to the current root atom, unless a `<detachment>` non-terminal intervenes; and (3) the root atom is replaced with the child atom.

The presence of a branch adds some nuances over a union. The leading open parenthesis terminal (`(`) signifies that the current root atom will later be re-exposed. This operation can be supported by a stack. At the start of a branch, the current root is pushed to the stack. At the end of the branch, the stack is popped and its top value is assigned as the new root atom.

[Figure: Stack for Branches]

Further workflow adjustments can handle cuts. The necessary state can be maintained by a 100-element array. The first occurrence of a cut creates an entry in the array at the cut index consisting of the bond and the root atom. The second occurrence of a cut takes the entry at the cut index, attaching the atom in the entry to the current root atom. Either the leftmost or rightmost bond can be used to make the connection, provided they are *compatible*.

[Figure: Array for Cuts]

Two cut bonds are compatible if they possess the same `order` attributes, and their `state` attributes are complementary. Bonds with undefined `state` are always complementary. A bond with a defined `state` is complementary to any `Bond` with an undefined state, or a `Bond` with an opposing `state`. For example, an elided `Bond` is compatible with a single `Bond`. Likewise, two elided `Bond`s are compatible. A `Bond` with a `state` of `Up` is incompatible with another `Bond` with a `state` of `Up`, but compatible with one having a `state` of `Down`.

[Figure: Bond Compatibility]

Decoding atomic configuration from a string requires the order of attachment from each `Atom` to its neighbors to be recorded. Cuts are treated as if the neighboring atom itself were detected. In this regard, the first member of a cut pair requires special attention. The neighboring `Atom` won't be available until the paired cut index is found. Nevertheless, it must ultimately appear before the neighbors in subsequent unions, branches, and splits. This can be accomplished though the use of a placeholder or some other mechanism that preserves the overall relative order of attachment. No such special treatment is needed for the second member of a cut pair.

[Figure: Order of Attachment]

A reader must assume that any input string can contain errors, and take appropriate steps to report them. The most useful errors will report a specific cause. Some will also report one or more cursor indexes. The most common mandatory errors are:

- Invalid character (position). An unexpected character was encountered. A list of acceptable characters is helpful, but not required.
- Unexpected end-of-line. Input ended unexpectedly.
- Unbalanced cut (position). A cut with a given index appears an odd number of times.
- Incompatible cut bonds (position, position). The bonds to a pair of cuts are incompatible.
- Delocalization subgraph lacks perfect matching. Before reporting this error, steps to remove ineligible atoms should be taken as described in the next section.
- Partial parity bond not allowed (position). Neither terminal of a PPB possesses a double bond.

A reader may report other kinds of optional errors, including:

- Impossible isotope. A negative implied mass number results from the atom. For example, `[2C]`.
- Impossible valence. The valence at an `Atom` is impossibly high. For example, `C(C)(C)(C)(C)C`.
- Impossible charge. An `Atom`'s charge gives it an apparent negative electron count. For example, `[C+7]`.

# Pruning

As noted previously, a delocalization subgraph is invalid if no perfect matching can be found. The one exception is when a selected atom can be deleted from the delocalization subgraph through *pruning*. Pruning toggles the `selected` attribute of a selected atom, without changing the semantics of the molecular graph. Any atom whose subvalence equals zero can be safely pruned.

Pruning becomes necessary in cases of gratuitous atomic selection. This occurs whenever style, tradition, or convenience conflict with necessity. Consider furan represented as the string `c1ccco1`. Selecting any atom is unnecessary because furan does not exhibit DIME. But selecting the oxygen atom is particularly unnecessary because it lacks an unpaired electron and so will never lead to DIME. It is nevertheless convenient to select the carbon atoms because all bonds can then be elided. The resulting representation, `c1cccO1` leads to a delocalization subgraph with a perfect matching and is therefore preferred over the one with a selected atom.

Writers are encouraged, but not required, to avoid gratuitous atom selection. Readers, however, must always be prepared to prune it away.

# Writing Strings

Whereas a reader transforms a string into a data structure, the goal of a writer is the opposite: to transform a data structure into a valid string. This data structure will most commonly take the form of a molecular graph, but other forms are possible. Although a graph itself could be used as the basis for an input representation, a more primitive representation such as an adjacency list could also be used. For practical reasons, the input data structure is likely to resemble the output from a reader. Such an arrangement makes it possible to encode and decode strings with minimal intermediate translation.

Regardless of the form taken by the input data structure, it must be traversable in *depth-first* order. A depth-first traversal operates over a set of nodes bound by a set of connectivity relationships, which are typically edges. Traversal proceeds by successively replacing each node as the center of focus, or root. Each new root is selected from the untraversed neighbors of the current root. Iteration eventually selects all nodes, at which point the traversal ends.

[Figure: depth-first traversal]

A writer intercepts the depth-first traversal of an input data structure to write node and edge representations. The `<atom>` and `<bond>` non-terminals are used for this purpose. There are no requirements around style. For example, it's equally valid to represent the carbon atom of methane as either `C` or `[CH4]`. Single bonds may be elided or not. Similarly, selection can be used or not for eligible atoms. Although an organization may seek to standardize certain styles of string output, any syntactically-valid string must be considered valid by a reader.

The presence of branches within an input data structure is encoded via the `<branch>` data structure. A useful tool for this purpose is a *stack*. A stack is a data structure that allows items to be added individually and removed ("popped") in the reverse order of addition. A writer begins by pushing the current branch onto the stack and extending it. When a new branch is encountered, it is pushed to the stack and extended. When the branch terminates, the current branch is popped and its contents are appended to the stack's new top item.

[Figure: stack]

Cycles are encoded using the `<cut>` non-terminal. This one- or two-digit integer replaces one terminal of a cycle closure bond. The challenge is to unambiguously supply these integers while allowing re-use to avoid overflow. This can be accomplished with a *pool*. A pool is a data structure that yields a numerical index given an ordered pairing of atomic identifiers. The numerical index will not be re-issued until the pool receives the corresponding reversed pairing.

[Figure: pool]

A pool can be used by a writer in the following way. The presence of a cycle during depth-first traversal is indicated by an atom that has already been traversed. On encountering a cycle, a writer requests an index from the pool, submitting the corresponding atomic identifiers as an ordered pair. Later, the same bond must be reversed in the reverse direction. When it is, the writer once again requests an index, but this time using a reversed pairing. Doing so yields the same index, while simultaneously freeing it for later use.

# Discussion

Dialect's main advantage as a molecular serialization format is high information density. The most common atom types can be represented with just one character. The worst case atom, using every available atomic attribute, requires 14 characters. The most common bond types can be encoded implicitly. In the worst case one character per bond is required.

These metrics compare favorably with alternatives. Consider the molfile (V2000) format. 32 characters per atom are required in the best case, and 51 characters in the worst. All bonds, regardless of type, require between nine and 12 characters. Atomic charges and isotopes typically require additional characters.

The small size of Dialect strings makes them attractive for several applications. In memory-constrained environments such as those found on handheld devices and network serialization, many more Dialect strings can be present than alternative encodings. In-memory structure search over large collections becomes feasible. Because a Dialect string often fits within one line on a terminal, it can be used for data entry in manual interactive shells such as a real-eval-print loops (REPLs) or notebooks.

Another advantage is lossless serialization and deserialization. Another line notation, InChI, might appear to compete with Dialect in this sense. Although InChI can be read and written, the InChI Technical manual notes that InChI's value lies in molecular identification. The authors of InChI have repeatedly noted that InChI is not a solution to the molecular serialization problem. The reason presumably lies with the fact that both serialization and deserialization require intimate knowledge of the InChI canonicalization algorithm. To date, no third-party reader or writer of InChI has ever been released.

Despite its information density, Dialect can faithfully encode and decode most of what chemists would consider "organic molecules." This is evidenced by the widespread presence of Dialect strings within large, public-facing databases such as PubChem, ChEMBL, ChEBI, and eMolecules.

Dialect's compact representation requires some tradeoffs regarding expressiveness. Extended bonding beyond the delocalization subgraph is not supported. This limitation excludes many types of molecule, including organometallics and delocalization-stabilized ions. Zero-order bonds are not supported, making it difficult to accurately encode coordination complexes. Only four-coordinate, tetrahedral stereocenters can be encoded, excluding many forms of chirality, including helical chirality, all forms of non-tetrahedral stereochemistry, and lone-pair tetrahedral centers. Conformational restrictions beyond the isolated double bond are not supported, which excludes important molecules such as those exhibiting atropisomerism. Other formats such as CDXML and molfile support enhanced stereochemical features enabling the differentiation of various kinds of partial stereochemical information, but Dialect does not.

Because it is based on SMILES, Dialect must adhere to certain questionable design choices made in the earlier language. The most noteworthy is partial parity bonds. The difficulties in working with PPBs have been noted in previous sections. The numerous opportunities for error when working with PPBs will no doubt serve as a rich source of software defects. 

Even so, certain common yet problematic SMILES features have been left out of Dialect. Some SMILES dialects treat tellurium as a selectable element within a bracket, but Dialect does not. This decision was driven by four factors: (1) there are many elements beyond tellurium that one may wish to include; (2) there is no good reason to exclude many of them; and (3) a large set of selectable elements complicates grammar and the implementation of readers/writers. Another feature supported by some SMILES implementations is non-tetrahedral atomic configuration. The complexity of these templates makes them very difficult to implement. Moreover, they are rarely used. Most importantly, however, they are not complete. The so-called "aromatic bond" (`:`) has been omitted from Dialect, mainly because it appears to be unnecessary, and this interpretation is not universal. Extreme charges (beyond -9 or +9) are not supported because they are extremely rare and merely clutter the grammar while confounding implementations. Arbitrary element symbols are sometimes supported by SMILES implementations, but not by Dialect. Doing so complicates the task of implementing the readers and writers for minimal gain.

Choosing SMILES features to be included in Dialect raises the difficult question of defining SMILES itself. Unfortunately, this would appear to be an impossible task. The original SMILES paper omitted crucial topics such as atomic configuration and double bond conformation, and only incompletely discussed atom selection and its effects on implicit hydrogen count. There was no detailed discussion of grammar. Over the years, developers of SMILES readers and writers have addressed these shortcomings on an ad hoc basis and with little discussion in the wider cheminformatics community. To further complicate matters, many implementors have developed their own extensions, treating them as part of the language. The result is a plethora of dialects without a fully specified core.

Dialect attempts to solve this problem by fully specifying the largest possible subset of behaviors generally regarded as part of SMILES. Every string generated by a Dialect writer should be recognized as valid by modern SMILES readers. However, not every string generated by modern SMILES writers will be recognized as valid by a Dialect reader.

Beyond validity is the question of interpretation. Although Dialect's semantics have been described in full by this paper, the same can not be said for SMILES. Dialect deliberately omits some SMILES capabilities likely to be misinterpreted, but others remain due to their universal use. The largest source of semantic incompatibility is likely to be atom selection and its effect on implicit hydrogen counting. The detailed protocol presented in this paper is without parallel in the SMILES literature. The second most likely source of semantic incompatibility will likely be double bond conformation. Although this topic has been treated a length here, SMILES documentation on this topic is not as detailed &mdash; particularly with respect to implementation.

Applications requiring features beyond those supported by Dialect can use the atomic extension field. This integer field allows atoms to be individually associated with one of ten thousand unique labels whose values range from 0 to 9999, inclusive. When used with an application-specific dictionary, the extension field allows atoms to carry a wide range of additional attributes. Readers must report the contents of this field, allowing extension code to capture extension values for later use.

Broader expansion of Dialect's capabilities could be possible through *metaformats*. A metaformat embeds one or more Dialect strings within a surrounding serialization format. For example, two- or three-dimensional coordinates could be associated with each atom through a metaformat that includes a dictionary mapping atomic index to coordinate. Collections of atoms could likewise be encoded to replicate the enhanced stereochemistry features of other formats. And so on. However, the utility of such extensions should be weighed against Dialect's main value proposition: high information density. An application attempting to use a verbose metaformat may benefit from adopting better-suited format instead.

Setting aside the many technical and usability issues a metaformat would raise, versioning is likely to play an important role. Dialect itself lacks any mechanism to convey the concept of version. This stands in contrast to InChI, which not only encodes a version identifier, but has done so from its first release. Adding a version identifier would, unfortunately, break compatibility with the large number of existing SMILES software. Metaformats offer an opportunity to address this limitation.

The availability of a minimal yet highly functional, fully-specified core language offers many opportunities to improve data quality. One of the most important will be a reference implementation, the design and source code of which will be discussed later. A freely-available reference implementation in turn makes automated validation suites possible. These suites can improve data quality by reporting syntax and semantic differences among implementations, preferably before release. A reference implementation taken together with the guidelines for readers and writers in this paper should make it possible to write software that conforms to a very high level of precision, regardless of programming language or paradigm. Given implementations known to be correct, performance optimizations can be considered. The existence of a core language specification should also aid standardization efforts, either for Dialect itself, or SMILES. Finally, the development of better line notations is only possible given a thorough understanding of the scope and limitations of existing options. Here, metaformats could offer a bridge from the present to the future.

# Conclusion

This paper describes Dialect, a subset of the widely-used SMILES line notation. Dialect's features are detailed at four levels: constitution; delocalization; conformation; and configuration. Constitutionally, Dialect can encode any molecule conforming to the valence bond model. In the event of undesired symmetry artifacts due to delocalization, Dialect offers a mitigation based in graph theory. Conformational isomerism of alkenes is supported by partial parity bonds. The configurations of tetracoordinate, stereogenic atoms are encoded through the use of a parity enumeration and conventions around its use.

Dialect's syntax is described in detail through both graphical diagrams and a formal grammar. The latter method concisely summarizes the complete set of strings that could be considered valid Dialect representations. The formal grammar was deliberately structured to be used either directly with an automated parser generator or with a hand-written recursive-descent parser.

The complete set of operations needed to interpret Dialect's syntax semantically are described in detail. This is a crucial component of the language's definition because Dialect achieves its information density largely by favoring convention over encoding. As an aid to difficult cases, guidelines for readers and writers are included.

As a subset of SMILES, Dialect can be used with a wide range of SMILES software today. In this sense, Dialect may seem to offer nothing new or even of value. However, Dialect has been defined at a level of detail that SMILES never was. This difference makes it possible to use Dialect in unique ways. Open reference implementations and validation suites can now be developed and deployed. Families of extensions can be built, each one based on the same unambiguous foundation. Formal standardization becomes more feasible given detailed reference material on which to draw. Finally, it is only through the clear demarcation of boundaries that the frontier becomes visible.

# References
