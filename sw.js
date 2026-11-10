// 오프라인 캐시. 게임 파일을 고치면 VERSION 숫자를 올려 주세요.
const VERSION = 'pm6-9f-v8';
// 장면 일러스트 목록은 story.js의 CGS에서 그대로 가져옵니다.
self.window = self;
importScripts('js/story.js');
const FILES = ['./', 'index.html', 'css/style.css', 'js/art.js', 'js/story.js', 'js/engine.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'img/title.webp',
  ...['seoa', 'doyun', 'junho', 'yujin', 'harin'].flatMap(id =>
    [`img/${id}.webp`, `img/${id}_pt.webp`, `img/${id}_casual.webp`, `img/${id}_work.webp`, `img/${id}_love.webp`]),
  ...Object.keys(self.CGS || {}).map(id => `img/cg/${id}.webp`)];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
