const Appender = require("../utilities/Appender");
const { Schematic } = require('prismarine-schematic');
const { Vec3 } = require("vec3");
const fs = require("fs");
const legacyData = require("../data/legacyBlockData.json");
const MinecraftData = require("minecraft-data");
const mcData12 = MinecraftData("1.12");

async function schematicGenerator(options, state) {
  let startTime = Date.now();

  state.state = "Reading schematic.. (Takes some time..)";
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

  state.state = "Appending first part..";
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
}

module.exports = schematicGenerator;