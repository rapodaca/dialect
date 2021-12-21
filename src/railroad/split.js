const { Diagram, Terminal, NonTerminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Terminal('.'),
  NonTerminal('string')
)