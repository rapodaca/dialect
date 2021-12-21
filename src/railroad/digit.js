const {Diagram, NonTerminal, Terminal, Choice } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    Terminal('0'),
    NonTerminal('non_zero')
  )
);