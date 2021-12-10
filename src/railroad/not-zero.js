const { Diagram, Choice, Terminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Choice(
    0,
    Terminal('1'),
    Terminal('2'),
    Terminal('3'),
    Terminal('4'),
    Terminal('5'),
    Terminal('6'),
    Terminal('7'),
    Terminal('8'),
    Terminal('9')
  )
)