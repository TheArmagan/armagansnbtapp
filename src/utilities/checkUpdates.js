const fetch = require("node-fetch").default;
const path = require("path");
const FreshDB = require("fresh.db");
const db = new FreshDB({ name: "db", folderPath: path.resolve(process.env.APPDATA, "Armagan's NBT App", "data") });
const HOURS_12 = 43_200_000; // 12 hours
const semver = require("semver");
const { dialog } = require("electron");
const package = require(path.resolve(__dirname, "../../package.json"));

async function checkUpdate(mainWindow) {
  let lastChecked = db.get("lastUpdateChecked", 0)

  if (Date.now() - lastChecked > HOURS_12) {
    console.log("[UPDATER] Checking for updates..");
    let json = await fetch("https://api.github.com/repos/thearmagan/armagansnbtapp/releases").then(d => d.json());
    let isNewVersionOut = semver.gt(json[0].tag_name, package.version);

    if (isNewVersionOut) {
      console.log("[UPDATER] New update found!");
      let dialogResult = await dialog.showMessageBox(mainWindow, {
        type: "warning",
        message: "New version is out! Get the latest version!",
        buttons: [
          "No",
          "Yes"
        ],
        cancelId: 0,
        defaultId: 1
      });

      if (dialogResult.response) {
        await shell.openExternal("https://github.com/TheArmagan/armagansnbtapp");
      }

      app.quit();
    } else {
      console.log("[UPDATER] No new updates found..");
      db.set("lastUpdateChecked", Date.now());
    }
  }
}

module.exports = checkUpdate;