const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const expressApp = express();
const fs = require("fs");
const Jimp = require("jimp");
const mcfsd = require("mcfsd");
const stuffs = require("stuffs");
const nearestColor = require("nearest-color");
const { Appender } = require("./Appender");
const { Schematic } = require('prismarine-schematic');
const { Vec3 } = require("vec3");
const MinecraftData = require("minecraft-data");
const legacyData = require("./legacyBlockData.json");
const { StateManager } = require("./StateManager");
const mcData12 = MinecraftData("1.12");

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


  const stater = new StateManager((newState) => {
    mainWindow.webContents.send("state", newState);
  }, {
    running: false,
    max: 100,
    current: 0,
    state: "...",
  }, 250);


  ipcMain.on("pag-start", async (_, opts) => {
    if (stater.get("pag").running) return;

    const startTime = Date.now();
    const state = stater.get("pag", true);

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
      img = await Jimp.create(mcfsd(img.bitmap, opts.ditherFactor));
      state.state = "Dithered..";
      state.current++;
    }

    state.max = state.max + (img.getWidth() * img.getHeight());
    const outputPath = path.resolve(opts.outputPath);

    const a = new Appender(outputPath);

    state.state = `Calculating color map..`;
    state.current++;

    //const findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, opts.align == "vertical" ? i.topColor : i.sideColor]))));
    const findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, i.topColor]))));

    state.state = `Appending first part..`;
    state.current++;

    a.append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1},{"button_name":"BuildAndDie","data":[`, true);


    state.state = `Starting to bake..`;
    state.current++;
    let commandsUsed = 0;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, index) => {
      setTimeout(() => {
        state.state = `Baking.. (${index}, ${x}, ${y})`;
        state.current++;

        const isLastOne = x == img.bitmap.width - 1 && y == img.bitmap.height - 1;

        const pixelColorINT = img.getPixelColor(x, y);
        const pixelColorRGBA = stuffs.intToRgba(pixelColorINT);
        const pixelColorHEX = stuffs.rgbToHex(pixelColorRGBA.r, pixelColorRGBA.g, pixelColorRGBA.b);

        const { name: blockIdAndMeta } = findNearestColor(pixelColorHEX);

        if (blockIdAndMeta.startsWith("sand") || blockIdAndMeta.startsWith("gravel") || blockIdAndMeta.includes("powder")) {
          a.append(`{"cmd_line":"setblock\\t~${x}\\t~\\t~${y}\\t${opts.scaffoldBlock.id}\\t${opts.scaffoldBlock.meta}","cmd_ver":12},`);
          commandsUsed++;
        }

        a.append(`{"cmd_line":"setblock\\t~${x}\\t~1\\t~${y}\\t${blockIdAndMeta.replace(" ", "\\t")}","cmd_ver":12},`);
        commandsUsed++;

        if (isLastOne) {
          state.state = `Appending last part..`;
          state.current++;

          a.append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"[PAG] Thank you for using the Armagan's NBT App! Total ${commandsUsed} commands are used.. https://github.com/TheArmagan/armagansnbtapp",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);

          commandsUsed = 0;

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

    const startTime = Date.now();
    const state = stater.get("smb", true);

    state.running = true;

    state.state = "Reading schematic..";
    state.current++;
    const schematic = await Schematic.read(await fs.promises.readFile(path.resolve(opts.filePath)));
    state.state = "Read..";
    state.current++;

    /** @type {Vec3} */
    const offsetPos = schematic.offset.clone();

    /** @type {Vec3} */
    const endPos = schematic.end().clone();

    const a = new Appender(path.resolve(opts.outputPath));

    let blocksUsed = 0;

    state.state = "Appending first part..";
    a.append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1},{"button_name":"BuildAndDie","data":[`, true);
    state.current++;

    state.max = state.max + (schematic.size.x * schematic.size.y * schematic.size.z);
    state.state = "Starting to bake..";
    state.current++;
    process.nextTick(() => {
      for (let x = 0; x < endPos.x - offsetPos.x; x++) {
        setTimeout(() => {
          for (let y = 0; y < endPos.y - offsetPos.y; y++) {
            setTimeout(() => {
              for (let z = 0; z < endPos.z - offsetPos.z; z++) {
                setTimeout(() => {
                  const block = schematic.getBlock(new Vec3(x + offsetPos.x, y + offsetPos.y, z + offsetPos.z));

                  state.state = `Baking.. (${blocksUsed}, ${x}, ${y}, ${z})`;
                  state.current++;

                  if (!opts.ignoreList.includes(block.name.toLowerCase())) {
                    blocksUsed++;

                    const _find = legacyData.find(i => i[1].toLowerCase() == block.name.toLowerCase()) || [];
                    const [id, meta] = _find[0]?.split(":") || [];
                    let { name } = mcData12.blocksArray.find(i => i.id == id && (meta == 0 || i.variations?.some(j => j.metadata == meta))) || mcData12.blocksArray.find(i => i.id == id);


                    a.append(`{"cmd_line":"setblock\\t~${x}\\t~${y}\\t~${z}\\t${name}\\t${meta}","cmd_ver":12},`);
                  }

                  if (x == endPos.x - offsetPos.x - 1 && y == endPos.y - offsetPos.y - 1 && endPos.z - offsetPos.z - 1) {
                    state.state = "Appending last part..";
                    a.append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"[SMB] Thank you for using the Armagan's NBT App! Total ${blocksUsed} blocks are used.. https://github.com/TheArmagan/armagansnbtapp",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);
                    blocksUsed++;

                    const tokeTime = Date.now() - startTime;
                    state.state = `Baked! (Took ${(tokeTime / 1000).toFixed(2)} seconds..)`;
                    state.current = state.max;
                    state.running = false;
                  }
                }, z / 100)
              }
            }, y / 100)
          }
        }, x / 100)
      }
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

