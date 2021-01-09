const fs = require("fs");

class FileAppender {
  temp = {};
  constructor(makeReadyList = []) {
    makeReadyList.forEach(k => {
      this.temp[k] = [];
    });
  }

  appendSync(key = "", path = "", data = "", o = { limit: 2048, enc: "utf-8", forceSave: false }) {
    this.temp[key].push(data);
    if (this.temp[key].length >= (o?.limit || 2048) || o?.forceSave) {
      fs.appendFileSync(path, this.temp[key].join(""), o?.enc || "utf-8");
      this.temp[key].length = 0;
    }
  }
}

module.exports = { FileAppender };