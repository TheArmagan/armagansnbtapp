const { ipcRenderer, shell } = require("electron");

let router;
let app;
let pageComponents = {};


(async () => {

  // Page loading system
  let pageNames = ["home", "settings"];
  await chillout.forEach(pageNames, async (pageName) => {
    'use strict';
    let pageElement = document.createElement("body");
    pageElement.innerHTML = await fetch(`/pages/${pageName}/index.html`).then(d => d.text());
    pageElement.querySelector("div").classList.add(`${pageName}-page`);
    let pageScript = eval(`${await fetch(`/pages/${pageName}/script.js`).then(d => d.text())}; componentScript`);
    let styleSheetElement = document.createElement("link");
    styleSheetElement.classList.add(`${pageName}-page-style`);
    styleSheetElement.rel = "stylesheet";
    styleSheetElement.href = `/pages/${pageName}/style.css`;
    document.head.appendChild(styleSheetElement);
    pageComponents[pageName] = {
      template: pageElement.innerHTML,
      ...pageScript
    }
    styleSheetElement = 0;
    pageElement = 0;
    pageScript = 0;
    console.log(`%c[PAGES]%c Page ${pageName} is loaded!`, "color:#F04747;", "color:#B9BBBE;");
  })

  router = new VueRouter({
    routes: [
      {
        path: "/",
        component: pageComponents.home,
        name: "Welcome!",
      },
      {
        path: "/settings",
        component: pageComponents.settings,
        name: "Settings",
      },
      {
        path: "/generators/pixel-art",
        component: { template: "<div>Pixel Art</div>" },
        name: "Pixel Art Generator",
      },
      {
        path: "/generators/schematic",
        component: { template: "<div>Schematic</div>" },
        name: "Schematic Converter",
      }
    ],
  });

  app = new Vue({
    el: "#app",
    data() {
      return {
        title: document.title,
      }
    },
    methods: {
      quit() {
        ipcRenderer.send("quit");
      }
    },
    watch: {
      title(data) {
        document.title = data;
      },
      $route(data) {
        this.title = data.name;
      }
    },
    router
  });
  loading()
})();
