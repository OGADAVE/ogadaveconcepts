/* =====================================================
   OGA DAVE CONCEPTS — Service Worker
   Production Ready Version
===================================================== */

const APP_VERSION = "v1.0.1";

const STATIC_CACHE = `ogadave-static-${APP_VERSION}`;
const DYNAMIC_CACHE = `ogadave-dynamic-${APP_VERSION}`;

/* Assets to cache during install */
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/cryptopreneur.html",
  "/real-estate.html",
  "/techpreneur.html",
  "/airdrop.html",
  "/blog-detail.html",
  "/learn.html"
];

/* =====================================================
   INSTALL
===================================================== */
self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err =>
        console.warn("[SW] Install cache failed:", err)
      )
  );
});

/* =====================================================
   ACTIVATE
===================================================== */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(
            key =>
              key !== STATIC_CACHE &&
              key !== DYNAMIC_CACHE
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* =====================================================
   FETCH
===================================================== */
self.addEventListener("fetch", event => {

  const request = event.request;

  /* Ignore unsupported requests */
  if (
    request.method !== "GET" ||
    !request.url.startsWith("http")
  ) {
    return;
  }

  const url = new URL(request.url);

  /* Always network-first for APIs */
  const networkOnlyDomains = [
    "firestore.googleapis.com",
    "firebase",
    "api.coingecko.com",
    "api.cloudinary.com",
    "emailjs.com",
    "formspree.io",
    "calendly.com"
  ];

  if (
    networkOnlyDomains.some(domain =>
      url.hostname.includes(domain)
    )
  ) {
    event.respondWith(fetch(request));
    return;
  }

  /* HTML pages */
  if (request.mode === "navigate") {

    event.respondWith(
      fetch(request)
        .then(response => {

          const clone = response.clone();

          caches
            .open(DYNAMIC_CACHE)
            .then(cache =>
              cache.put(request, clone)
            );

          return response;
        })
        .catch(async () => {

          const cached =
            await caches.match(request);

          return (
            cached ||
            caches.match("/index.html")
          );
        })
    );

    return;
  }

  /* Cache-first for static assets */
  event.respondWith(

    caches.match(request).then(cached => {

      const networkFetch = fetch(request)
        .then(response => {

          if (response.ok) {

            const clone =
              response.clone();

            caches
              .open(DYNAMIC_CACHE)
              .then(cache =>
                cache.put(request, clone)
              )
              .catch(err =>
                console.warn(
                  "[SW] Cache put failed:",
                  err
                )
              );
          }

          return response;
        })
        .catch(() => null);

      return cached || networkFetch;
    })

  );

});

/* =====================================================
   PUSH NOTIFICATIONS
===================================================== */
self.addEventListener("push", event => {

  let data = {
    title: "OGA DAVE CONCEPTS",
    body: "You have a new update.",
    icon: "/images/logo.jpg",
    badge: "/images/logo.jpg",
    tag: "ogadave-update",
    url: "/"
  };

  try {
    if (event.data) {
      data = {
        ...data,
        ...event.data.json()
      };
    }
  } catch (err) {
    console.warn(
      "[SW] Push data parse failed:",
      err
    );
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        data: {
          url: data.url
        },
        vibrate: [200, 100, 200],
        actions: [
          {
            action: "open",
            title: "Open"
          },
          {
            action: "dismiss",
            title: "Dismiss"
          }
        ]
      }
    )
  );

});

/* =====================================================
   NOTIFICATION CLICK
===================================================== */
self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    if (
      event.action === "dismiss"
    ) {
      return;
    }

    const targetUrl =
      event.notification.data?.url ||
      "/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true
        })
        .then(clientList => {

          for (const client of clientList) {

            if (
              client.url === targetUrl &&
              "focus" in client
            ) {
              return client.focus();
            }
          }

          if (clients.openWindow) {
            return clients.openWindow(
              targetUrl
            );
          }
        })
    );

  }
);

/* =====================================================
   BACKGROUND SYNC
===================================================== */
self.addEventListener("sync", event => {

  if (
    event.tag === "sync-newsletter"
  ) {
    event.waitUntil(
      syncPendingForms("newsletter")
    );
  }

  if (
    event.tag === "sync-property-alert"
  ) {
    event.waitUntil(
      syncPendingForms("propertyAlert")
    );
  }

});

async function syncPendingForms(type) {

  try {

    const cache =
      await caches.open(
        "pending-forms"
      );

    const requests =
      await cache.keys();

    await Promise.all(
      requests
        .filter(request =>
          request.url.includes(type)
        )
        .map(async request => {

          const response =
            await fetch(request);

          if (response.ok) {
            await cache.delete(
              request
            );
          }

        })
    );

  } catch (err) {

    console.warn(
      "[SW] Background sync failed:",
      err
    );

  }

}