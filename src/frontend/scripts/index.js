const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/settings", component: { template: "<div>Settings</div>" } },
    { path: "/generators/pixel-art", component: { template: "<div>Pixel Art</div>" } },
    { path: "/generators/schematic", component: { template: "<div>Schematic</div>" } }
  ]
})

const app = Vue.createApp({
  data() {
    return {}
  }
});

app.use(router);
app.mount("#app");