// Service Worker for Sound Shepherd PWA Web Push Notifications, Offline Caching & Badging
const CACHE_NAME = 'sound-shepherd-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/og-image.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first with Cache fallback for navigation and static assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests or browser extension/Firebase API requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline Content Unavailable', { status: 503 });
        });
      })
  );
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
  
  // Handle App Badge count safely
  if ('setAppBadge' in navigator) {
    const badgeCount = parseInt(data.badgeCount || '1', 10);
    if (!isNaN(badgeCount) && badgeCount > 0) {
      navigator.setAppBadge(badgeCount).catch(err => console.warn("App badge not supported or ignored:", err));
    } else if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(err => console.warn("Clear app badge error:", err));
    }
  }
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
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
