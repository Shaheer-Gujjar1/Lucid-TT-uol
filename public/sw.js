
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(self.clients.claim());
});


self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});

// HARDENED GA4: Bypass cache for analytics
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    if (url.match(/(google-analytics|analytics\.google|googletagmanager)/)) {
        // Force network request, bypassing SW cache for analytics
        event.respondWith(fetch(event.request));
        return;
    }
});
