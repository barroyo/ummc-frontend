'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "b444891081f7bd946c064e7a10c2322a",
"icon.png": "5732bc9a0d0ec1944fae55bd835ba947",
"index.html": "c6134a28123904beb9069f21945d0176",
"/": "c6134a28123904beb9069f21945d0176",
"verification.html": "47cdf7cc4ab9b1e428a7a1035b5627df",
"firebase-messaging-sw.js": "d6c4e6ba766a9cc188d27bb7e4f96445",
"main.dart.js": "e76395166ad92d440844bac418cc5792",
"favicon.png": "0fe38434e2598b61d489824b6e69896b",
"icons/Icon-192.png": "5732bc9a0d0ec1944fae55bd835ba947",
"icons/Icon-maskable-192.png": "5732bc9a0d0ec1944fae55bd835ba947",
"icons/Icon-maskable-512.png": "5732bc9a0d0ec1944fae55bd835ba947",
"icons/Icon-512.png": "5732bc9a0d0ec1944fae55bd835ba947",
"manifest.json": "58775449cd0a8712810bcd19269d8803",
"Archive.zip": "068bebf5f94f2eba0c0889dbee87ee0a",
"assets/AssetManifest.json": "89fc1214d965a4c888d77947edc89d36",
"assets/NOTICES": "2da3075e73bebcab484548fc616b228f",
"assets/FontManifest.json": "2fe33702e0094d596583a78378983811",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/wakelock_web/assets/no_sleep.js": "7748a45cd593f33280669b29c2c8919a",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/images/learn_more_item.png": "5744989057c25c1ae3237fe09df0b8fe",
"assets/assets/images/getting_tested_item.png": "7c222df70b5b9c8db2e857e98cd29934",
"assets/assets/images/logo_splash.svg": "2d145c6f42a64d7039000accd307f52b",
"assets/assets/images/coordinator.png": "775c410be9c8c11af7141caeb62ad8e7",
"assets/assets/images/icon.png": "5732bc9a0d0ec1944fae55bd835ba947",
"assets/assets/images/ummc_logos.jpg": "ec9e16635c36fef1c5bfd3b19cb9d352",
"assets/assets/images/prep_item.png": "d3064bae445f1d46b825e201d6319463",
"assets/assets/images/logo_splash.png": "5b25f048e71a028c3d654e827245183f",
"assets/assets/images/logo_app_bar.svg": "92c29ff4a7701459e1542371a4cc3aeb",
"assets/assets/images/logo_splash1.svg": "c4f11fd6c53d5826b124c1e39587efba",
"assets/assets/images/ummc_full_logo.jpg": "d0e8303740c950a996d5f7204b025531",
"assets/assets/images/ummc_loot_v2.jpg": "2cbb9b56101b7559ffefe4876213447e",
"assets/assets/images/ummc_logos_300.jpg": "9cf9cc5594a274b7afb8839cdbed0800",
"assets/assets/images/logo_app_bar2.svg": "4547112ed318af59df3347c04e787514",
"assets/assets/images/treatment_item.png": "ffcf3cb8c23a6131a32914e38f49e49b",
"assets/assets/fonts/montserrat/Montserrat-SemiBold.ttf": "7ffeec2b4edb434d393875ffbe633c30"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
