const {Diagram, NonTerminal, Terminal, Optional, Choice } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Terminal('('),
  Optional(
    Choice(
      0,
      Terminal('.'),
      NonTerminal('bond')
    )
  ),
  NonTerminal('sequence'),
  Terminal(')')
);