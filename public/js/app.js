// Check brower support service worker and register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(reg => console.log("Service worker", reg))
    .catch(err => console.log("Not servicce", err));
}
