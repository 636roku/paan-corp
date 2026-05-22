/**
 * PAAN Corporate Site i18n Helper
 * ====================================
 * 12言語対応 (ja/en/zh-CN/zh-TW/ko/es/fr/de/it/vi/id/th)
 *
 * 仕組み:
 *   - URL パス /{locale}/page.html で言語決定
 *   - 例: paan.co.jp/en/mission → 英語ミッションページ
 *   - 例: paan.co.jp/mission     → 日本語 (= ルート扱い、 デフォルト)
 *   - localStorage で前回選択を記憶
 *   - data-i18n 属性で自動翻訳適用
 */
(function () {
  'use strict';

  const SUPPORTED_LOCALES = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko', 'es', 'fr', 'de', 'it', 'vi', 'id', 'th'];
  const DEFAULT_LOCALE = 'ja';
  const LOCALE_STORAGE_KEY = 'paan_locale';

  const LOCALE_META = {
    'ja':    { flag: '🇯🇵', name: '日本語' },
    'en':    { flag: '🇬🇧', name: 'English' },
    'zh-CN': { flag: '🇨🇳', name: '简体中文' },
    'zh-TW': { flag: '🇹🇼', name: '繁體中文' },
    'ko':    { flag: '🇰🇷', name: '한국어' },
    'es':    { flag: '🇪🇸', name: 'Español' },
    'fr':    { flag: '🇫🇷', name: 'Français' },
    'de':    { flag: '🇩🇪', name: 'Deutsch' },
    'it':    { flag: '🇮🇹', name: 'Italiano' },
    'vi':    { flag: '🇻🇳', name: 'Tiếng Việt' },
    'id':    { flag: '🇮🇩', name: 'Indonesia' },
    'th':    { flag: '🇹🇭', name: 'ภาษาไทย' }
  };

  const state = {
    locale: DEFAULT_LOCALE,
    dict: null,
    ready: false
  };

  /** URL パスからロケールを抽出 */
  function getLocaleFromPath() {
    const path = window.location.pathname;
    const match = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(\/|$)/);
    if (match && SUPPORTED_LOCALES.includes(match[1])) {
      return match[1];
    }
    return null;
  }

  /** ブラウザ言語自動検出 */
  function detectBrowserLocale() {
    const browserLangs = navigator.languages || [navigator.language || 'ja'];
    for (const raw of browserLangs) {
      const lang = raw.toLowerCase();
      if (lang === 'zh-tw' || lang.startsWith('zh-tw') || lang === 'zh-hk' || lang.startsWith('zh-hk') || lang === 'zh-mo') return 'zh-TW';
      if (lang.startsWith('zh')) return 'zh-CN';
      const short = lang.split('-')[0];
      if (SUPPORTED_LOCALES.includes(short)) return short;
    }
    return DEFAULT_LOCALE;
  }

  /** ロケール決定 */
  function determineLocale() {
    // 1. URL パス優先
    const fromPath = getLocaleFromPath();
    if (fromPath) return fromPath;
    // 2. localStorage
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
    } catch (e) {}
    // 3. ブラウザ言語
    return detectBrowserLocale();
  }

  /** 辞書取得 */
  async function loadDict(locale) {
    const res = await fetch(`/i18n/${locale}.json`, { cache: 'default' });
    if (!res.ok) throw new Error(`Failed to load ${locale}.json`);
    return res.json();
  }

  /** ネスト対応の翻訳取得 */
  function t(key, params) {
    if (!state.dict) return key;
    const parts = key.split('.');
    let val = state.dict;
    for (const p of parts) {
      if (val && typeof val === 'object' && p in val) {
        val = val[p];
      } else {
        return key; // フォールバック: キー自体を返す
      }
    }
    if (typeof val !== 'string') return key;
    if (params) {
      Object.keys(params).forEach(k => {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
      });
    }
    return val;
  }

  /** v33.1: 翻訳文字列の sanitizer
   *  許可タグ: <br>, <wbr>, <strong>...</strong>, <p>...</p>, <span class="nobr">...</span> のみ
   *  他の HTMLタグ・属性は全てエンティティエスケープ
   *  狙い: XSS 防止しつつ、 i18n JSON で実際に使ってる組版タグは維持
   *
   *  v33 初版で <strong>, <p>, <span class="nobr"> をエスケープしてしまい、
   *  会社役員 bio やミッション本文等で生タグが表示される事故が発生したため拡張。
   *
   *  なぜホワイトリスト方式 (= ブラウザの DOMParser や DOMPurify を使わない):
   *  - 外部ライブラリを追加せず軽量に保つ
   *  - i18n JSON の中身は我々がコントロール下に置く前提、 タグ集合は有限
   *  - 将来クラウドソース翻訳 / CMS 連携時の防御を維持
   */
  function sanitizeI18n(str) {
    if (typeof str !== 'string') return str;
    // ステップ1: &, <, > のみエスケープ (= タグ外の "/' は無害なので触らない、
    //   17キーで仏伊文中の "/' が &#39; / &quot; に化けて見苦しかったため)
    const escaped = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // ステップ2: 許可タグのみエスケープ解除
    return escaped
      // 自己閉じタグ: <br>, <br/>, <br />, <wbr>, <wbr/>, <wbr />
      .replace(/&lt;(br|wbr)\s*\/?&gt;/gi, '<$1>')
      // 開始タグ + 閉じタグ (属性なし): <strong>, </strong>, <p>, </p>
      .replace(/&lt;(\/?)(strong|p)&gt;/gi, '<$1$2>')
      // 改行禁止用 span: <span class="nobr">...</span> のみ厳格に許可
      // " はステップ1でエスケープしてないので、 そのまま class="nobr" でマッチ
      .replace(/&lt;span class="nobr"&gt;/g, '<span class="nobr">')
      .replace(/&lt;\/span&gt;/g, '</span>');
  }

  /** data-i18n 属性付き要素を一括翻訳 */
  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = t(key);
      if (translated !== key) {
        // v33: sanitize して <br>/<wbr> のみ許可、 他はエスケープ
        el.innerHTML = sanitizeI18n(translated);
      }
    });
    // data-i18n-attr (= 属性翻訳: 例 data-i18n-attr="title:tooltip.help")
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) {
          const translated = t(key);
          // 属性は textContent 相当なので、 setAttribute だけで安全 (= タグ展開されない)
          if (translated !== key) el.setAttribute(attr, translated);
        }
      });
    });
    // <html lang> 同期
    document.documentElement.setAttribute('lang', state.locale);
    // og:image を言語別に切替
    const ogImageEl = document.querySelector('meta[property="og:image"]');
    if (ogImageEl) {
      ogImageEl.setAttribute('content', `https://www.paan.co.jp/og/og-${state.locale}.png`);
    }
    const twImageEl = document.querySelector('meta[name="twitter:image"]');
    if (twImageEl) {
      twImageEl.setAttribute('content', `https://www.paan.co.jp/og/og-${state.locale}.png`);
    }
    // og:locale 同期 (= zh-CN → zh_CN 等の正規化)
    const ogLocaleMap = {
      'ja': 'ja_JP', 'en': 'en_GB', 'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW',
      'ko': 'ko_KR', 'es': 'es_ES', 'fr': 'fr_FR', 'de': 'de_DE',
      'it': 'it_IT', 'vi': 'vi_VN', 'id': 'id_ID', 'th': 'th_TH'
    };
    const ogLocaleEl = document.querySelector('meta[property="og:locale"]');
    if (ogLocaleEl) {
      ogLocaleEl.setAttribute('content', ogLocaleMap[state.locale] || 'ja_JP');
    }

    // v32: legal 文書の翻訳予告バナー制御
    // ja 以外のロケールで /privacy, /terms, /cookie を開いた時、 上部に予告を表示
    // (= 現状 noindex の Draft 状態。 由井GCレビュー後に多言語翻訳予定)
    const translationNotice = document.querySelector('.legal-translation-notice');
    if (translationNotice) {
      if (state.locale !== DEFAULT_LOCALE) {
        translationNotice.classList.add('is-visible');
      } else {
        translationNotice.classList.remove('is-visible');
      }
    }
  }

  /** ロケール切替 (= URL書き換え + リロード) */
  async function setLocale(newLocale) {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    try { localStorage.setItem(LOCALE_STORAGE_KEY, newLocale); } catch (e) {}

    // 現在の URL からロケール部分を除去
    let path = window.location.pathname;
    const m = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(\/.*|$)/);
    if (m && SUPPORTED_LOCALES.includes(m[1])) {
      path = m[2] || '/';
    }
    if (!path.startsWith('/')) path = '/' + path;

    // 新しいロケールを prefix (= ja の場合は prefix なし、 ルート扱い)
    let newPath;
    if (newLocale === DEFAULT_LOCALE) {
      newPath = path;
    } else {
      newPath = `/${newLocale}${path}`;
    }
    window.location.href = newPath + window.location.search + window.location.hash;
  }

  /** 初期化 */
  async function init() {
    state.locale = determineLocale();
    try {
      state.dict = await loadDict(state.locale);
    } catch (e) {
      console.error('[i18n] Failed to load dict, falling back to ja:', e);
      state.locale = DEFAULT_LOCALE;
      try { state.dict = await loadDict(DEFAULT_LOCALE); } catch (e2) {}
    }
    state.ready = true;
    applyToDOM();
    // ready イベント発火
    window.dispatchEvent(new CustomEvent('paan:i18n:ready'));
  }

  // グローバル公開
  window.PAAN = window.PAAN || {};
  window.PAAN.i18n = {
    init,
    t,
    applyToDOM,
    setLocale,
    getLocale: () => state.locale,
    getSupportedLocales: () => SUPPORTED_LOCALES.slice(),
    LOCALE_META,
    isReady: () => state.ready
  };

  // DOMContentLoaded で自動初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
