# Outline

A rough guide to what lies ahead. Added here for now, but these should probably become GitHub issues.

# Molecular Graph

- graph-based representation
  - simple, undirected
    - no loops or multiple edges
- atoms -> nodes, bonds -> edges
- two layers
  - one for atomic properties and localized bonding
  - one for delocalized bonding

# Valence Bond Graph

- about VB model
  - widely-used representation in cheminformatics
    - molfile
    - toolkits
  - undirected, simple graph
    - no loops, or multiple edges
  - atoms -> nodes
  - bonds -> edges
    - both atoms contributed n electrons, where n >= 1
    - important tradeoffs (addressed below)
  - atom, bond properties layered onto graph
  - non-empty (not universally the case)
  - unlimited # of nodes and edges
    - limited in practice
- atoms
  - properties
    - isotope
      - 1..999
      - optional
        - natural abundance if absent
    - symbol
      - the symbols from [source]
      - optional
        - "unspecified element"
    - configurational parity
      - positive or negative
      - only with tetracoordinate atoms
      - optional
    - hydrogen count
      - 0..9
      - optional for some elements
        - computed if missing (see below)
    - charge
      - range
      - None
    - extension
      - interpret as integer
      - interpret as bit field expressed as integer
- bonds
  - 2n electrons, where n = 1,2,3,4
  - stereochemical flags
    - up/down
      - n = 1 only
    - semantics explained under conformation
  - elided bonds
    - single or double, depending on context
- atoms, bonds are implicitly numbered
  - first seen
  - used to assign stereochemical parity (below)
- examples
  - invent a graphical notation
    - code non-default properties
  - semantic errors
    - 2 or more bonds
      - string encoding eliminates this possibility
    - loop
    - stereo on non-tetravalent atom
  - things that should be errors, but aren't
    - excessive valence
      - texas carbon
    - nonsensical isotope
      - [1C]
    - application may consider these as semantic errors, though

# Hydrogen Suppression

- virtual hydrogen
  - assigned value
- implicit hydrogen
  - computed value
  - target valence
    - the number of hydrogens the free atom can bind to
      - one or more values, depending on atom
  - target valence table
    - star (*) always has target = 0
    - defines target valences for atoms supporting implicit hydrogen
    - for example
      - a free carbon atom can bind four hydrogens
      - a free nitrogen atom can bind three or five hydrogens
    - example computations
      - simple cases
        - C
        - N
        - CC
      - N(C)(C)(C)(C)
      - *
      - several other weird cases
  - either/or, never both
- no semantic errors possible

# Conformation

- restricted rotation about a bond
- partial parity bonds (PPB)
  - values: Up; Down
  - must be adjacent to a double bond
  - must be paired on opposite sides of double bond
- interpretation
  1. view double bond from top of double bond plane
  2. for each neighbor bond, decide position (Up/Down within plane) relative to its double bond terminal
  3. invert parity if bond viewed in direction of high-to-low atom index
- elision is allowed, provided that the conformation is unambiguous
- conformation defined by at least two PPB's on opposite double bond terminals
- examples
  - trans-butene
  - allowed elision
- errors
  - "up" "up", "down" "down"
  - only setting one side
    - propene
    - exception: adjacent to another PPB system

# Configuration

- relative arrangement of neighbors in space
- template-based system
  - Clockwise or Counterclockwise
- model
  - sight along edge with lowest index, toward central atom
    - determine the order of edge indexes
    - clockwise or counterclockwise
    - virtual hydrogen counts as edge with lowest index
- limitations
  - can not represent sulfoxide configuration
- operations
  - swaps and their effect on parity
    - virtual hydrogen <-> neighbor hydrogen
    - two neighbors
- examples
  - cyclic, acyclic
  - allene, cumulene
  - include errors
    - degree != 4

# Delocalization Subgraph

- VB model makes graphs unequal even though they should be treated as equal
  - DIME
- the DS solution
  - encodes alternating single-double bond pattern as a perfect matching
    - maximum, maximal, perfect matching
- a node-induced subgraph over VB graph
  - unlabeled
  - possibly empty
  - encodes and therefore guarantees a perfect matching
    - corollary: every atom will be assigned a double bond
  - only node membership is specified
    - edge membership is deduced
- composition
  - atoms
    - C, N, O, P, S, unknown
  - selection
    - adding an atom to the DS
    - "selected atom", "selected atoms"
    - "induced bond", "induced bonds"
- bonds
  - must be elided
  - by definition (node-induced) both terminals are members
- literature refers to "aromaticity"
  - not using that term because of its (imprecise) meaning in chemistry
- algorithmic fill/empty
  - every molecule expressed with a DS can also be expressed without it
  - in other words, 1:1 translation
  - fill algorithm
  - empty algorithm
    - aka "kekulization"
- examples
  - invent a notation for node/edge membership (color?, weight?)
  - graphics only
  - error if no perfect matching possible

# Syntax

- UTF-8 string
  - "dstrings" ?
- encodes a depth-first traversal
  - branches
  - closures (C1CC1), "closure digit" = rnum (blech)
  - disconnections (C.C)
    - allows multiple components
- formal grammar
  - LL(1)
  - listing
    - changes from before
      - `--`, `++` charge disallowed
      - only `@` and `@@` configuration
      - closure, disconnection
- data types
  - Integer(n)
    - -n -> +n, inclusive
  - PositiveInteger(n)
    - 0 -> n, inclusive
  - Boolean
  - AtomicSymbol
    - list published by IUPAC
  - LowercaseSymbol
  - Star
  - Configuration
  - None
- atoms
  - bare
    - "organic subset"
  - bracketed `[` ... `]`
    - virtual hydrogens
      - default values
        - isotope: None
        - hcount: 0
        - charge: 0
        - configuration: none
        - extension: none
  - lowercase
    - eligibility
    - may occur inside or outside brackets
- bonds
  - single `-`, double `=`, triple `#` quadruple `$`
  - elided
    - none ``, `:`
    - always two-electron
  - up `/`, down `/`
    - two-electron
- closures
  - closure digits: 1..99
  - balancing not easily expressable in syntax
    - it could be done, but with a lot of effort
      - explain
  - re-use digits
  - interaction with up/down bonds
  - errors
    - loops (`C11`)
    - up/down mismatch
- disconnection `.`
  - "no bond"
    - not "zero order bond", but no bond
    - explicitly allows zob extension (link)
  - to enable disconnected components
    - other uses
      - example
  - may occur within cycle
    - examples
  - may not occur immediately before ring junction
- using the formal grammar
  - reading
    - recursive descent parser
    - scanner-driven parser development
    - parser generator
    - parentheses vs. ring closure digits
  - writing
    - no counterpart to scanner-driven parser development

# Pruning

- the removal of atoms from the DS
- supported in Dialect strings for backward-compatibility
  - writers output SMILES with gratuitous selected atoms
- deselect atoms that are incapable of forming double bonds
  - algorithm
- examples

# Writing

- depth-first traversal over molecular graph
- cycle closure
- branch
- examples

# Reading

- recursive descent parser
  - hand-crafted
  - parser generator
- build graph as you go
- correct for DS
- examples

# Reference Implementation

- high-level description
  - parser
  - typesafe data structures
  - errors
    - syntactical
    - semantic
    - cursor to error
      - not always possible
        - e.g., no perfect matching
- subsequent publication

# Discussion

- limitations
  - non-representable entities
    - non-VB examples
      - e.g., organometallics, homotropylium cation, dative bonding
    - non-tetrahedral stereochemistry
      - e.g., TB, OH
  - compact
  - relatively simple to learn
    - compare with InChI
  - encode/decode
    - c.f. inchi
- scope
  - everything else
- tricky cases
  - stereo that spans a ring junction
    - conformation
      - both ends of bond must agree
      - examples
    - configuration
      - it's the bond index, not the atom index that matters
      - examples
- differences with other dialects
  - OpenSMILES
  - RDKit (as an example of the kinds of possible differences)
- extensions
  - extension field
  - configuration
  - expanding range of selectable atoms
  - additional configuration classes (OH, TB, etc)

# Conclusion

- a high and low level description of a SMILES dialect
- supports most of SMILES as currently practiced
- formalization > invention
- the foundation for a reference implementation