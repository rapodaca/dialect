const { Diagram, Choice, Terminal, Sequence, Optional } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Choice(
    0,
    Terminal('b'),
    Terminal('c'),
    Terminal('n'),
    Terminal('o'),
    Terminal('p'),
    Sequence(
      Terminal('s'),
      Optional(
        Terminal('e')
      )
    ),
    Sequence(
      Terminal('a'),
      Terminal('s')
    )
  )
)