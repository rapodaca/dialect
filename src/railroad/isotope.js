const { Diagram, Sequence, Terminal, Optional, NonTerminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Sequence(
    Terminal('1..9'),
    Optional(
      NonTerminal('0..9')
    ),
    Optional(
      NonTerminal('0..9')
    )
  )
)
