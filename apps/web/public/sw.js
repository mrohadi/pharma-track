self.addEventListener('push', (event) => {
  let data = { title: 'PharmaTrack', body: 'You have a new notification.' };
  try {
    data = event.data.json();
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'pharmatrack',
      renotify: true,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/d') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/d');
    }),
  );
});
