const { Diagram, NonTerminal, Optional } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  NonTerminal('H'),
  Optional(
    NonTerminal('1..9')
  )
)