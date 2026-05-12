/**
 * cookie-consent.js (v33)
 *
 * 機能:
 *   - 初回訪問時にバナー表示、 「必須のみ」 「全て許可」 の2択
 *   - 選択結果は localStorage に保存、 以降は非表示
 *   - cookie.html 内に「設定を変更する」 リンクを提供 → クリックで再表示
 *   - 12言語の i18n キー (cookie_banner.*) と連携
 *   - GDPR / ePrivacy ライト準拠 (= シンプル1段階、 Settings 階層なし)
 *
 * 連携:
 *   - i18n.js: cookie_banner.* キーを読む
 *   - 同意状態は window.PAAN.cookieConsent.get() で取得可能
 *     → 将来 GA4 等を入れる際は、 get() === 'all' で起動判定する
 *
 * localStorage キー:
 *   paan_cookie_consent: 'all' | 'essential'
 *
 * 注意: i18n.js より後にロード、 i18n ready を待ってから描画
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'paan_cookie_consent';
  const VALID_VALUES = ['all', 'essential'];

  // ----- 状態取得・保存 -----
  function getConsent() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return VALID_VALUES.includes(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    if (!VALID_VALUES.includes(value)) return;
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
    // 同意イベント発火 (= 将来 GA4 等が listen できるように)
    window.dispatchEvent(new CustomEvent('paan:cookie-consent', { detail: { value: value } }));
  }

  function clearConsent() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // ----- i18n ヘルパー -----
  function t(key) {
    if (window.PAAN && window.PAAN.i18n && window.PAAN.i18n.isReady && window.PAAN.i18n.isReady()) {
      const v = window.PAAN.i18n.t('cookie_banner.' + key);
      if (v && v !== 'cookie_banner.' + key) return v;
    }
    // フォールバック (= i18n 失敗時、 日本語で最低限の動作保証)
    const fallback = {
      title: 'Cookie の使用について',
      body: '本サイトでは、 サービス品質の改善のため Cookie を利用することがあります。',
      btn_essential: '必須のみ',
      btn_all: '全て許可',
      learn_more: 'クッキーポリシー',
    };
    return fallback[key] || '';
  }

  // ----- DOM 構築・表示 -----
  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'paan-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'paan-cookie-banner-title');
    banner.setAttribute('aria-describedby', 'paan-cookie-banner-body');

    const inner = document.createElement('div');
    inner.className = 'paan-cookie-banner-inner';

    const textWrap = document.createElement('div');
    textWrap.className = 'paan-cookie-banner-text';

    const title = document.createElement('div');
    title.className = 'paan-cookie-banner-title';
    title.id = 'paan-cookie-banner-title';
    title.textContent = t('title');

    const body = document.createElement('p');
    body.className = 'paan-cookie-banner-body';
    body.id = 'paan-cookie-banner-body';
    body.textContent = t('body');

    const policyLink = document.createElement('a');
    policyLink.className = 'paan-cookie-banner-policy';
    // クッキーポリシーへのリンク (= 現在のロケールに応じて prefix)
    const locale = (window.PAAN && window.PAAN.i18n && window.PAAN.i18n.getLocale) ? window.PAAN.i18n.getLocale() : 'ja';
    policyLink.href = (locale === 'ja') ? '/cookie' : '/' + locale + '/cookie';
    policyLink.textContent = t('learn_more');

    textWrap.appendChild(title);
    textWrap.appendChild(body);
    textWrap.appendChild(policyLink);

    const btnWrap = document.createElement('div');
    btnWrap.className = 'paan-cookie-banner-actions';

    const btnEssential = document.createElement('button');
    btnEssential.type = 'button';
    btnEssential.className = 'paan-cookie-banner-btn paan-cookie-banner-btn-secondary';
    btnEssential.textContent = t('btn_essential');
    btnEssential.addEventListener('click', () => {
      setConsent('essential');
      hideBanner(banner);
    });

    const btnAll = document.createElement('button');
    btnAll.type = 'button';
    btnAll.className = 'paan-cookie-banner-btn paan-cookie-banner-btn-primary';
    btnAll.textContent = t('btn_all');
    btnAll.addEventListener('click', () => {
      setConsent('all');
      hideBanner(banner);
    });

    btnWrap.appendChild(btnEssential);
    btnWrap.appendChild(btnAll);

    inner.appendChild(textWrap);
    inner.appendChild(btnWrap);
    banner.appendChild(inner);

    return banner;
  }

  function hideBanner(banner) {
    if (!banner) return;
    banner.classList.add('is-hiding');
    setTimeout(() => { banner.remove(); }, 300);
  }

  function showBanner() {
    // 既に出てるなら何もしない
    if (document.querySelector('.paan-cookie-banner')) return;
    const banner = buildBanner();
    document.body.appendChild(banner);
    // 次フレームで is-visible 付与してフェードイン
    requestAnimationFrame(() => requestAnimationFrame(() => {
      banner.classList.add('is-visible');
    }));
  }

  // ----- 「設定を変更する」 リンクハンドラ (= cookie.html 用) -----
  function attachResetLinks() {
    document.querySelectorAll('[data-cookie-reset]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        clearConsent();
        showBanner();
      });
    });
  }

  // ----- 初期化 -----
  function init() {
    attachResetLinks();
    // 既に同意済みなら何もしない
    if (getConsent() !== null) return;
    // i18n の準備を待つ (= 翻訳が当たった状態でバナーを出すため)
    if (window.PAAN && window.PAAN.i18n && window.PAAN.i18n.isReady && window.PAAN.i18n.isReady()) {
      showBanner();
    } else {
      window.addEventListener('paan:i18n:ready', () => {
        showBanner();
      }, { once: true });
      // セーフティ: 3秒経っても i18n が来なければフォールバックで表示
      setTimeout(() => {
        if (getConsent() === null && !document.querySelector('.paan-cookie-banner')) {
          showBanner();
        }
      }, 3000);
    }
  }

  // グローバル公開 (= 将来の GA4 等から判定可能に)
  window.PAAN = window.PAAN || {};
  window.PAAN.cookieConsent = {
    get: getConsent,
    set: setConsent,
    clear: clearConsent,
    show: showBanner,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
