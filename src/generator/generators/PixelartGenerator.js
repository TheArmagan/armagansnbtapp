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
    let app = this.generatorManager.nbtapp.webServerManager.app;

    ipcMain.handle("generators:pixelart:state", async () => {
      return this.state;
    });

    ipcMain.handle("generators:pixelart:start", async () => {
      if (this.state.running) return res.send({ ok: false });
    });
  }

  async run() {
    if (this.state.running) return;
  }
}
module.exports = PixelartGenerator;