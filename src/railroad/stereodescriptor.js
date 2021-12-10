const { Diagram, NonTerminal, Optional } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
    NonTerminal('@'),
    Optional(NonTerminal('@'))
)