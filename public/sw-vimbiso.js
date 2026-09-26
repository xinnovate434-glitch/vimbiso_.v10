/* Vimbiso Web Push service worker */
self.addEventListener("push", (event) => {
  let data = { title: "Vimbiso Network", body: "New activity on the network", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/__grok/icon-180.png",
      badge: "/__grok/icon-180.png",
      data: { url: data.url || "/" },
      tag: data.tag || "vimbiso",
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && "focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});
