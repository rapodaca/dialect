const { Diagram, NonTerminal, Terminal, Optional, Choice, Sequence } = require('../../lib/railroad-diagrams');


module.exports = Diagram(
  NonTerminal('['),
  Optional(NonTerminal('isotope')),
  Choice(
    0,
    NonTerminal('element'),
    NonTerminal('selection'),
    Terminal('*')
  ),
  Optional(
    NonTerminal('stereodescriptor')
  ),
  Optional(
    NonTerminal('virtual-hydrogen')
  ),
  Optional(
    NonTerminal('charge')
  ),
  Optional(
    Sequence(
      Terminal(':'),
      NonTerminal('extension')
    )
  ),
  NonTerminal(']')
);