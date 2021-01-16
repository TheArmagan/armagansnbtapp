let { app, BrowserWindow, ipcMain, dialog } = require("electron");
let path = require("path");
let express = require("express");
let expressApp = express();
let fs = require("fs");
let Jimp = require("jimp");
let mcfsd = require("mcfsd");
let stuffs = require("stuffs");
let nearestColor = require("nearest-color");
let { Appender } = require("./Appender");
let { Schematic } = require('prismarine-schematic');
let { Vec3 } = require("vec3");
let MinecraftData = require("minecraft-data");
let legacyData = require("./legacyBlockData.json");
let { StateManager } = require("./StateManager");
let mcData12 = MinecraftData("1.12");
let chillout = require("chillout");

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
  }, 250);


  ipcMain.on("pag-start", async (_, opts) => {
    if (stater.get("pag").running) return;

    let startTime = Date.now();
    let state = stater.get("pag", true);

    state.running = true;

    state.state = `Reading the image file..`;
    state.current++;
    let img = await Jimp.read(path.resolve(opts.filePath));
    state.state = "Readd..";
    state.current++;


    if (opts.scaleFactor != 1) {
      state.state = `Scaling..`;
      state.current++;
      await img.scale(opts.scaleFactor);
      state.state = "Scaled..";
      state.current++;
    }

    if (opts.ditherFactor != 0) {
      state.state = `Dithering.. (Takes some time)`;
      state.current++;
      img = await Jimp.create(await mcfsd(img.bitmap, opts.ditherFactor));
      state.state = "Dithered..";
      state.current++;
    }

    state.max = state.max + (img.getWidth() * img.getHeight());
    let outputPath = path.resolve(opts.outputPath);

    let a = new Appender(outputPath);

    state.state = `Calculating color map..`;
    state.current++;

    //let findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, opts.align == "vertical" ? i.topColor : i.sideColor]))));
    let findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, i.topColor]))));

    state.state = `Appending first part..`;
    state.current++;

    a.append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"-","type":1},{"button_name":"BuildAndDie","data":[`, true);


    state.state = `Starting to bake..`;
    state.current++;
    let commandsUsed = 0;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, index) => {
      setTimeout(() => {
        state.state = `Baking.. (${index}, ${x}, ${y})`;
        state.current++;

        let isLastOne = x == img.bitmap.width - 1 && y == img.bitmap.height - 1;

        let pixelColorINT = img.getPixelColor(x, y);
        let pixelColorRGBA = stuffs.intToRgba(pixelColorINT);
        let pixelColorHEX = stuffs.rgbToHex(pixelColorRGBA.r, pixelColorRGBA.g, pixelColorRGBA.b);

        let { name: blockIdAndMeta } = findNearestColor(pixelColorHEX);

        if (blockIdAndMeta.startsWith("sand") || blockIdAndMeta.startsWith("gravel") || blockIdAndMeta.includes("powder")) {
          a.append(`{"cmd_line":"setblock\\t~${x}\\t~\\t~${y}\\t${opts.scaffoldBlock.id}\\t${opts.scaffoldBlock.meta}","cmd_ver":12},`);
          commandsUsed++;
        }

        a.append(`{"cmd_line":"setblock\\t~${x}\\t~1\\t~${y}\\t${blockIdAndMeta.replace(" ", "\\t")}","cmd_ver":12},`);
        commandsUsed++;

        if (isLastOne) {
          state.state = `Appending last part..`;
          state.current++;

          a.append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"-","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"[PAG] Thank you for using the Armagan's NBT App! Total ${commandsUsed} commands are used.. https://github.com/TheArmagan/armagansnbtapp",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);

          commandsUsed = 0;
          img = 0;
          a = 0;

          let tokeTime = Date.now() - startTime;
          state.state = `Baked! (Took ${(tokeTime / 1000).toFixed(2)} seconds..)`;
          state.current = state.max;
          state.running = false;
        }
      }, index / 500)
    })
  })

  ipcMain.on("smb-start", async (_, opts) => {
    if (stater.get("smb").running) return;

    let startTime = Date.now();
    let state = stater.get("smb", true);

    state.running = true;

    state.state = "Reading schematic..";
    state.current++;
    let schematic = await Schematic.read(await fs.promises.readFile(path.resolve(opts.filePath)));
    state.state = "Read..";
    state.current++;

    /** @type {Vec3} */
    let offsetPos = schematic.offset.clone();

    /** @type {Vec3} */
    let endPos = schematic.end().clone();

    let a = new Appender(path.resolve(opts.outputPath));

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

          if (block && !opts.ignoreList.includes(block?.name?.toLowerCase())) {
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

