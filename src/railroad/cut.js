const {Diagram, Choice, Terminal, Sequence, NonTerminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    NonTerminal('digit'),
    Sequence(
      Terminal('%'),
      NonTerminal('non_zero'),
      NonTerminal('digit')
    )
  )
);