const { ipcRenderer } = require("electron");

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: { template: "<div>Home</div>" },
      name: "Welcome",
    },
    {
      path: "/settings",
      component: { template: "<div>Settings</div>" },
      name: "Application Settings",
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

const app = Vue.createApp({
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
