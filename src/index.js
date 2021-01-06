const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const expressApp = express();
const fs = require("fs");
const Jimp = require("jimp");
const mcfsd = require("mcfsd");
const lodash = require("lodash");


process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
process.env.PORT = process.env.PORT || 8987;
expressApp.listen(process.env.PORT);
expressApp.use(express.static(path.resolve(__dirname, "public")));

if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = async () => {

  const mainWindow = new BrowserWindow({
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

  let pagState = {
    running: false,
    max: 100,
    current: 0,
    state: "...",
  };


  ipcMain.on("pag-start", async (_, opts) => {
    if (pagState.running) return;

    pagState = {
      running: false,
      max: 100,
      current: 0,
      state: "...",
    };

    let clientUpdater = setInterval(() => {
      mainWindow.webContents.send("pag-state", pagState);
    }, 75)

    pagState.running = true;
    pagState.current++;


    let img = await Jimp.read(path.resolve(opts.filePath));
    pagState.state = "Readd..";
    pagState.current++;


    if (opts.scaleFactor != 1) {
      await img.scale(opts.scaleFactor);
      pagState.state = "Scaled..";
      pagState.current++;

    }

    if (opts.ditherFactor != 0) {
      img = await Jimp.create(mcfsd(img.bitmap, opts.ditherFactor));
      pagState.state = "Dithered..";
      pagState.current++;

    }

    let resultText = "";
    pagState.max = pagState.max + (img.getWidth() * img.getHeight());


    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, index) => {
      setTimeout(() => {
        pagState.state = `Baking.. (${x},${y})`;
        pagState.current++;

        if (x == img.bitmap.width - 1 && y == img.bitmap.height - 1) {
          pagState.state = `Generated!`;
          pagState.current++;
          pagState.running = false;

          setTimeout(() => { clearInterval(clientUpdater); }, 50);
        }
      }, index / 100)
    })
  })
};

app.on("ready", createWindow);



app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

