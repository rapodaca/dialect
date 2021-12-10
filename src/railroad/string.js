const {Diagram, NonTerminal, ZeroOrMore, Choice } = require('../../lib/railroad-diagrams');

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
);