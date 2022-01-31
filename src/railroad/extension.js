const { Diagram, Terminal, NonTerminal, Optional } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
 Terminal(':'),
  NonTerminal('digit'),
  Optional(NonTerminal('digit')),
  Optional(NonTerminal('digit')),
  Optional(NonTerminal('digit'))
)