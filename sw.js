// HSK word wall v1.5.0
const C = 'hskwall-v9';
const ASSETS = ['./', './index.html', './manifest.json', './class-data.js', './hanzi-writer.min.js', './strokes-data.js', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(cs => { const c = cs.find(x => 'focus' in x); return c ? c.focus() : clients.openWindow('./'); }));
});
self.addEventListener('periodicsync', e => {
  if (e.tag !== 'hsk-reminder') return;
  e.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(cs => {
    if (!cs.length) return;
    return new Promise(res => { const ch = new MessageChannel(); ch.port1.onmessage = ev => res(ev.data); cs[0].postMessage('goal-state', [ch.port2]); setTimeout(() => res(null), 3000); })
      .then(st => {
        if (!st || !st.on || st.today >= st.goal) return;
        const now = new Date(), [h, m] = st.time.split(':').map(Number); const due = new Date(); due.setHours(h, m, 0, 0);
        const key = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
        if (now < due || st.last === key) return;
        return self.registration.showNotification('词汇墙 · daily goal', {body: (st.goal - st.today) + " more to reach today's goal. Tap to practice.", icon: 'icon-192.png', tag: 'hsk-goal'});
      });
  }));
});
