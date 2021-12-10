const { Diagram, Terminal, NonTerminal, Optional } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
 Terminal(':'),
  NonTerminal('hex'),
  Optional(NonTerminal('hex')),
  Optional(NonTerminal('hex')),
  Optional(NonTerminal('hex'))
)