const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const expressApp = express();
const fs = require("fs");
const Jimp = require("jimp");
const mcfsd = require("mcfsd");
const stuffs = require("stuffs");
const nearestColor = require("nearest-color");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
process.env.PORT = process.env.PORT || 8987;
expressApp.listen(process.env.PORT);
expressApp.use(express.static(path.resolve(__dirname, "public")));

if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit();
}

let appendMem = {
  PAG: []
}

function appendToFile(path = "", memName = "", data = "", forceSave = false) {
  appendMem[memName].push(data);
  if (appendMem[memName].length > 2048 || forceSave) {
    fs.appendFileSync(path, appendMem[memName].join(""), "utf8");
    appendMem[memName].length = 0;
  }
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

    let startTime = Date.now();

    pagState = {
      running: false,
      max: 100,
      current: 0,
      state: "...",
    };

    pagState.running = true;
    pagState.current++;

    let clientUpdater = setInterval(() => {
      mainWindow.webContents.send("pag-state", pagState);
    }, 75)


    pagState.state = `Reading the image file..`;
    pagState.current++;
    let img = await Jimp.read(path.resolve(opts.filePath));
    pagState.state = "Readd..";
    pagState.current++;


    if (opts.scaleFactor != 1) {
      pagState.state = `Scaling..`;
      pagState.current++;
      await img.scale(opts.scaleFactor);
      pagState.state = "Scaled..";
      pagState.current++;

    }

    if (opts.ditherFactor != 0) {
      pagState.state = `Dithering..`;
      pagState.current++;
      img = await Jimp.create(mcfsd(img.bitmap, opts.ditherFactor));
      pagState.state = "Dithered..";
      pagState.current++;
    }

    pagState.max = pagState.max + (img.getWidth() * img.getHeight() * 2);
    const outputPath = path.resolve(opts.outputPath);

    pagState.state = `Calculating color map..`;
    pagState.current++;

    //const findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, opts.align == "vertical" ? i.topColor : i.sideColor]))));
    const findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, i.topColor]))));

    pagState.state = `Appending first part..`;
    pagState.current++;
    appendToFile(outputPath, "PAG", `{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"KILL-THE-ART-MACHINE","data":[{"cmd_line":"kill\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1},{"button_name":"BUILD-THE-PIXEL-ART","data":[`, true);

    pagState.state = `Starting to bake..`;
    pagState.current++;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, index) => {
      setTimeout(() => {
        pagState.state = `Baking.. (${index}, ${x},${y})`;
        pagState.current++;

        const isLastOne = x == img.bitmap.width - 1 && y == img.bitmap.height - 1;

        const pixelColorINT = img.getPixelColor(x, y);
        const pixelColorRGBA = stuffs.intToRgba(pixelColorINT);
        const pixelColorHEX = stuffs.rgbToHex(pixelColorRGBA.r, pixelColorRGBA.g, pixelColorRGBA.b);

        const { name: blockIdAndMeta } = findNearestColor(pixelColorHEX);

        appendToFile(outputPath, "PAG", `{"cmd_line":"setblock\\t~${x}\\t~1\\t~${y}\\t${blockIdAndMeta.replace(" ", "\\t")}","cmd_ver":12}${!isLastOne ? "," : ""}`);

        pagState.state = `Baked. (${index}, ${x},${y})`;
        pagState.current++;

        if (isLastOne) {
          pagState.state = `Appending last part..`;
          pagState.current++;

          appendToFile(outputPath, "PAG", `],"mode":0,"text":"","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"Thank you for using the Armagan's NBT App! Total ${index + 1} commands are used..", Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);

          let tokeTime = Date.now() - startTime;
          pagState.state = `Generated! (Took ${(tokeTime / 1000).toFixed(2)} seconds..)`;
          pagState.current = pagState.max;
          pagState.running = false;

          setTimeout(() => { clearInterval(clientUpdater); }, 5000);
        }
      }, index / 1000)
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

