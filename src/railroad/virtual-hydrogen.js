const { Diagram, Terminal, NonTerminal, Optional } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Terminal('H'),
  Optional(
    NonTerminal('non_zero')
  )
)