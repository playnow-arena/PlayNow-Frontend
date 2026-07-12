const CACHE_NAME = 'playnow-pwa-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/logo.png',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];
let firebaseMessagingInitialized = false;

const initFirebaseMessaging = (firebaseConfig) => {
  if (firebaseMessagingInitialized || !firebaseConfig?.apiKey) return;

  try {
    importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');

    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      // If the payload already has a notification property, Firebase might have already shown it
      // or will show it. Only show a custom one if it's a data-only message.
      if (payload.notification) return;

      const title = payload.data?.title || 'PlayNow';
      const options = {
        body: payload.data?.body || 'You have a new PlayNow notification.',
        icon: payload.data?.icon || '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        data: {
          url: payload.data?.url || '/',
          ...payload.data,
        },
      };

      self.registration.showNotification(title, options);
    });

    firebaseMessagingInitialized = true;
  } catch (error) {
    console.error('[PlayNow SW] Firebase messaging init failed:', error);
  }
};

self.addEventListener('message', (event) => {
  if (event.data?.type === 'PLAYNOW_FIREBASE_CONFIG') {
    initFirebaseMessaging(event.data.firebaseConfig);
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return cache.match('/offline.html');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existingClient = clientList.find(client => client.url.includes(self.location.origin));
      if (existingClient) {
        existingClient.focus();
        existingClient.navigate(targetUrl);
        return;
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
