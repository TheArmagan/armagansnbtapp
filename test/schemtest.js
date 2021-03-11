const { Schematic } = require('prismarine-schematic');
const { Vec3 } = require("vec3");
const fs = require("fs");
const MinecraftData = require("minecraft-data");
let validVersionRegex = /^\d+\.\d+(\.\d+)?$/;
let pcVersions = MinecraftData.versions.pc;
let latestVersion = pcVersions.find(i => validVersionRegex.test(i.minecraftVersion)).minecraftVersion;
const mcData18 = MinecraftData("1.8.8");
const chillout = require("chillout");
const { Block } = require("prismarine-block");
const javaToBedrockList = require("./javaToBedrockList");


(async () => {
  let schematic = await Schematic.read(fs.readFileSync("./test.schematic"), latestVersion);

  /** @type {Vec3} */
  let offsetPos = schematic.offset.clone();

  /** @type {Vec3} */
  let endPos = schematic.end().clone();

  await chillout.repeat(endPos.x - offsetPos.x, async (x) => {
    await chillout.repeat(endPos.y - offsetPos.y, async (y) => {
      await chillout.repeat(endPos.z - offsetPos.z, async (z) => {
        let block = schematic.getBlock(new Vec3(x + offsetPos.x, y + offsetPos.y, z + offsetPos.z));
        if (block.name != "air") {
          let bdBlock = findBedrockName(block);

          console.log(bdBlock, block)
        }
      })
    })
  })



})();

console.log(javaToBedrockList)

/**
 * @param {Block} block 
 */
function findBedrockName(block) {
  let bedrock = javaToBedrockList.find(i => {
    return i[0][0] == block.name && i[0][1] == block.metadata
  });
  if (bedrock) {
    return [...bedrock[1], "bedrock"];
  } else {
    return [block.name, block.metadata, "java"];
  }
}