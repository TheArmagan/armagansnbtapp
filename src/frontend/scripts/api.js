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
    let { data } = await fetch("/api/other/image-size", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        path: filePath
      })
    }).then(d => d.json());
    return data;
  }
}