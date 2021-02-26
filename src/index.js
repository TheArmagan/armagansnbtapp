const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const express = require("express");
const expressApp = express();
const StateManager = require("./utilities/StateManager");
const pixelArtGenerator = require("./modules/pixelArtGenerator");
const schematicGenerator = require("./modules/schematicGenerator");
const FreshDB = require("fresh.db");
const fetch = require("node-fetch").default;
const semver = require("semver");
const package = require(path.resolve(__dirname, "..", "package.json"));
console.log(package)
const db = new FreshDB({ name: "db", folderPath: path.resolve(process.env.APPDATA, "Armagan's NBT App", "data") });

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
process.env.PORT = process.env.PORT || 8987;
expressApp.listen(process.env.PORT);
expressApp.use(express.static(path.resolve(__dirname, "public")));

/** @type {BrowserWindow} */
let mainWindow;

let createWindow = async () => {

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    maximizable: false,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    darkTheme: true,
    autoHideMenuBar: true,
    focusable: true,
    frame: false
  });

  mainWindow.loadURL(`http://127.0.0.1:${process.env.PORT}/`);

  ipcMain.on("app-quit", async () => {
    let dialogResults = await dialog.showMessageBox(mainWindow, {
      type: "warning",
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
  });

  (async () => {
    const HOURS_12 = 43_200_000 // 12 hours
    let lastChecked = db.get("lastUpdateChecked", 0)

    if (Date.now() - lastChecked > HOURS_12) {
      let json = await fetch("https://api.github.com/repos/thearmagan/armagansnbtapp/releases").then(d => d.json());
      let isNewVersionOut = semver.gte(json[0].tag_name, package.version);

      if (isNewVersionOut) {
        let dialogResult = await dialog.showMessageBox(mainWindow, {
          type: "warning",
          message: "New version is out! Get the latest version!",
          buttons: [
            "No",
            "Yes"
          ],
          cancelId: 0,
          defaultId: 1
        });

        if (dialogResult.response) {
          await shell.openExternal("https://github.com/TheArmagan/armagansnbtapp");
        }

        app.quit();
      } else {
        db.set("lastUpdateChecked", Date.now());
      }
    }

  })();

  let stater = new StateManager((newState) => {
    mainWindow.webContents.send("state", newState);
  }, {
    running: false,
    max: 100,
    current: 0,
    state: "...",
  }, 50);

  ipcMain.on("pag-start", async (_, options) => {
    if (stater.get("pag").running) return;
    let state = stater.get("pag", true);
    state.running = true;
    state.current = 0;
    pixelArtGenerator(options, state);
  });

  ipcMain.on("smb-start", async (_, options) => {
    if (stater.get("smb").running) return;
    let state = stater.get("smb", true);
    state.running = true;
    state.current = 0;
    schematicGenerator(options, state);
  });

  ipcMain.on("pag-image-info", async (event, fileName) => {
    if (!fileName) return;
    let img = await Jimp.read(path.resolve(fileName));
    mainWindow.webContents.send("pag-image-info", { width: img.getWidth(), height: img.getHeight() });
    img = 0;
  });

  app.on("before-quit", async () => {
    await stater.stop();
  })
};

app.on("ready", createWindow);

