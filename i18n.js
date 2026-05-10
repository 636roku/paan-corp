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
    'id':    { flag: '🇮🇩', name: 'Bahasa Indonesia' },
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

  /** data-i18n 属性付き要素を一括翻訳 */
  function applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = t(key);
      if (translated !== key) {
        el.innerHTML = translated;
      }
    });
    // data-i18n-attr (= 属性翻訳: 例 data-i18n-attr="title:tooltip.help")
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const spec = el.getAttribute('data-i18n-attr');
      spec.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && key) {
          const translated = t(key);
          if (translated !== key) el.setAttribute(attr, translated);
        }
      });
    });
    // <html lang> も同期
    document.documentElement.setAttribute('lang', state.locale);
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
