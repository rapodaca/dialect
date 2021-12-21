const { Diagram, Choice, Terminal, NonTerminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    Terminal('+'),
    Terminal('-')
  ),
  NonTerminal('non_zero')
);