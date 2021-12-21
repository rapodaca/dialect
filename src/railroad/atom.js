const { Diagram, Choice, NonTerminal, Terminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    NonTerminal('star'),
    NonTerminal('shortcut'),
    NonTerminal('selected-shortcut'),
    NonTerminal('bracket'),
  )
)