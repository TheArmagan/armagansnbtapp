const fs = require("fs");
class Appender {
  path = "";
  limit = 2048;
  list = [];
  constructor(path = "", limit = 2048) {
    this.path = path;
    this.limit = limit;
  }

  append(data = "", force = false) {
    this.list.push(data);
    if (this.list.length >= this.limit || force) {
      fs.appendFileSync(this.path, this.list.join(""), "utf-8");
      this.list.length = 0;
    }
  }
}

module.exports = Appender;