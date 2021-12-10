const { Diagram, Choice, Terminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    Terminal('+'),
    Terminal('-')
  ),
  Terminal('1..9')
);