let cacheWorks = "v1";

const cacheFiles = [
    '/',
    './css/style.css',
    './js/idb.js',
    './js/main.js',
    './index.html',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
    'https://free.currencyconverterapi.com/api/v5/countries',
    'https://free.currencyconverterapi.com/api/v5/convert?q=${from}_${to}&compact=ultra'

];




self.addEventListener('install', event => {
    console.log("[serviceWorker] Installed");

    event.waitUntil(
        caches.open(cacheWorks)
        .then(cache => {
            console.log("SERVICEWORKER is now caching links and other resources");
            return cache.addAll(cacheFiles);
        })
    );
});


self.addEventListener('fetch', event => {
    // console.log("fetching", event.request.url);
    const url = 'https://free.currencyconverterapi.com/api/v5/countries';

    if (event.request.url === url) {

        event.respondWith(

            caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log(" Serviceworker is Alive!!!...in ere", event.request.url);
                    return response;
                }
                let requestClone = event.request.clone();

                fetch(requestClone)
                    .then(response => {
                        if (!response) {
                            console.log(" Serviceworker is not responding...in ere");
                            return response;
                        }

                        let responseClone = response.clone();

                        caches.open(cacheWorks)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                                return response;
                            });
                    })
                    .catch(err => {
                        console.log("ServiceWorker: Error fetching and caching new files", err);
                    });
            })
        )
    }
});



self.addEventListener('activate', event => {
    console.log("[serviceWorker] Activated");
    event.waitUntil(
        caches.keys()
        .then(cacheWorks => {
            return Promise.all(cacheWorks.map(thisCacheName => {

                if (thisCacheName !== cacheWorks) {
                    return caches.delete(thisCacheName);
                }
            }));
        })
    );
});