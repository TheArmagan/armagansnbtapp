const NBTAPP = require("./NBTAPP");
const findFreePort = require("./utilities/findFreePort");
const path = require("path");
const express = require("express");
const { dialog, app } = require("electron");
const Jimp = require("jimp");


class WebServerManager {

  PORT = 11100

  app;

  /** @type {NBTAPP} */
  nbtapp;

  /**
   * @param {NBTAPP} nbtapp 
   */
  constructor(nbtapp) {
    this.nbtapp = nbtapp;
    this.app = express()
  }

  async init() {
    console.log("[WEB] Searching for free port..");
    this.PORT = await findFreePort(this.PORT);
    console.log("[WEB] Free port found!", this.PORT);

    this.registerPaths();
    await (new Promise(resolve => { this.app.listen(this.PORT, resolve) }));
    console.log(`[WEB] Server listening on port ${this.PORT}!`);
  }

  registerPaths() {
    this.app.use(express.static(path.resolve(__dirname, "frontend")));
    this.app.get("/api/quit", async (req, res) => {
      res.send("");
      let dialogResults = await dialog.showMessageBox(this.nbtapp.mainWindow, {
        type: "info",
        message: "Do you really want the exit the app right now?",
        buttons: [
          "No",
          "Yes"
        ],
        cancelId: 0,
        defaultId: 1
      });

      if (dialogResults.response) {
        app.quit();
      }

    })

    this.app.get("/api/minimize", async (req, res) => {
      res.send("");
      this.nbtapp.mainWindow.minimize();
    });

    this.app.get("/api/focus", async (req, res) => {
      res.send("");
      this.nbtapp.mainWindow.setAlwaysOnTop(true);
      this.nbtapp.mainWindow.focus();
      this.nbtapp.mainWindow.setAlwaysOnTop(false);
    });

    this.app.post("/api/other/image-size", async (req, res) => {
      let img = await Jimp.read(path.resolve(req.body.path));
      res.send({ width: img.getWidth(), height: img.getHeight(), pixelAmount: img.getWidth() * img.getHeight() });
      img = 0;
    });
  }
}

module.exports = WebServerManager;