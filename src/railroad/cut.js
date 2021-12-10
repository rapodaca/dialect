const {Diagram, Choice, Terminal, Sequence, NonTerminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    Terminal('0..9'),
    Sequence(
      NonTerminal('%'),
      Terminal('1..9'),
      Terminal('0..9')
    )
  )
);