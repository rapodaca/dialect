const { Diagram, NonTerminal, Optional, Stack } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  NonTerminal('['),
  Stack(
    Optional(NonTerminal('isotope')),
    NonTerminal('symbol'),
    Optional(
      NonTerminal('stereodescriptor')
    ),
    Optional(
      NonTerminal('virtual-hydrogen')
    ),
    Optional(
      NonTerminal('charge')
    ),
    Optional(
      NonTerminal('extension')
    )
  ),
  NonTerminal(']')
);