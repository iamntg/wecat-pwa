var dataCacheName = 'wecatData-v1';
var cacheName = 'wecatPWA-alpha-1';
var filesToCache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/scripts/idb.js',
    '/scripts/menu.js',
    '/scripts/idb-keyval-min.js',
    '/styles/inline.css',
    '/styles/fonts/BreeSerif-Regular.otf',
    '/styles/fonts/OpenSans-Bold-webfont.eot',
    '/styles/fonts/OpenSans-Bold-webfont.svg',
    '/styles/fonts/OpenSans-Bold-webfont.ttf',
    '/styles/fonts/OpenSans-Bold-webfont.woff',
    '/styles/fonts/OpenSans-Light-webfont.eot',
    '/styles/fonts/OpenSans-Light-webfont.svg',
    '/styles/fonts/OpenSans-Light-webfont.ttf',
    '/styles/fonts/OpenSans-Light-webfont.woff',
    '/styles/fonts/OpenSans-Regular-webfont.eot',
    '/styles/fonts/OpenSans-Regular-webfont.svg',
    '/styles/fonts/OpenSans-Regular-webfont.ttf',
    '/styles/fonts/OpenSans-Regular-webfont.woff',
    '/styles/fonts/OpenSans-Semibold-webfont.eot',
    '/styles/fonts/OpenSans-Semibold-webfont.svg',
    '/styles/fonts/OpenSans-Semibold-webfont.ttf',
    '/styles/fonts/OpenSans-Semibold-webfont.woff',
    '/images/icons/icon-256x256.png',
    '/images/default_avatar.png',
    '/images/accountant.svg',
    '/images/chairman.svg',
    '/images/close-button-round.svg',
    '/images/donor-list.svg',
    '/images/filter-icon.svg',
    '/images/members.svg',
    '/images/news-feed.svg',
    '/images/pill.svg',
    '/images/pill2.svg',
    '/images/sort-icon.svg'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://wecat.herokuapp.com/users/getAll';
    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response) {
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        /*
         * The app is asking for app shell files. In this scenario the app uses the
         * "Cache, falling back to the network" offline strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
         */
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});
