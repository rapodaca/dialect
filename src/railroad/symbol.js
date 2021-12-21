const { Diagram, Choice, NonTerminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Choice(
    0,
    NonTerminal('star'),
    NonTerminal('element'),
    NonTerminal('selected_element')
  )
);