const app = new Vue({
  el: "#app",
  data: {
    title: document.title,
    pag: {
      file: null,
      ditherFactor: 5,
      imageInfo: null,
      colorMap: {
        text: "",
        object: {},
      },
      scaffoldBlock: {
        text: "",
        object: {},
      },
      output: null,
      scaleFactor: 1,
      state: {
        running: false,
        max: 100,
        current: 0,
        state: "...",
      },
      align: "horizontal"
    },
    smb: {
      file: null,
      output: null,
      includeAir: false,
      schematicInfo: null,
      state: {
        running: false,
        max: 100,
        current: 0,
        state: "...",
      },
      ignoreList: {
        text: "",
        object: {}
      }
    },
    settings: {
      collapseIndex: -1,
    },
  },
  watch: {
    "pag.file"(file) {
      if (file && file.type != "image/jpeg") {
        this.$buefy.toast.open({ message: "Input only can be JPG file.", type: "is-danger" });
        this.pag.file = null;
        this.pag.imageInfo = null;
      } else {
        const filePath = this.pag.file?.path.replace(/\\/gm, "/");
        ipcRenderer.send("pag-image-info", filePath);
      }
    },
    "pag.output"(file) {
      if (file) {
        if (file.type != "text/plain") {
          this.$buefy.toast.open({ message: "Output only can be TXT file!", type: "is-danger" });
          this.pag.output = null;
          return;
        }

        if (file.size != 0) {
          app.$buefy.toast.open({ message: "Selected output file is not blank.", type: "is-warning" })
        }
      }
    },
    "pag.colorMap.text": _.debounce((text) => {
      app.pag.colorMap.object = parseConfig(text);
      localStorage.setItem("pag.colorMap", text);
    }, 1000),
    "pag.scaffoldBlock.text": _.debounce((text) => {
      app.pag.scaffoldBlock.object = parseConfig(text)[0];
      localStorage.setItem("pag.scaffoldBlock", text);
    }, 100),
    "smb.ignoreList.text": _.debounce((text) => {
      app.smb.ignoreList.object = text.toLowerCase().split(",");
      localStorage.setItem("smb.ignoreList", text);
    }, 100),
    "smb.file"(file) {
      if (file && !["schem", "schematic"].includes(getFileExt(file.name))) {
        console.log(getFileExt(file.name))
        this.$buefy.toast.open({ message: "Input only can be SCHEMATIC file.", type: "is-danger" });
        this.smb.file = null;
      }
    },
    "smb.output"(file) {
      if (file && file.type != "text/plain") {
        this.$buefy.toast.open({ message: "Output only can be TXT file!", type: "is-danger" });
        this.smb.output = null;
      }
    },
    "smb.output"(file) {
      if (file) {
        if (file.type != "text/plain") {
          this.$buefy.toast.open({ message: "Output only can be TXT file!", type: "is-danger" });
          this.smb.output = null;
          return;
        }

        if (file.size != 0) {
          app.$buefy.toast.open({ message: "Selected output file is not blank.", type: "is-warning" })
        }
      }
    },
  },
  methods: {
    quit() {
      ipcRenderer.send("app-quit");
    },
    pagStart() {
      ipcRenderer.send("pag-start", {
        filePath: this.pag.file?.path,
        ditherFactor: this.pag.ditherFactor,
        scaleFactor: this.pag.scaleFactor,
        outputPath: this.pag.output?.path,
        colorMap: this.pag.colorMap.object,
        align: this.pag.align,
        scaffoldBlock: this.pag.scaffoldBlock.object
      });
    },
    smbStart() {
      ipcRenderer.send("smb-start", {
        filePath: this.smb.file?.path,
        outputPath: this.smb.output?.path,
        includeAir: this.smb.includeAir,
        ignoreList: this.smb.ignoreList.object
      });
    }
  },
  mounted() {
    if (!localStorage.getItem("pag.colorMap")) {
      localStorage.setItem("pag.colorMap", DEFAULT_COLOR_MAP);
    }

    this.pag.colorMap.text = localStorage.getItem("pag.colorMap");

    if (!localStorage.getItem("pag.scaffoldBlock")) {
      localStorage.setItem("pag.scaffoldBlock", DEFAULT_SCAFFOLD_BLOCK);
    }

    this.pag.scaffoldBlock.text = localStorage.getItem("pag.scaffoldBlock");

    if (!localStorage.getItem("smb.ignoreList")) {
      localStorage.setItem("smb.ignoreList", DEFAULT_IGNORED_BLOCK_LIST);
    }

    this.smb.ignoreList.text = localStorage.getItem("smb.ignoreList");
  },
});

Vue.use(Buefy);

ipcRenderer.on("pag-image-info", (_, data) => {
  app.pag.imageInfo = data;
  app.pag.imageInfo.size = app.pag.file.size;
});

ipcRenderer.on("state", (_, data) => {
  data.forEach(([STATE_NAME, STATE_DATA]) => {
    app[STATE_NAME].state = STATE_DATA;
  });
});

function parseConfig(t = "") {
  return t
    .split("\n")
    .map((j) =>
      Object.fromEntries(j.split(";").map((i) => i.split("=", 2)))
    );
}

function getFileExt(t = "") {
  return t.split("/").pop().split(/\?|\#/gm).shift().split(".").pop().toLowerCase();
}