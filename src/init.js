const { dialog } = require("electron");
const NBTAPP = require("./NBTAPP");
const util = require("util");

const nbtapp = new NBTAPP();


(async () => {
  console.log("[INIT] Initalizing...");

  await nbtapp.init();

  console.log("[INIT] Adding error handlers..");

  process.on('unhandledRejection', async (reason, promise) => {
    console.log("Armagan's NBT App - Uh oh! Something went wrong.");
    console.log(reason, promise);
  });
  process.on('uncaughtException', async (error) => {
    console.log(error);
    await dialog.showMessageBox(nbtapp.mainWindow, {
      type: "error",
      title: "Armagan's NBT App - Uh oh! Something went wrong.",
      buttons: [
        "Ok"
      ],
      message: `Screenshot that error. And get help from discord server.\n\n${util.inspect(error, false, 8, false)}`
    });
    process.exit(1);
  });
})();