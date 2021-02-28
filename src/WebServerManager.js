const NBTAPP = require("./NBTAPP");
const findFreePort = require("./utilities/findFreePort");
const path = require("path");
const express = require("express");
const { dialog, app } = require("electron");


class WebServerManager {

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
    this.nbtapp.PORT = await findFreePort(this.nbtapp.PORT);
    console.log("[WEB] Free port found!", this.nbtapp.PORT);

    this.registerPaths();
    await (new Promise(resolve => { this.app.listen(this.nbtapp.PORT, resolve) }));
    console.log(`[WEB] Server listening on port ${this.nbtapp.PORT}!`);
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
    })
  }
}

module.exports = WebServerManager;