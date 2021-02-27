(() => {
  let popupElement = document.createElement("div");
  popupElement.id = "popup-element";
  popupElement.setAttribute("style", `
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  background-color: rgba(0,0,0,0.65);
  font-size: 28px;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: whitesmoke;
  -webkit-app-region: drag;
  font-family: "Comfortaa", cursive;
  `.replace(/\n/gm, "").replace(/ {2,}/gm, "").replace(/: /gm, ":"));
  document.body.appendChild(popupElement);

  window.loading = (content) => {
    if (content) {
      popupElement.textContent = content;
      popupElement.style.width = "100vw";
      popupElement.style.height = "100vh";
    } else {
      popupElement.textContent = "";
      popupElement.style.width = "0";
      popupElement.style.height = "0";
    }
  }
})();