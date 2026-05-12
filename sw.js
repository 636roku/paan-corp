/**
 * sw.js — paan.co.jp Service Worker (v30.33)
 *
 * 戦略: stale-while-revalidate (= 即返却 + 裏で最新取得)
 * 効果: 2回目以降の訪問はオフラインでも瞬時に表示、 3G環境では特に効果大
 *
 * バージョン管理: CACHE_VERSION を更新すれば旧キャッシュは自動破棄
 */
const CACHE_VERSION = 'paan-v34-1';
const CACHE_NAME = `paan-cache-${CACHE_VERSION}`;

// プリキャッシュ対象 (= 初回訪問時に取得しておきたいもの)
const PRECACHE_URLS = [
  '/',
  '/style.css',
  '/i18n.js',
  '/header-footer.js',
  '/paan-anim.js',
  '/cookie-consent.js',
  '/i18n/ja.json',
  // hero画像はpreloadで先読みされるので SW プリキャッシュからは外す (= 帯域競合回避)
];

// ============================================
// install: プリキャッシュ
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] precache failed:', err))
  );
});

// ============================================
// activate: 旧キャッシュ削除
// ============================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name.startsWith('paan-cache-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================
// fetch: stale-while-revalidate
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GETのみ対応 (= POST/PUT 等は素通し)
  if (request.method !== 'GET') return;

  // 同一オリジンのみ (= 外部リソースは素通し)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // chrome-extension 等のスキームは素通し
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            // 成功レスポンスのみキャッシュ更新
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached); // ネットワークエラー時はキャッシュにフォールバック

        // キャッシュがあれば即返却、 裏で最新取得 (= stale-while-revalidate)
        return cached || fetchPromise;
      })
    )
  );
});
