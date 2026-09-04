// Service worker mínimo — apenas para satisfazer o critério de instalabilidade do navegador.
// Não faz cache nem armazena nada; toda análise acontece localmente no próprio index.html.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
