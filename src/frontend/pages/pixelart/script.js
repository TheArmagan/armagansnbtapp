var componentScript = {
  data() {
    return {
      inputFile: null,
      outputFile: null,
      imageWidth: 0,
      imageHeight: 0,
      imagePixelAmount: 0,
      scaleFactor: 1,
      ditheringFactor: 5,
      state: {
        progressMax: 0,
        progress: 0,
        stateText: "...",
        running: false
      }
    }
  },
  watch: {
    async inputFile() {
      this.calcluteImageSize();
    },
    outputFile(file) {
      if (!file?.name) return;
      if (file.size != 0) {
        NOTIFY.warn("Please select a clean txt file.", 10000);
      }
    },
    scaleFactor() {
      this.calcluteImageSize();
    }
  },
  methods: {
    async calcluteImageSize() {
      if (!this.inputFile?.name) {
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.imagePixelAmount = 0;
        return;
      }
      const { width, height } = await API.getImageSize(this.inputFile.path);
      this.imageWidth = Math.round(width * this.scaleFactor);
      this.imageHeight = Math.round(height * this.scaleFactor);
      this.imagePixelAmount = Math.round(this.imageWidth * this.imageHeight);
    },
    start: debounce(async function () {
      if (this.state.running) return;
      if (!config.get("colorMapFile")?.path) return NOTIFY.error("Please first select a color map. From the settings..");
      API.startGenerator("pixelart", {
        inputFile: this.inputFile.path,
        outputFile: this.outputFile.path,
        scaleFactor: this.scaleFactor,
        ditheringFactor: this.ditheringFactor
      });
    }, 100)
  },
  async mounted() {
    await new Promise(r => this.$nextTick(r));
    window.pagePixelart = this;
    const self = this;
    (() => {
      async function _update() {
        if (self.$route.path == "/pixelart") {
          self.state = await API.getGeneratorState("pixelart");
        }
        await sleep(50);
        _update();
      }
      _update();
    })();
  }
}

