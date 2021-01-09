const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const express = require("express");
const expressApp = express();
const fs = require("fs");
const Jimp = require("jimp");
const mcfsd = require("mcfsd");
const stuffs = require("stuffs");
const nearestColor = require("nearest-color");
const { FileAppender } = require("./FileAppender");
const { Appender } = require("./Appender");
const { Schematic } = require('prismarine-schematic');
const { Vec3 } = require("vec3");
const MinecraftData = require("minecraft-data");
const legacyData = require("./legacyBlockData.json");
const mcData12 = MinecraftData("1.12");

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true"
process.env.PORT = process.env.PORT || 8987;
expressApp.listen(process.env.PORT);
expressApp.use(express.static(path.resolve(__dirname, "public")));

if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit();
}

const appender = new FileAppender(["PAG"]);

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
    }, 100)


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
      pagState.state = `Dithering.. (Takes some time)`;
      pagState.current++;
      img = await Jimp.create(mcfsd(img.bitmap, opts.ditherFactor));
      pagState.state = "Dithered..";
      pagState.current++;
    }

    pagState.max = pagState.max + (img.getWidth() * img.getHeight());
    const outputPath = path.resolve(opts.outputPath);

    const a = new Appender(outputPath); // bu şek,şde yapmam gerekiyordu çünkü context hataları yüzünden..
    const { append } = a;

    pagState.state = `Calculating color map..`;
    pagState.current++;

    //const findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, opts.align == "vertical" ? i.topColor : i.sideColor]))));
    const findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, i.topColor]))));

    pagState.state = `Appending first part..`;
    pagState.current++;

    append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1},{"button_name":"BuildAndDie","data":[`, true);


    pagState.state = `Starting to bake..`;
    pagState.current++;
    let commandsUsed = 0;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, index) => {
      setTimeout(() => {
        pagState.state = `Baking.. (${index}, ${x}, ${y})`;
        pagState.current++;

        const isLastOne = x == img.bitmap.width - 1 && y == img.bitmap.height - 1;

        const pixelColorINT = img.getPixelColor(x, y);
        const pixelColorRGBA = stuffs.intToRgba(pixelColorINT);
        const pixelColorHEX = stuffs.rgbToHex(pixelColorRGBA.r, pixelColorRGBA.g, pixelColorRGBA.b);

        const { name: blockIdAndMeta } = findNearestColor(pixelColorHEX);

        if (blockIdAndMeta.startsWith("sand") || blockIdAndMeta.startsWith("gravel") || blockIdAndMeta.includes("powder")) {
          append(`{"cmd_line":"setblock\\t~${x}\\t~\\t~${y}\\t${opts.scaffoldBlock.id}\\t${opts.scaffoldBlock.meta}","cmd_ver":12},`);
          commandsUsed++;
        }

        append(`{"cmd_line":"setblock\\t~${x}\\t~1\\t~${y}\\t${blockIdAndMeta.replace(" ", "\\t")}","cmd_ver":12},`);
        commandsUsed++;

        if (isLastOne) {
          pagState.state = `Appending last part..`;
          pagState.current++;

          append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"[PAG] Thank you for using the Armagan's NBT App! Total ${commandsUsed} commands are used.. https://github.com/TheArmagan/armagansnbtapp",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);


          commandsUsed = 0;

          let tokeTime = Date.now() - startTime;
          pagState.state = `Generated! (Took ${(tokeTime / 1000).toFixed(2)} seconds..)`;
          pagState.current = pagState.max;
          pagState.running = false;

          setTimeout(() => { clearInterval(clientUpdater); }, 5000);
        }
      }, index / 500)
    })
  })

  ipcMain.on("smb-start", async (_, opts) => {

    const schematic = await Schematic.read(await fs.readFile(path.resolve(opts.filePath)));

    /** @type {Vec3} */
    const offsetPos = schematic.offset.clone();

    /** @type {Vec3} */
    const endPos = schematic.end().clone();

    const a = new Appender(path.resolve(opts.outputPath));
    const { append } = a;

    let blocksUsed = 0;

    append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1},{"button_name":"BuildAndDie","data":[`, true);

    for (let x = 0; x < endPos.x - offsetPos.x; x++) {
      for (let y = 0; y < endPos.y - offsetPos.y; y++) {
        for (let z = 0; z < endPos.z - offsetPos.z; z++) {
          const block = schematic.getBlock(new Vec3(x + offsetPos.x, y + offsetPos.y, z + offsetPos.z));

          if (!opts.includeAir && block.name.toLowerCase() == "air") break;

          const _find = legacyData.find(i => i[1].toLowerCase() == block.name.toLowerCase()) || [];
          const [id, meta] = _find[0]?.split(":") || [];
          let { name } = mcData12.blocksArray.find(i => i.id == id && (meta == 0 || i.variations?.some(j => j.metadata == meta))) || mcData12.blocksArray.find(i => i.id == id);
          blocksUsed++;

          append(`{"cmd_line":"setblock\\t~${x}\\t~${y}\\t~${z}\\t${name}\\t${meta}","cmd_ver":12},`);
        }
      }
    }

    append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"[SMB] Thank you for using the Armagan's NBT App! Total ${blocksUsed} blocks are used.. https://github.com/TheArmagan/armagansnbtapp",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);
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

