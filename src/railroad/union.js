const { Diagram, Optional, NonTerminal, Choice } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Optional(
    NonTerminal('bond')
  ),
  Choice(
    0,
    NonTerminal('string'),
    NonTerminal('cut')
  )
)