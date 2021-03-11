const NBT = require("prismarine-nbt");
const fs = require("fs");

// let nbt = NBT.simplify(NBT.parseUncompressed(fs.readFileSync("./canonical_block_states.nbt"), true));

// console.log(nbt);

// NBT.parse(fs.readFileSync("./block_states.lev.nbt"), true, (err, nbt) => {
//   console.log(NBT.simplify(nbt));
// })



(async () => {
  let nbt = await NBT.parse(fs.readFileSync("./blockpalette.1_16_210.nbt"));
  console.log(JSON.stringify(NBT.simplify(nbt.parsed), null, 2));
})();

// let buffer = fs.readFileSync("./blockpalette.1_16_210.nbt");

// (async () => {
//   while (buffer.startOffset != buffer.byteLength) {
//     const { parsed, metadata } = await NBT.parse(buffer);
//     buffer.startOffset += metadata.size;

//     console.log(NBT.simplify(parsed));
//   }
// })();



