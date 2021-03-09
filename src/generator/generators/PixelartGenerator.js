const { ipcMain, Notification } = require("electron");
const Jimp = require("jimp");
const GeneratorManager = require("../GeneratorManager");
const path = require("path");
const mcfsd = require("mcfsd");
const Appender = require("../../utilities/Appender");
const NearestColor = require("nearest-color");
const fs = require("fs");
const stuffs = require("stuffs");

class PixelartGenerator {
  /** @type {GeneratorManager} */
  generatorManager;

  state = {
    progressMax: 0,
    progress: 0,
    stateText: "...",
    running: false
  }

  constructor(generatorManager) {
    this.generatorManager = generatorManager;
  }

  async init() {
    ipcMain.handle("generators:pixelart:state", async (_) => {
      return this.state;
    });

    ipcMain.handle("generators:pixelart:start", async (_, config) => {
      if (this.state.running) return;
      this.run(config);
    });
  }

  /**
   * @param {{inputFile: string, outputFile: string, scaleFactor: number, ditheringFactor: number, buildFromCenter: boolean}} config
   */
  async run(config) {
    if (this.state.running) return;

    const start = Date.now();

    let userConfig = this.generatorManager.nbtapp.userConfig;

    this.state.progress = 0;
    this.state.progressMax = 100;
    this.state.running = true;

    this.state.stateText = "Reading image..";
    let img = await Jimp.read(path.resolve(config.inputFile));
    this.state.stateText = "Image read..";
    this.state.progress++;

    if (config.scaleFactor != 1) {
      this.state.stateText = `Scaling..`;
      this.state.progress++;
      await img.scale(config.scaleFactor);
      this.state.stateText = "Scaled..";
      this.state.progress++;
    }

    if (config.ditheringFactor != 0) {
      this.state.stateText = `Dithering.. (Takes some time)`;
      this.state.progress++;
      img = await Jimp.create(await mcfsd(img.bitmap, config.ditheringFactor));
      this.state.stateText = "Dithered..";
      this.state.progress++;
    }

    this.state.progressMax = this.state.progressMax + (img.getWidth() * img.getHeight());
    let outputFile = path.resolve(config.outputFile);

    this.state.stateText = `Gathering colormap data..`;
    this.state.progress++;

    let colorMap = JSON.parse(fs.readFileSync(path.resolve(userConfig.colorMapFile.path), "utf-8"));

    this.state.stateText = `Creating color map..`;
    this.state.progress++;

    let findNearestColor = NearestColor.from(Object.fromEntries(colorMap.map(i => ([`${i.name}${i?.meta ? `\\t${i.meta}` : ""}`, `#${i.color}`]))));

    let appender = new Appender(outputFile, userConfig.appenderLimit);

    this.state.stateText = `Appending first part..`;
    this.state.progress++;

    appender.append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"-","type":1},{"button_name":"BuildAndDie","data":[`, true);

    this.state.stateText = `Starting to bake..`;
    this.state.progress++;

    let _halfW = config.buildFromCenter ? Math.round(img.bitmap.width / 2) : 0;
    let _halfH = config.buildFromCenter ? Math.round(img.bitmap.height / 2) : 0;

    let commandsUsed = 0;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
      setTimeout(() => {
        this.state.stateText = `Baking.. (${x}, ${y})`;
        this.state.progress++;

        let pixelColorINT = img.getPixelColor(x, y);
        let pixelColorRGBA = stuffs.intToRgba(pixelColorINT);

        if (pixelColorRGBA.a != 0) {
          let pixelColorHEX = stuffs.rgbToHex(pixelColorRGBA.r, pixelColorRGBA.g, pixelColorRGBA.b);
          let { name: blockNameAndMeta } = findNearestColor(pixelColorHEX);

          if (blockNameAndMeta.startsWith("sand") || blockNameAndMeta.startsWith("gravel") || blockNameAndMeta.includes("powder")) {
            appender.append(`{"cmd_line":"setblock\\t~${x - _halfW}\\t~\\t~${y - _halfH}\\tstone","cmd_ver":12},`);
            commandsUsed++;
          }

          appender.append(`{"cmd_line":"setblock\\t~${x - _halfW}\\t~1\\t~${y - _halfH}\\t${blockNameAndMeta}","cmd_ver":12},`);
          commandsUsed++;
        }

        let isLastOne = x == img.bitmap.width - 1 && y == img.bitmap.height - 1;

        if (isLastOne) {
          this.state.stateText = `Finishing...`;
          this.state.progress++;

          let secondsTook = ((Date.now() - start) / 1000).toFixed(2);

          appender.append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"-","type":1}]",CustomName:"Armagan's NBT App - https://thearmagan.github.io/discord",InterativeText:"Thank you for using the Armagan's NBT App! Total ${commandsUsed} commands are used.. Took ${secondsTook} seconds to make.. (${config.buildFromCenter ? "Builds from the center!" : "Builds from the left top corner!"}) | https://thearmagan.github.io/discord",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);

          this.state.stateText = `Baked! (Took ${secondsTook} seconds..)`;
          this.state.progress = this.state.progressMax;
          this.state.running = false;

          if (userConfig.desktopNotifications) {
            new Notification({
              title: "Armagan's NBT App",
              body: `Your pixel art is baked! (Took ${secondsTook} seconds..)`
            }).show();
          }

          appender = 0;
          img = 0;
          commandsUsed = 0;
        }

      }, idx / 500)
    })

    
  }
}
module.exports = PixelartGenerator;