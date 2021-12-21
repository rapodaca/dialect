const { Diagram, Sequence, Optional, NonTerminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Sequence(
    NonTerminal('non_zero'),
    Optional(
      NonTerminal('digit')
    ),
    Optional(
      NonTerminal('digit')
    )
  )
)
