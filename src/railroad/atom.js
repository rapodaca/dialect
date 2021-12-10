const { Diagram, Choice, NonTerminal, Terminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    NonTerminal('bracket'),
    NonTerminal('shortcut'),
    NonTerminal('selected-shortcut'),
    Terminal('*')
  )
)