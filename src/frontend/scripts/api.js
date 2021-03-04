const API = {
  quit() {
    fetch("/api/quit");
  },
  minimize() {
    fetch("/api/minimize");
  },
  focus() {
    fetch("/api/focus");
  },
  async getImageSize(filePath) {
    return await ipcRenderer.invoke("other:image-size", filePath);
  },
  async getGeneratorState(gen) {
    return await ipcRenderer.invoke(`generators:${gen}:state`);
  },
  async startGenerator(gen, options) {
    return await ipcRenderer.invoke(`generators:${gen}:start`, cleanObjectReferences(options));
  }
}