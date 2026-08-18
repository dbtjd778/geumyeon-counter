// 오프라인에서도 열리게 하는 서비스 워커.
//
// HTML/JS/CSS는 '네트워크 우선'이다. 캐시 우선으로 두면 파일을 고쳐 배포해도
// 사용자가 두 번 새로고침해야 새 화면을 보게 되기 때문. 인터넷이 없을 때만
// 캐시로 떨어진다. 아이콘처럼 잘 안 바뀌는 파일은 캐시 우선을 유지한다.
const CACHE = 'qs-20260818f';

const ASSETS = [
  './',
  './index.html',
  './guide.html',
  './harms.html',
  './recovery.html',
  './withdrawal.html',
  './guide-drink.html',
  './alcohol-harms.html',
  './alcohol-benefits.html',
  './alcohol-refusal.html',
  './weight.html',
  './ecig.html',
  './nrt.html',
  './clinic.html',
  './pregnancy.html',
  './hangover.html',
  './alcohol-medicine.html',
  './solo-drinking.html',
  './alcohol-weight.html',
  './tools.html',
  './tools.js',
  './test.html',
  './test.js',
  './test-smoke.html',
  './test-smoke.js',
  './install.html',
  './404.html',
  './about.html',
  './privacy.html',
  './contact.html',
  './style.css',
  './app.js',
  './config.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
];

// 새 버전이 나왔는지 매번 확인해야 하는 것들
const FRESH_DESTINATIONS = ['document', 'script', 'style'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // 폰트 CDN 같은 외부 요청은 브라우저에 맡긴다 (opaque 응답을 캐시하면 손해)
  if (new URL(req.url).origin !== location.origin) return;

  const wantsFresh = req.mode === 'navigate' || FRESH_DESTINATIONS.includes(req.destination);

  if (wantsFresh) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => { /* 무시 */ });
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true })
            .then((hit) => hit || caches.match('./index.html'))
        )
    );
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreSearch: true })
      .then((hit) => hit || fetch(req))
  );
});












