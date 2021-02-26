const Jimp = require("jimp");
const NearestColor = require("nearest-color");
const Appender = require("../Appender");
const mcfsd = require("mcfsd");

async function pixelArtGenerator(options, state) {
  state.state = `Reading the image file..`;
  state.current++;
  console.log(3)
  let img = await Jimp.read(path.resolve(options.filePath));
  state.state = "Readd..";
  state.current++;
  console.log(1)


  if (options.scaleFactor != 1) {
    state.state = `Scaling..`;
    state.current++;
    await img.scale(options.scaleFactor);
    state.state = "Scaled..";
    state.current++;
  }

  if (options.ditherFactor != 0) {
    state.state = `Dithering.. (Takes some time)`;
    state.current++;
    img = await Jimp.create(await mcfsd(img.bitmap, options.ditherFactor));
    state.state = "Dithered..";
    state.current++;
  }

  state.max = state.max + (img.getWidth() * img.getHeight());
  let outputPath = path.resolve(options.outputPath);

  let a = new Appender(outputPath, options.appenderLimit);

  state.state = `Calculating color map..`;
  state.current++;

  //let findNearestColor = nearestColor.from(Object.fromEntries(opts.colorMap.map(i => ([`${i.id} ${i.meta}`, opts.align == "vertical" ? i.topColor : i.sideColor]))));
  let findNearestColor = NearestColor.from(Object.fromEntries(options.colorMap.map(i => ([`${i.id} ${i.meta}`, i.topColor]))));

  state.state = `Appending first part..`;
  state.current++;

  a.append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"-","type":1},{"button_name":"BuildAndDie","data":[`, true);


  state.state = `Starting to bake..`;
  state.current++;
  let commandsUsed = 0;
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, index) => {
    state.state = `Baking.. (${index}, ${x}, ${y})`;
    state.current++;

    let isLastOne = x == img.bitmap.width - 1 && y == img.bitmap.height - 1;

    let pixelColorINT = img.getPixelColor(x, y);
    let pixelColorRGBA = stuffs.intToRgba(pixelColorINT);
    let pixelColorHEX = stuffs.rgbToHex(pixelColorRGBA.r, pixelColorRGBA.g, pixelColorRGBA.b);

    console.log(2)

    let { name: blockIdAndMeta } = findNearestColor(pixelColorHEX);

    if (blockIdAndMeta.startsWith("sand") || blockIdAndMeta.startsWith("gravel") || blockIdAndMeta.includes("powder")) {
      a.append(`{"cmd_line":"setblock\\t~${x}\\t~\\t~${y}\\t${options.scaffoldBlock.id}\\t${options.scaffoldBlock.meta}","cmd_ver":12},`);
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
  })
}

module.exports = pixelArtGenerator;