const fs = require('fs').promises
const { Schematic } = require('prismarine-schematic');
const { Vec3 } = require("vec3");
const MinecraftData = require("minecraft-data");
const { Appender } = require("../Appender");
const legacyData = require("./legacy.json");

const mcData12 = MinecraftData("1.12");

function findBlockByName(f = "") {
  return legacyData.find(i => i[1].toLowerCase() == f.toLowerCase()) || [];
}

async function main() {
  const schematic = await Schematic.read(await fs.readFile('house8399224.schematic'));

  /** @type {Vec3} */
  const offsetPos = schematic.offset.clone();

  /** @type {Vec3} */
  const endPos = schematic.end().clone();


  const a = new Appender("test.txt");

  const { append } = a;

  let blocksUsed = 0;

  append(`{Occupants:[{ActorIdentifier:"minecraft:npc<>",SaveData:{Actions:"[{"button_name":"Die","data":[{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1},{"button_name":"BuildAndDie","data":[`, true);

  for (let x = 0; x < endPos.x - offsetPos.x; x++) {
    for (let y = 0; y < endPos.y - offsetPos.y; y++) {
      for (let z = 0; z < endPos.z - offsetPos.z; z++) {
        const block = schematic.getBlock(new Vec3(x + offsetPos.x, y + offsetPos.y, z + offsetPos.z));
        delete block.biome;
        if (block.name != "air") {
          const _find = findBlockByName(block.name);
          const [id, meta] = _find[0]?.split(":") || [];
          let { name } = mcData12.blocksArray.find(i => i.id == id && (meta == 0 || i.variations?.some(j => j.metadata == meta))) || mcData12.blocksArray.find(i => i.id == id);
          blocksUsed++;
          append(`{"cmd_line":"setblock\\t~${x}\\t~${y}\\t~${z}\\t${name}\\t${meta}","cmd_ver":12},`);
        }
      }
    }
  }

  append(`{"cmd_line":"kill\\t@e[type=npc,r=1]","cmd_ver":12}],"mode":0,"text":"","type":1}]",CustomName:"Â§bArmagan's Stuff",InterativeText:"Thank you for using the Armagan's NBT App! Total ${blocksUsed} blocks are used.. https://github.com/TheArmagan/armagansnbtapp",Variant:19,Ticking:1b,TicksLeftToStay:1}]}`, true);

  fs.writeFile("schema.json", JSON.stringify(blocks, null, 2), "utf-8");

}

main()