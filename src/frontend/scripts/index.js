let router;
let pageComponents = {};

Vue.use(Buefy);

(async () => {

  // Page loading system
  let pageNames = ["home", "settings", "pixelart", "schematic"];
  await chillout.forEach(pageNames, async (pageName) => {
    'use strict';
    let pageElement = document.createElement("body");
    pageElement.innerHTML = await fetch(`/pages/${pageName}/index.html`).then(d => d.text());
    pageElement.querySelector("div").classList.add(`${pageName}-page`, "page");
    let pageScriptText = await fetch(`/pages/${pageName}/script.js`).then(d => d.text());
    let pageScript = {};
    try {
      pageScript = eval(`${pageScriptText}; componentScript`);
    } catch (err) {
      console.warn(`%c[PAGES]%c An error happen when trying load component script of the ${pageName} page.\n\n${err}`, "color:#F04747;", "color:#B9BBBE;");
    }
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
        path: "/pixelart",
        component: pageComponents.pixelart,
        name: "Pixel Art Generator",
      },
      {
        path: "/schematic",
        component: pageComponents.schematic,
        name: "Schematic Converter",
      }
    ],
  });

  window.app = new Vue({
    el: "#app",
    data() {
      return {
        title: "",
      }
    },
    mounted() {
      this.title = this.$route.name
    },
    watch: {
      title(data) {
        document.title = `Armagan's NBT App - ${data}`;
      },
      $route(data) {
        this.title = data.name;
      }
    },
    router
  });
  loading()
})();

function sleep(ms = 1000) { return new Promise(r => setTimeout(r, ms)) };