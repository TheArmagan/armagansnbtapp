const NBTAPP = require("../NbtApp");
const PixelartGenerator = require("./generators/PixelartGenerator");
const SchematicGenerator = require("./generators/SchematicGenerator");

class GeneratorManager {

  /** @type {NBTAPP} */
  nbtapp;

  /** @type {PixelartGenerator} */
  pixelartGenerator;

  /** @type {SchematicGenerator} */
  schematicGenerator;

  /**
   * @param {NBTAPP} nbtapp 
   */
  constructor(nbtapp) {
    this.nbtapp = nbtapp;
  }

  async init() {
    this.pixelartGenerator = new PixelartGenerator(this);
    this.schematicGenerator = new SchematicGenerator(this);
  }

}

module.exports = GeneratorManager;