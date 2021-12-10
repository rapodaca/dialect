const { Diagram, Terminal } = require('../../lib/railroad-diagrams.js');

module.exports = Diagram(
  Terminal('.'),
  Terminal('string')
)