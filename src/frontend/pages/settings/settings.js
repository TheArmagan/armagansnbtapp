async function getSettingsPage() {
  if (!window.hasOwnProperty("SettingsPage")) {
    window.SettingsPage = {
      name: "Settings",
      component: {
        template: await fetch("/pages/settings/settings.html").then(d => d.text()),
        data() {
          return {
            clicks: 0
          }
        }
      }
    }
  }

  return window.SettingsPage;
}

