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

SMILES has since been widely adopted. Read and write functionalities are routinely supported by popular cheminformatics toolkits, including: Open Babel; RDKit; Chemistry Development Kit; JChem; the Daylight Toolkit; OEChem; and JChem. SMILES encodings can be found in many public-facing databases, including: PubChem; Kegg; ChEBI; the eMolecules Catalog; ZINC; and ChEMBL. Increasingly, raw SMILES strings are being used in both predictive and generative machine learning applications.

Despite its widespread adoption, SMILES remains a language with an incomplete specification. Weininger's 1989 paper either fails to address several crucial points entirely, or addresses them only superficially. Examples include: (1) no discussion of stereochemical configuration; (2) no specific protocol for encoding and decoding "aromatic" features; (3) an incomplete protocol for computing implicit hydrogen count; (4) no formal syntax description; (5) no constraints around quantities such as mass number or charge; (6) several points of ambiguity; and (7) no explicit enumeration of error states.

Additional SMILES documentation is available from the Daylight Theory Manual ("the Manual").[@daylightTheory]. Maintained by SMILES' corporate sponsor, Daylight Chemical Information Systems, Inc. (Daylight), the Manual further refines the SMILES language specification. The Manual also introduces a few extensions, including one for stereoisomerism. Some points around computing implicit hydrogen count were also addressed.

An implementation of SMILES is available through the Daylight Toolkit.[@daylightToolkit] Although this implementation could potentially address issues not resolved through documentation, the software's commercial distribution model restricts this use. For several years Daylight operated a web service that could interactively depict SMILES strings, but has since been decommissioned.

In 2007 a documentation effort that would become known as OpenSMILES began.[@openSMILES] OpenSMILES was conceived as "a non-proprietary specification for the SMILES language," and it addressed many of the points left open by previous SMILES documentation efforts. Noteworthy contributions included: the first formal grammar; many refinements around stereochemistry; and introduction of the idea of "standard form." Absent were detailed procedures for assigning and interpreting aromatic features, and a detailed procedure for computing implicit hydrogen count. OpenSMILES also left several points of semantic ambiguity unaddressed.

In 2019 IUPAC announced the SMILES+ initiative.[@smilesPlus] Noting the limitations of existing SMILES documentation, the SMILES+ effort seeks to "establish a formalized recommended up-to-date specification of the SMILES format." SMILES+ took as its starting point the documentation produced by the OpenSMILES project. Efforts to extend this starting point are in progress online through a public repository,[@smilesPlusRepo] but no formal recommendation has to date resulted.

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

# Implicit Hydrogens

In addition to virtual hydrogen count, Dialect supports a second form of hydrogen suppression called *implicit hydrogen count*. Implicit hydrogens are represented neither as node/edge pairs nor as node properties. Instead, an implicit hydrogen count is computed on demand. Like virtual hydrogens, implicit hydrogens must be monovalent an have an undefined `isotope` attribute. The algorithm for computing implicit hydrogen count is an integral but invisible component of every Dialect representation. Dialect readers and writers must therefore conform to the following description to avoid the loss of constitutional information.

For the purpose of implicit hydrogen counting, atoms can be divided into two classes: *eligible atoms* and *ineligible atoms*. Eligible atoms are those whose hydrogen counts may optionally be expressed algorithmically through implicit hydrogen counting. Ineligible atoms must use explicitly encoded hydrogens, either as node/edge pairs or as virtual hydrogens.

Implicit hydrogen counts are computed with the aid of Table 1. An atom whose `element` attribute appears in this table is considered an eligible atom. All other atoms, including those whose `element` attribute is undefined, are considered ineligible atoms.

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

Table 1 associates an eligible atom with an ordered list of *target valences*. A target valence defines the number of hydrogen atoms associated with a fully-saturated atom. For example, the target valence of 4 for carbon means that a fully-saturated carbon atom will be bound to four hydrogen atoms. Likewise, a fully-saturated oxygen atom will be bound to two hydrogen atoms. Some elements such as nitrogen are associated with multiple target valences. In these cases, multiple saturated forms are possible. For example, nitrogen has the target valences three and five. Both ammonia and nitrogen pentahydride (NH~5~) are fully saturated forms of nitrogen according to Table 1.

The procedure for computing the implicit hydrogen count for an atom (`a`) is defined in Algorithm 1.

\begin{algorithm}[H]
  \SetKwInOut{Input}{input}
  \SetKwInOut{Output}{output}
  \SetKwFunction{BondOrderSum}{BondOrderSum}
  \SetKwFunction{TargetValences}{TargetValences}
  \caption{Compute implicit hydrogen count}
  
  \Input{An eligible atom $a$}
  \Output{The implicit hydrogen count of $a$}
  \Begin{
    $v \leftarrow$ BondOrderSum($a$)\;
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

The algorithm accepts an eligible atom `a` as input and returns its implicit hydrogen count as output. First, the valence (sum of bond orders) for `a` is computed. Next, the ordered list of target valences (`T`) is obtained from Table 1. For each target valence (`t`), the difference (`d`) between `t` and `v` is computed. If this difference is non-negative, `d` is returned as the implicit hydrogen count. If no suitable target valence can be found, zero is returned.

Consider an isolated atom having a `symbol` of "N". Its bond order sum is zero. Its target valences are 3 and 5. The difference `d` is found to be three (3 - 0). Therefore, the implicit hydrogen count of this atom is three.

The carbon atom of acetaldehyde illustrates the effect of substitution. The bond order sum for the carbon atom is three (2 + 1). The first and only target valence is four. Subtracting three from four yields one, which is returned as the implicit hydrogen count.

The phosphorous atom in phosphorous acid (H3PO3) illustrates the use of Algorithm 1 for atoms with multiple target valences. In its hydrogen-elided form the formal bond order of the phosphorous-bearing atom is four (2 + 1 + 1). The first target valence is 3, but subtracting that value from four yields a negative number (-1). Continuing to the next target valence, 5, a difference of 1 is obtained. Therefore, the implicit hydrogen count of the phosphorous-bearing atom is reported as 1.

The bond order sum of some atoms exceeds the largest start valence. In these cases, the implicit hydrogen count is reported as zero. Consider sodium perchlorate (NaClO4). The chlorine-bearing atom has a bond order sum of seven (2 + 2 + 2 + 1). From Table 1, the only target valence for chlorine is one. Subtracting seven yields a negative number (-6). Therefore, the implicit hydrogen count is reported as zero. 

Some bonding arrangements render implicit hydrogen calculation unworkable. Consider the phosphorous-bearing atom of hypophosphorous acid (HOP(O)H2). We expect a hydrogen count at this atom of two. However, eliding the hydrogen atoms bound to the phosphorous-bearing atom yields an implicit hydrogen count of zero. First, a bond order sum of three is computed (2 + 1). Then, the first target valence from Table 1 is found to be 3. Because the difference between these two values is zero (3 - 3), Algorithm 1 returns an implicit hydrogen count of zero. In this and similar cases, hydrogen atoms must be explicitly expressed as either node/edge pairs or as a virtual hydrogen count.

[Figure: Example structures with implicit hydrogen calculations]

Only those eligible atoms with an undefined `hydrogens` attribute are subject to implicit hydrogen counting. In other words, implicit hydrogen counting is disabled on atoms whose `hydrogens` attribute is defined. For example, the correct hydrogen count for hypophosphorous acid would be obtained by setting its `hydrogens` attribute to two.

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

The third major element of molecular representation is *configuration*. Configuration is the three-dimensional arrangement of neighbors about an atom. Dialect limits conformation to the special case of an atom with exactly four substituents placed at the vertexes of a tetrahedron. One of the four substituents may be a virtual hydrogen.

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
