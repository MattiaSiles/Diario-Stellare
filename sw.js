const CACHE_NAME = 'diario-stellare-v1';

// Questa è la lista delle cose da "scaricare" per far funzionare l'app offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/musica.mp3',   // Sostituisci o aggiungi altri nomi se la musica si chiama diversamente
  '/icon-192.png'  // Assicurati che l'icona si chiami così
];

// 1. INSTALLAZIONE: Il maggiordomo scarica i file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('🌌 SW: Salvataggio dei file base per l\'offline...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 2. ATTIVAZIONE: Pulisce vecchie versioni se aggiorni l'app
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// 3. INTERCETTAZIONE: Se sei offline, ti dà i file salvati
self.addEventListener('fetch', event => {
  // Ignora le chiamate al database di Firebase (se ne occupa la sua persistenza interna)
  if (event.request.url.includes('firestore.googleapis.com')) {
      return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se trova il file in memoria te lo dà, altrimenti lo chiede a internet
        return response || fetch(event.request);
      })
  );
});