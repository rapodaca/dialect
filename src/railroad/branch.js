const {Diagram, NonTerminal, Terminal, Optional, Choice } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  NonTerminal('('),
  Optional(
    Choice(
      0,
      Terminal('.'),
      NonTerminal('bond')
    )
  ),
  NonTerminal('string'),
  NonTerminal(')')
);