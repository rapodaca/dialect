const { Diagram, Choice, NonTerminal, Terminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Choice(
    0,
    NonTerminal('digit'),
    Choice(
      0,
      Terminal('a'),
      Terminal('b'),
      Terminal('c'),
      Terminal('d'),
      Terminal('e'),
      Terminal('f')
    )
  )
)