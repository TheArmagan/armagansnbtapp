var componentScript = {
  data() {
    return {
      inputFile: null,
      outputFile: null,
      imageWidth: 0,
      imageHeight: 0,
      imagePixelAmount: 0,
      scaleFactor: 1,
      ditheringFactor: 5
    }
  },
  watch: {
    async inputFile() {
      this.calcluteImageSize();
    },
    outputFile(file) {
      if (!file?.name) return;
      if (file.size != 0) {
        NOTIFY.show("Please select a clean txt file.");
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
    }
  }
}

