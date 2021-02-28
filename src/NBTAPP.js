const { app, BrowserWindow, ipcRenderer } = require("electron");
const GeneratorManager = require("./generator/GeneratorManager");
const WebServerManager = require("./WebServerManager");
const console = require("console");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
process.env["ELECTRON_ENABLE_LOGGING"] = "true"

class NBTAPP {

  PORT = 11100;

  /** @type {WebServerManager} */
  webServerManager;

  /** @type {GeneratorManager} */
  generatorManager;

  /** @type {BrowserWindow} */
  mainWindow;

  async init() {

    console.log("[MAIN] Initializing...");

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
      // icon: path.resolve(__dirname, "../images/icon.ico"),
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true
      },
      show: true,
      frame: false,
      autoHideMenuBar: true
    });
    await this.mainWindow.loadURL(`http://127.0.0.1:${this.PORT}/`);
  }

}

module.exports = NBTAPP;