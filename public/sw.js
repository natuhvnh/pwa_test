const staticCacheName = "site-static-v4"; // Use to storage files that not changes frequently. Change version everytime have any changes in code.
const dynamicCacheName = "site-dynamic-v5"; //Use to storage files that not frequently access by user to reduce storage size. Change version everytime have any changes in code
const assets = [
  "/",
  "/index.html",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/img/dish.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
  "/pages/fallback.html"
];
// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cach => {
    cach.keys().then(keys => {
      if (keys.length > size) {
        cach.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};
// install service worker
self.addEventListener("install", event => {
  // console.log("Install service worker");
  event.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log("caching assets");
      return cache.addAll(assets); // can caches to gbs depends on device free storage
    })
  );
});

// activate event
self.addEventListener("activate", event => {
  // console.log("Activate service worker");
  event.waitUntil(
    caches.keys().then(keys => {
      // console.log(keys);
      return Promise.all(
        keys
          .filter(key => key !== staticCacheName && key !== dynamicCacheName)
          .map(key => caches.delete(key))
      ); // delete every others cached assets version
    })
  );
});
// fetch event - get data from server. Server worker stand btw and cache data then send back to front-end (better speed + UX)
self.addEventListener("fetch", event => {
  // console.log("Fetch event", event);
  if (event.request.url.indexOf("firestore.googleapis.com") === -1) {
    event.respondWith(
      caches
        .match(event.request)
        .then(cacheRes => {
          return (
            cacheRes ||
            fetch(event.request).then(fetchRes => {
              // if file not in assets, get response from server then save in dynamic storage
              return caches.open(dynamicCacheName).then(cache => {
                cache.put(event.request.url, fetchRes.clone());
                limitCacheSize(dynamicCacheName, 5);
                return fetchRes;
              });
            })
          );
        })
        .catch(() => {
          if (event.request.url.indexOf(".html") > -1) {
            return caches.match("/pages/fallback.html"); // if offline, show fallback page
          }
        })
    );
  }
});
