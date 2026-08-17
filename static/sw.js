/**
 * Service worker autodestrutivo.
 * O site já usou gatsby-plugin-offline, que deixou um service worker morando
 * no navegador de quem visitou e servindo versões velhas do site (e, no Safari,
 * às vezes quebrando a página inteira). Este arquivo substitui aquele worker no
 * mesmo endereço (/sw.js): na próxima visita o navegador troca pelo novo, que
 * se desinstala e recarrega a página direto do servidor. Sem handler de fetch,
 * nada mais é interceptado.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.registration
    .unregister()
    .then(() => self.clients.matchAll({ type: 'window' }))
    .then(clients => {
      clients.forEach(client => client.navigate(client.url));
    });
});
