const {Diagram, Optional, NonTerminal } = require('../../lib/railroad-diagrams');

module.exports = Diagram(
  Optional(
    NonTerminal('sequence')
  )
);