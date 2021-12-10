const { Diagram, Choice, NonTerminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
    Choice(
        0,
        NonTerminal('-'),
        NonTerminal('='),
        NonTerminal('#'),
        NonTerminal('$'),
        NonTerminal('/'),
        NonTerminal('\\')
    )
);