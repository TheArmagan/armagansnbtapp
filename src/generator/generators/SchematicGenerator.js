const GeneratorManager = require("../GeneratorManager");


class SchematicGenerator {
  /** @type {GeneratorManager} */
  generatorManager;

  constructor(generatorManager) {
    this.generatorManager = generatorManager;
  }
}
module.exports = SchematicGenerator;