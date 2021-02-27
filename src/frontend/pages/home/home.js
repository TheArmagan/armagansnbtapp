async function getHomePage() {
  if (!window.hasOwnProperty("HomePage")) {
    window.HomePage = {
      name: "Home",
      component: {
        template: await fetch("/pages/home/home.html").then(d => d.text()),
        data() {
          return {
            clicks: 0
          }
        }
      }
    }
  }

  return window.HomePage;
}

