const { ipcMain } = require("electron");
const NBTAPP = require("../NBTAPP");
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
    console.log("[GENERATORS] Initializing PixelartGenerator...");
    this.pixelartGenerator = new PixelartGenerator(this);
    await this.pixelartGenerator.init();

    console.log("[GENERATORS] Initializing SchematicGenerator...");
    this.schematicGenerator = new SchematicGenerator(this);
    await this.schematicGenerator.init();
  }

}

module.exports = GeneratorManager;