const fs = require("fs");
const path = require("path");
const chillout = require("chillout");
const NBTAPP = require("../NBTAPP");

class LanguageManager {

  translations = {};

  code = "en-us";

  /** @type {NBTAPP} */
  nbtapp;

  constructor(nbtapp) {
    this.nbtapp = nbtapp;
  }

  async init() {
    let translationsPath = path.resolve(__dirname, "translations");
    let translationPaths = await fs.promises.readdir(translationsPath);

    await chillout.repeat(translationPaths.length, (i) => {
      let translationFile = translationPaths[i];
      let translation = require(path.resolve(translationsPath, translationFile));

      this.translations[translation.meta.code] = translation.meta;
      console.log(`[I18N] Language ${translation.meta.name} (${translation.meta.code}) is loaded!`);
    });

  }

  get translation() {
    return this.translations[this.code];
  };

}

module.exports = LanguageManager;