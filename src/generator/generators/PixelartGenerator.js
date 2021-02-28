const GeneratorManager = require("../GeneratorManager");

class PixelartGenerator {
  /** @type {GeneratorManager} */
  generatorManager;

  constructor(generatorManager) {
    this.generatorManager = generatorManager;
  }
}
module.exports = PixelartGenerator;