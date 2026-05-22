/**
 * sw.js — paan.co.jp Service Worker (v35)
 *
 * v35 リライト: リソース別キャッシュ戦略
 *   1. プリキャッシュ: 全 9 HTML + 主要 asset (= 初回訪問時にバックグラウンド取得)
 *   2. HTML: network-first (= 常に最新、 ネットワーク失敗時のみキャッシュ)
 *   3. CSS/JS/JSON: stale-while-revalidate (= 即返却 + 裏で更新)
 *   4. 画像 / フォント: cache-first (= 一度取れば変わらない)
 *
 * 期待効果: ページ間遷移が即時 (= プリキャッシュ済み HTML を即時返却 → 体感ゼロ秒)
 *           それでいて HTML は network-first なので、 デプロイした変更は最大1回遅延で反映
 *
 * バージョン管理: CACHE_VERSION 更新で旧キャッシュは自動破棄
 */
const CACHE_VERSION = 'paan-v35-2';
const CACHE_NAME = `paan-cache-${CACHE_VERSION}`;

// ============================================
// プリキャッシュ対象 (= 初回訪問時に裏で取得)
// ============================================
const PRECACHE_URLS = [
  // 全 HTML (= 主要 6 + Legal 3、 約 270KB)
  '/',
  '/mission',
  '/brand',
  '/company',
  '/contact',
  '/message',
  '/privacy',
  '/terms',
  '/cookie',
  // CSS
  '/style.css',
  '/cookie-consent.css',
  // JS
  '/i18n.js',
  '/header-footer.js',
  '/paan-anim.js',
  '/cookie-consent.js',
  // 既定言語の翻訳
  '/i18n/ja.json',
  // hero 画像は preload で先読みされるので SW プリキャッシュからは外す (= 帯域競合回避)
];

// ============================================
// リソース別のキャッシュ戦略判定
// ============================================
function getStrategy(url) {
  const pathname = url.pathname;

  // HTML: network-first (= 常に最新を取りに行く、 失敗時のみキャッシュ)
  if (
    pathname === '/' ||
    pathname.endsWith('.html') ||
    /^\/(mission|brand|company|contact|message|privacy|terms|cookie)\/?$/.test(pathname) ||
    /^\/(en|zh-CN|zh-TW|ko|es|fr|de|it|vi|id|th)(\/|$)/.test(pathname)
  ) {
    return 'network-first';
  }

  // 画像 / フォント: cache-first (= 一度取れば不変)
  if (/\.(avif|webp|jpe?g|png|gif|svg|ico|woff2?|ttf|otf)$/i.test(pathname)) {
    return 'cache-first';
  }

  // CSS / JS / JSON: stale-while-revalidate (= 即返却 + 裏で更新)
  if (/\.(css|js|json)$/i.test(pathname)) {
    return 'stale-while-revalidate';
  }

  // デフォルト: stale-while-revalidate
  return 'stale-while-revalidate';
}

// ============================================
// install: プリキャッシュ
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // 個別 add で失敗を許容 (= 1個失敗しても他は入る)
        return Promise.all(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] precache skip:', url, err.message);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
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
// fetch: リソース別戦略
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // GET のみ対応
  if (request.method !== 'GET') return;

  // 同一オリジンのみ (= 外部リソースは素通し)
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // chrome-extension 等のスキームは素通し
  if (!url.protocol.startsWith('http')) return;

  const strategy = getStrategy(url);

  if (strategy === 'network-first') {
    event.respondWith(networkFirst(request));
  } else if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// ============================================
// 戦略: network-first (HTML 用)
// ネットワークを優先、 失敗時のみキャッシュ
// ============================================
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // ネットワーク失敗 → キャッシュにフォールバック
    const cached = await cache.match(request);
    if (cached) return cached;
    // それも無ければ、 / にフォールバック (= オフライン基本ページ)
    const fallback = await cache.match('/');
    if (fallback) return fallback;
    throw err;
  }
}

// ============================================
// 戦略: cache-first (画像・フォント用)
// キャッシュがあれば即返却、 無ければ取得してキャッシュ
// ============================================
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return cached || Response.error();
  }
}

// ============================================
// 戦略: stale-while-revalidate (CSS/JS/JSON 用)
// キャッシュを即返却、 裏で最新取得して次回に備える
// ============================================
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}
