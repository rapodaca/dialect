const { Diagram, Choice, Sequence, Terminal, Optional } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Choice(
    0,
    Sequence(Terminal('B'), Optional(Terminal('r'))),
    Sequence(Terminal('C'), Optional(Terminal('l'))),
    Terminal('N'),
    Terminal('O'),
    Terminal('P'),
    Terminal('S'),
    Terminal('F'),
    Terminal('I'),
  )
)