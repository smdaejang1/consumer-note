// 소비자 관리 노트 서비스워커
// 버전을 바꾸면 캐시가 갱신됩니다
const CACHE_NAME = 'consumer-note-v20';
const FILES = [
  './consumer-note.html',
  './consumer-note-sw.js'
];

// 설치: 파일 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

// 활성화: 이전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// fetch: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// 업데이트 메시지 수신
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
