var componentScript = {
  data() {
    return {
      config: {},
      colorMapFile: null
    }
  },
  watch: {
    colorMapFile(file) {
      if (!file?.path) return;
      if (!file.path.endsWith(".colormap.json")) {
        this.colorMapFile = null;
        return NOTIFY.error("Only .colormap.json extension is allowed!", 5000);
      }
      this.config.colorMapFile = { name: file.name, path: file.path, size: file.size };
    }
  },
  methods: {
    saveSettings() {
      config.setAll(this.config);
      NOTIFY.info("Settings are saved!");
    }
  },
  async mounted() {
    await new Promise(r => this.$nextTick(r));
    this.config = config.getAll();
    if (this?.config?.colorMapFile?.name) this.colorMapFile = this.config.colorMapFile
    window.pageSettings = this;
  }
}

