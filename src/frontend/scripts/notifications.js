(() => {
  window.NOTIFY = {};

  const notificationStyleElement = document.createElement("style");
  notificationStyleElement.innerHTML = `.notifications{pointer-events:none;--animate-duration:0.5s;display:flex;flex-direction:column;justify-content:flex-start;align-items:flex-end;position:absolute;top:0;right:0;width:0;height:0;overflow:hidden}.notifications.full-size{width:100vw;height:100vh;padding:16px}.notifications .notification{margin-bottom:4px!important;display:inline-block;min-width:128px;max-width:256px;word-wrap:normal;word-break:normal;padding:6px}.notifications .notification .notification-content{margin-right:28px}`;
  document.body.appendChild(notificationStyleElement);

  const notificationsElement = document.createElement("div");
  notificationsElement.classList.add("notifications");
  document.body.appendChild(notificationsElement);

  window.NOTIFY.show = (html = "", duration = 5000, classesToAdd = []) => {
    let notificationElement = document.createElement("div");
    notificationElement.classList.add("notification", ...classesToAdd);
    let deleteButton = document.createElement("button");

    function _delete() {
      notificationElement.classList.add("animate__animated", "animate__fadeOut");
      setTimeout(() => {
        notificationElement.remove();
        updateSize();
      }, 500)
    }
    deleteButton.classList.add("delete");
    deleteButton.addEventListener("click", () => {
      _delete();
    });
    notificationElement.appendChild(deleteButton);
    let contentElement = document.createElement("div");
    contentElement.classList.add("notification-content");
    contentElement.innerHTML = html;
    notificationElement.appendChild(contentElement);
    notificationsElement.prepend(notificationElement);
    notificationElement.classList.add("animate__animated", "animate__fadeInRight");
    setTimeout(() => {
      notificationElement.classList.remove("animate__animated", "animate__fadeInRight");
    }, 500);
    setTimeout(() => {
      _delete();
    }, duration);
    updateSize();
  }

  function updateSize() {
    if (notificationsElement.childElementCount != 0) {
      notificationsElement.classList.add("full-size");
    } else {
      notificationsElement.classList.remove("full-size");
    }
  }

  window.NOTIFY.primary = (html = "", duration = 5000) => {
    window.NOTIFY.show(html, duration, ["is-primary"])
  };

  window.NOTIFY.info = (html = "", duration = 5000) => {
    window.NOTIFY.show(html, duration, ["is-info"])
  };

  window.NOTIFY.success = (html = "", duration = 5000) => {
    window.NOTIFY.show(html, duration, ["is-success"])
  };

  window.NOTIFY.warn = (html = "", duration = 5000) => {
    window.NOTIFY.show(html, duration, ["is-warning"])
  };

  window.NOTIFY.error = (html = "", duration = 5000) => {
    window.NOTIFY.show(html, duration, ["is-danger"])
  };
})();
