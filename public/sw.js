// Service Worker for Sound Shepherd PWA Web Push Notifications & Badging
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Intercept push events
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }
  
  const title = data.title || 'Sound Shepherd';
  const options = {
    body: data.body || 'New sound engine update available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: data.url || '/'
  };
  
  // Handle App Badge count (Red number on app icon)
  if ('setAppBadge' in navigator) {
    const badgeCount = parseInt(data.badgeCount || '1', 10);
    navigator.setAppBadge(badgeCount).catch(err => console.error("Error setting app badge:", err));
  }
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click (Clear badge count and open/focus app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Clear App Badge when notification is clicked
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge().catch(err => console.error("Error clearing app badge:", err));
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data || '/');
      }
    })
  );
});
