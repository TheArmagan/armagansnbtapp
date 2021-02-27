const { ipcRenderer } = require("electron");

let router;
let app;


(async () => {
  let homePage = await getHomePage();
  let settingsPage = await getSettingsPage();

  router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
      {
        path: "/",
        component: homePage.component,
        name: homePage.name,
      },
      {
        path: "/settings",
        component: settingsPage.component,
        name: settingsPage.name,
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
      },
    ],
  });

  app = Vue.createApp({
    data() {
      return {
        title: document.title,
      };
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
  });

  app.use(router);
  app.mount("#app");
})();
