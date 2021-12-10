const { Diagram, Choice, Terminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Choice(
    0,
    Terminal('b'),
    Terminal('c'),
    Terminal('n'),
    Terminal('o'),
    Terminal('p'),
    Terminal('s')
  )
)