

(() => {
  window.NOTIFY = {};
  const notificationsElement = document.createElement("div");
  notificationsElement.classList.add("notifications");
  document.body.appendChild(notificationsElement);

  window.NOTIFY.show = (html = "", duration = 5000, classesToAdd = ["is-primary"]) => {
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