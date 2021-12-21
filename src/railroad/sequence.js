const {Diagram, ZeroOrMore, Choice, NonTerminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  NonTerminal('atom'),
  ZeroOrMore(
    Choice(
      0,
      NonTerminal('union'),
      NonTerminal('branch'),
      NonTerminal('split')
    )
  )
)