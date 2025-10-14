/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
const self = globalThis;

const CACHE_NAME = 'dnd-api-v1';
const API_BASE = 'https://api.open5e.com/';

/** @type {FetchEvent} */
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	if (!url.href.startsWith(API_BASE)) {
		return;
	}

	event.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(event.request).then((cached) => {
				if (cached) {
					return cached;
				}

				return fetch(event.request).then((response) => {
					cache.put(event.request, response.clone());
					return response;
				});
			});
		})
	);
});

/** @type {ExtendableEvent} */
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((names) => {
			return Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
		})
	);
});
