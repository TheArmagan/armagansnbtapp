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
    settings: {
      collapseIndex: -1,
    },
  },
  watch: {
    "pag.file"(file) {
      if (file && file.type != "image/jpeg") {
        this.$buefy.toast.open("Input only can be JPG file.");
        this.pag.file = null;
        this.pag.imageInfo = null;
      } else {
        const filePath = this.pag.file?.path.replace(/\\/gm, "/");
        ipcRenderer.send("pag-image-info", filePath);
      }
    },
    "pag.output"(file) {
      if (file && file.type != "text/plain") {
        this.$buefy.toast.open("Output only can be TXT file!");
        this.pag.output = null;
      }
    },
    "pag.colorMap.text": _.debounce((text) => {
      app.pag.colorMap.object = parseConfig(text);
      localStorage.setItem("pag.colorMap", text);
    }, 1000),
  },
  methods: {
    quit() {
      ipcRenderer.send("app-quit");
    },
    pagStart() {
      ipcRenderer.send("pag-start", {
        filePath: this.pag.file?.path,
        ditherFactor: this.pag.ditherFactor,
        scaleFactor: this.pag.scaleFactor
      })
    }
  },
  computed: {
    isPAGReadyToStart() {
      return !(!this.pag.file || !this.pag.output);
    },
  },
  mounted() {
    if (typeof localStorage.getItem("pag.colorMap") == "undefined") {
      localStorage.setItem("pag.colorMap", DEFAULT_COLOR_MAP);
    }

    this.pag.colorMap.text = localStorage.getItem("pag.colorMap");
  },
});

Vue.use(Buefy);

ipcRenderer.on("pag-image-info", (_, data) => {
  app.pag.imageInfo = data;
  app.pag.imageInfo.size = app.pag.file.size;
});

ipcRenderer.on("pag-state", (_, data) => {
  app.pag.state = { ...app.pag.state, ...data };
  console.log(app.pag.state)
});

function parseConfig(t = "") {
  return t
    .split("\n")
    .map((j) =>
      Object.fromEntries(j.split(";").map((i) => i.split("=", 2)))
    );
}