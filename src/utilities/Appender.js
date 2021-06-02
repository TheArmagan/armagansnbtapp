const fs = require("fs");
class Appender {
  path = "";
  limit = 2048;
  list = [];
  joiner = "";
  constructor(path = "", limit = 2048, joiner="") {
    this.path = path;
    this.limit = limit;
    this.joiner = joiner;
  }

  append(data = "", force = false) {
    this.list.push(data);
    if (this.list.length >= this.limit || force) {
      fs.appendFileSync(this.path, this.list.join(this.joiner), "utf-8");
      this.list.length = 0;
    }
  }
}

module.exports = Appender;
