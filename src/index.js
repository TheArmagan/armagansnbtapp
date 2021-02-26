const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const expressApp = express();
const StateManager = require("./utilities/StateManager");
const pixelArtGenerator = require("./modules/pixelArtGenerator");
const schematicGenerator = require("./modules/schematicGenerator");

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

  ipcMain.on("pag-image-info", async (event, fileName) => {
    if (!fileName) return;
    let img = await Jimp.read(path.resolve(fileName));
    mainWindow.webContents.send("pag-image-info", { width: img.getWidth(), height: img.getHeight() });
    img = 0;
  });


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
  })

  ipcMain.on("smb-start", async (_, options) => {
    if (stater.get("smb").running) return;
    let state = stater.get("smb", true);
    state.running = true;
    state.current = 0;
    schematicGenerator(options, state);
  })

  app.on("before-quit", async () => {
    await stater.stop();
  })
};

app.on("ready", createWindow);

