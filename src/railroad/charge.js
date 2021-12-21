const { Diagram, Choice, Terminal, NonTerminal, Optional } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    Terminal('+'),
    Terminal('-')
  ),
  Optional(NonTerminal('non_zero'))
);