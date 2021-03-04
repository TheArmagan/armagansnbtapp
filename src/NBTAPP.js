const { app, BrowserWindow, ipcMain } = require("electron");
const GeneratorManager = require("./generator/GeneratorManager");
const WebServerManager = require("./WebServerManager");
const path = require("path");
const checkUpdate = require("./utilities/checkUpdates");
const Jimp = require("jimp");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
process.env["ELECTRON_ENABLE_LOGGING"] = "true"

class NBTAPP {

  /** @type {WebServerManager} */
  webServerManager;

  /** @type {GeneratorManager} */
  generatorManager;

  userConfig = {};

  /** @type {BrowserWindow} */
  mainWindow;

  async init() {
    console.log("[MAIN] Initializing...");
    process.title = "Armagan's NBT App";

    console.log("[MAIN] Initializing WebServerManager...");
    this.webServerManager = new WebServerManager(this);
    await this.webServerManager.init();

    console.log("[MAIN] Initializing GeneratorManager...");
    this.generatorManager = new GeneratorManager(this);
    await this.generatorManager.init();

    console.log("[MAIN] Waiting electron to get ready...");
    await app.whenReady();

    console.log("[MAIN] Initializing MainWindow...");
    this.mainWindow = new BrowserWindow({
      transparent: true,
      center: true,
      darkTheme: false,
      focusable: true,
      fullscreenable: false,
      resizable: false,
      maximizable: false,
      width: 900,
      height: 600,
      icon: path.resolve(__dirname, "../images/icon.ico"),
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
      },
      show: true,
      frame: false,
      autoHideMenuBar: true
    });
    await this.mainWindow.loadURL(`http://127.0.0.1:${this.webServerManager.PORT}/`);

    checkUpdate(this.mainWindow);

    console.log("[MAIN] Adding listeners for other stuffs..");
    this._otherStuff();
  }

  _otherStuff() {
    ipcMain.handle("other:image-size", async (_, filePath) => {
      let img = await Jimp.read(path.resolve(filePath));
      let data = { width: img.getWidth(), height: img.getHeight() };
      img = 0;
      return data;
    });

    ipcMain.handle("other:user-config-set", (_, config) => {
      this.userConfig = config;
    });
  }

}

module.exports = NBTAPP;