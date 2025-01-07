// Custom service worker for handling share target
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("share-target")) {
    event.respondWith(Response.redirect("/?action=new"));
    event.waitUntil(
      (async () => {
        const formData = await event.request.formData();
        const text = formData.get("description") || formData.get("title");
        if (text) {
          // Store shared text to be picked up when app opens
          await self.clients.matchAll().then((clients) => {
            clients.forEach((client) =>
              client.postMessage({
                type: "SHARED_CONTENT",
                text,
              })
            );
          });
        }
      })()
    );
  }
});
