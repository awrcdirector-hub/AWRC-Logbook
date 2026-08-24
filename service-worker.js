self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (error) {
      payload = { title: "Outing Logbook alert", message: event.data.text() };
    }
  }

  const title = payload.title || "Outing Logbook alert";
  const options = {
    body: payload.message || payload.body || "Open Outing Logbook for details.",
    icon: "/logbook-icon-v6.png",
    badge: "/logbook-icon-v6.png",
    tag: payload.tag || payload.key || payload.id || "water-log-alert",
    data: payload.url || "./",
    requireInteraction: Boolean(payload.requireInteraction)
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow("./");
    })
  );
});
