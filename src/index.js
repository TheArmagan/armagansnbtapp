const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const expressApp = express();
const fs = require("fs");
const Jimp = require("jimp");
const mcfsd = require("mcfsd");
const stuffs = require("stuffs");
const nearestColor = require("nearest-color");
const Appender = require("./Appender");
const { Schematic } = require('prismarine-schematic');
const { Vec3 } = require("vec3");
const MinecraftData = require("minecraft-data");
const legacyData = require("./data/legacyBlockData.json");
const StateManager = require("./StateManager");
const mcData12 = MinecraftData("1.12");
const chillout = require("chillout");
const RPC = require("discord-rpc");
const pixelArtGenerator = require("./modules/pixelArtGenerator");


process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
process.env.PORT = process.env.PORT || 8987;
expressApp.listen(process.env.PORT);
expressApp.use(express.static(path.resolve(__dirname, "public")));

if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit();
}

let createWindow = async () => {

  let mainWindow = new BrowserWindow({
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

    let startTime = Date.now();
    let state = stater.get("pag", true);

    state.running = true;

    pixelArtGenerator(options, state);
  })

  ipcMain.on("smb-start", async (_, options) => {
    if (stater.get("smb").running) return;

    let startTime = Date.now();
    let state = stater.get("smb", true);

    state.running = true;

    state.state = "Reading schematic..";
    state.current++;
    let schematic = await Schematic.read(await fs.promises.readFile(path.resolve(options.filePath)));
    state.state = "Read..";
    state.current++;

    /** @type {Vec3} */
    let offsetPos = schematic.offset.clone();

    /** @type {Vec3} */
    let endPos = schematic.end().clone();

    let a = new Appender(path.resolve(options.outputPath), options.appenderLimit);

    let blocksUsed = 0;

    state.state = "Appending first part.. (Takes long time)";
    a.append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1},{"button_name":"BuildAndDie","data":[`, true);
    state.current++;

    state.max = state.max + (schematic.size.x * schematic.size.y * schematic.size.z);
    state.state = "Starting to bake..";
    state.current++;

    await chillout.repeat(endPos.x - offsetPos.x, async (x) => {
      await chillout.repeat(endPos.y - offsetPos.y, async (y) => {
        await chillout.repeat(endPos.z - offsetPos.z, async (z) => {
          let block = schematic.getBlock(new Vec3(x + offsetPos.x, y + offsetPos.y, z + offsetPos.z));
          state.state = `Baking.. (${blocksUsed}, ${x}, ${y}, ${z})`;
          state.current++;

          if (block && !options.ignoreList.includes(block?.name?.toLowerCase())) {
            blocksUsed++;

            let _find = legacyData.find(i => i?.[1]?.toLowerCase() == block?.name?.toLowerCase()) || [];
            let [id, meta] = _find[0]?.split(":") || [];
            let b12 = mcData12.blocksArray.find(i => i.id == id && (meta == 0 || i.variations?.some(j => j.metadata == meta))) || mcData12.blocksArray.find(i => i.id == id);

            a.append(`{"cmd_line":"setblock\\t~${x}\\t~${y}\\t~${z}\\t${b12?.name || block?.name}\\t${meta}","cmd_ver":12},`);
          }
        })
      })
    })

    state.state = "Appending last part..";
    a.append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"[SMB] Thank you for using the Armagan's NBT App! Total ${blocksUsed} blocks are used.. https://github.com/TheArmagan/armagansnbtapp",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);
    blocksUsed++;

    let tokeTime = Date.now() - startTime;
    state.state = `Baked! (Took ${(tokeTime / 1000).toFixed(2)} seconds..)`;
    state.current = state.max;
    state.running = false;


    schematic = 0;
    offsetPos = 0;
    endPos = 0;

  })

  app.on("before-quit", async () => {
    await stater.stop();
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

