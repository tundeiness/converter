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
    // const url = 'https://free.currencyconverterapi.com/api/v5/countries';

    let requestUrl = new URL(event.request.url);

    if (requestUrl.origin === location.origin) {
        if (requestUrl.pathname === '/') {
            event.respondWith(caches.match('/index.html'));
            return;
        }

        event.respondWith(
            caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log(" Serviceworker is Alive!!!...in ere", event.request.url);
                    return response || fetch(event.request);
                }

                let requestClone = event.request.clone();
                return fetch(requestClone)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            console.log(" serviceworker is not responding...in ere");
                            return response;
                        }

                        let responseToCache = response.clone();

                        caches.open(cacheWorks)
                            .then(cache => {
                                cache.put(event.request, responseToCache);

                            });
                        return response;
                    })
                    .catch(err => {
                        console.log("ServiceWorker: Error fetching and caching new files", err);
                    });
            })
        );

    }








    /*  if (event.request.url === url) {

         event.respondWith(

             caches.match(event.request)
             .then(response => {
                 if (response) {
                   //  console.log(" Serviceworker is Alive!!!...in ere", event.request.url);
                     return response;
                 }
                 let requestClone = event.request.clone();

                 return fetch(requestClone)
                     .then(response => {
                         if (!response || response.status !== 200 || response.type !== 'basic') {
                             console.log(" Serviceworker is not responding...in ere");
                             return response;
                         }

                         let responseToCache = response.clone();

                         caches.open(cacheWorks)
                             .then(cache => {
                                 cache.put(event.request, responseToCache);

                             });
                         return response;
                     })
                     .catch(err => {
                         console.log("ServiceWorker: Error fetching and caching new files", err);
                     });
             })
         )
     } */
});



self.addEventListener('activate', event => {
    console.log("[serviceWorker] Activated");
    event.waitUntil(
        caches.keys()
        .then(cacheWorks => {
            return Promise.all(cacheWorks.map(thisCacheName => {

                if (thisCacheName.indexOf(cacheWorks) === -1) {
                    return caches.delete(thisCacheName);
                }
            }));
        })
    );
});

/* if (thisCacheName !== cacheWorks) {
    return caches.delete(thisCacheName);
} */