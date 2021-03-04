const { ipcMain } = require("electron");
const GeneratorManager = require("../GeneratorManager");

class PixelartGenerator {
  /** @type {GeneratorManager} */
  generatorManager;

  state = {
    progressMax: 0,
    progress: 0,
    stateText: "...",
    running: false
  }

  constructor(generatorManager) {
    this.generatorManager = generatorManager;
  }

  async init() {
    ipcMain.handle("generators:pixelart:state", async (_) => {
      return this.state;
    });

    ipcMain.handle("generators:pixelart:start", async (_, config) => {
      if (this.state.running) return;
      this.run(config);
    });
  }

  /**
   * @param {{inputFile: string, outputFile: string, scaleFactor: number, ditheringFactor: number}} config 
   */
  async run(config) {
    if (this.state.running) return;


  }
}
module.exports = PixelartGenerator;