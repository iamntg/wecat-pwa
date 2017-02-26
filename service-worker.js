var dataCacheName = 'wecatData-v3';
var cacheName = 'wecatPWA-alpha-3';
var filesToCache = [
    '/',
    '/index.html',
    './manifest.json',
    '/scripts/app.js',
    '/scripts/idb.js',
    '/scripts/menu.js',
    '/scripts/offline.js',
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

/*
  INSTALL EVENT: Adding `install` event listener.
*/

self.addEventListener('install', function(e) {
    console.info('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.info('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache).then(function() {
                    console.info('All files are cached');
                    return self.skipWaiting(); //To forces the waiting service worker to become the active service worker
                })
                .catch(function(error) {
                    console.error('Failed to cache', error);
                });
        })
    );
});

/*
  ACTIVATE EVENT: triggered once after registering, also used to clean up caches.
*/

self.addEventListener('activate', function(e) {
    console.info('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.info('[ServiceWorker] Removing old cache', key);
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


/*
  FETCH EVENT: triggered for every request made by index page, after install.
*/

//Adding `fetch` event listener
self.addEventListener('fetch', function(event) {
    console.info('[ServiceWorker] Fetch');
    var request = event.request;
    //Tell the browser to wait for newtwork request and respond with below
    event.respondWith(
        //If request is already in cache, return it
        caches.match(request).then(function(response) {
            if (response) {
                return response;
            }

            //if request is not cached, add it to cache
            return fetch(request).then(function(response) {
                var responseToCache = response.clone();
                caches.open(cacheName).then(
                    function(cache) {
                        cache.put(request, responseToCache).catch(function(err) {
                            console.warn(request.url + ': ' + err.message);
                        });
                    });

                return response;
            });
        })
    );
});

