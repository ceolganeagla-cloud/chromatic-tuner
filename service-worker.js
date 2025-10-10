// Minimal service worker so the app can be installed on phones.
// Extend with caching later if you want offline support.
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
