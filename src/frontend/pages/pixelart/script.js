var componentScript = {
  data() {
    return {
      inputFile: null,
      outputFile: null,
      imageWidth: 0,
      imageHeight: 0,
      imagePixelAmount: 0
    }
  },
  watch: {
    async inputFile(file) {
      if (!file?.name) {
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.imagePixelAmount = 0;
        return;
      }
      const { width, height, pixelAmount } = await API.getImageSize(file.path);
      this.imageWidth = width;
      this.imageHeight = height;
      this.imagePixelAmount = pixelAmount;
    },
    async outputFile(file) {
      if (!file?.name) return;
      if (file.size != 0) {

      }
    }
  }
}

