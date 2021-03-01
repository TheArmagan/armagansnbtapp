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

    app.get("/api/generators/pixelart/state", (req, res) => {
      res.send({ ok: true, data: this.state });
    });

    app.post("/api/generators/pixelart/start", (req, res) => {
      if (this.state.running) return res.send({ ok: false, reason: "Already running.." });
    })
  }

  async run() {
    if (this.state.running) return;
  }
}
module.exports = PixelartGenerator;