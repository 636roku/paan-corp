// ============================================================
// 株式会社 PAAN — Unified Site Header & Footer
// v18 (2026-05-11): モバイルでハンバーガーメニュー (= 三) 対応
//   - デスクトップ (>720px): 横並びナビ + 言語ドロップダウン右側 (= 従来通り)
//   - モバイル (≤720px): ロゴ + 三ボタンのみ、 タップで全画面ドロワー
// ============================================================

(function() {
  'use strict';

  function t(key, fallback) {
    if (window.PAAN && window.PAAN.i18n && window.PAAN.i18n.isReady && window.PAAN.i18n.isReady()) {
      const v = window.PAAN.i18n.t(key);
      return (v && v !== key) ? v : (fallback || key);
    }
    return fallback || key;
  }

  function getCurrentLocale() {
    if (window.PAAN && window.PAAN.i18n && window.PAAN.i18n.getLocale) {
      return window.PAAN.i18n.getLocale();
    }
    return 'ja';
  }

  function localizedPath(p) {
    const loc = getCurrentLocale();
    if (loc === 'ja') return p;
    return `/${loc}${p === '/' ? '' : p}`;
  }

  // ---- HEADER ----
  function buildHeader() {
    const path = window.location.pathname;
    const cleanPath = path.replace(/^\/(ja|en|zh-CN|zh-TW|ko|es|fr|de|it|vi|id|th)(\/|$)/, '/');
    const isActive = (p) => {
      if (p === '/' && (cleanPath === '/' || cleanPath === '/index.html')) return 'active';
      if (p !== '/' && cleanPath.indexOf(p) === 0) return 'active';
      return '';
    };

    return `
      <header class="mp-site-header" role="banner">
        <a href="${localizedPath('/')}" class="mp-site-logo" aria-label="PAAN">PAAN</a>
        <nav class="mp-lp-nav" aria-label="Navigation">
          <a href="${localizedPath('/')}"        class="mp-lp-link ${isActive('/')}"        data-i18n="nav.top">トップ</a>
          <a href="${localizedPath('/mission')}" class="mp-lp-link ${isActive('/mission')}" data-i18n="nav.mission">ミッション・理念</a>
          <a href="${localizedPath('/brand')}"   class="mp-lp-link ${isActive('/brand')}"   data-i18n="nav.brand">ブランド</a>
          <a href="${localizedPath('/company')}" class="mp-lp-link ${isActive('/company')}" data-i18n="nav.company">会社概要</a>
          <a href="${localizedPath('/contact')}" class="mp-lp-link ${isActive('/contact')}" data-i18n="nav.contact">お問い合わせ</a>
        </nav>
        <div class="mp-locale-wrapper">
          <button type="button" class="mp-locale-button" id="mp-locale-btn" aria-haspopup="true" aria-expanded="false">
            <span class="mp-locale-flag" id="mp-locale-current-flag"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg></span>
            <span class="mp-locale-name" id="mp-locale-current-name">日本語</span>
            <span class="mp-locale-arrow" aria-hidden="true">▾</span>
          </button>
          <div class="mp-locale-menu" id="mp-locale-menu" role="menu" aria-hidden="true"></div>
        </div>
        <button type="button" class="mp-burger" id="mp-burger-btn" aria-label="Menu" aria-expanded="false" aria-controls="mp-mobile-drawer">
          <span class="mp-burger-bar"></span>
          <span class="mp-burger-bar"></span>
          <span class="mp-burger-bar"></span>
        </button>
      </header>

      <div class="mp-mobile-drawer" id="mp-mobile-drawer" aria-hidden="true">
        <div class="mp-mobile-drawer-inner">
          <button type="button" class="mp-mobile-close" id="mp-mobile-close-btn" aria-label="Close">&times;</button>
          <nav class="mp-mobile-nav" aria-label="Mobile navigation">
            <a href="${localizedPath('/')}"        class="mp-mobile-link ${isActive('/')}"><span class="mp-mobile-link-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12L12 3l9 9"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg></span><span data-i18n="nav.top">トップ</span></a>
            <a href="${localizedPath('/mission')}" class="mp-mobile-link ${isActive('/mission')}" data-i18n="nav.mission">ミッション・理念</a>
            <a href="${localizedPath('/brand')}"   class="mp-mobile-link ${isActive('/brand')}"   data-i18n="nav.brand">ブランド</a>
            <a href="${localizedPath('/company')}" class="mp-mobile-link ${isActive('/company')}" data-i18n="nav.company">会社概要</a>
            <a href="${localizedPath('/contact')}" class="mp-mobile-link ${isActive('/contact')}" data-i18n="nav.contact">お問い合わせ</a>
          </nav>
          <div class="mp-mobile-locale-section">
            <button type="button" class="mp-mobile-locale-toggle" id="mp-mobile-locale-toggle" aria-expanded="false" aria-controls="mp-mobile-locale-grid">
              <span class="mp-mobile-locale-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a13.5 13.5 0 0 1 0 18"/><path d="M12 3a13.5 13.5 0 0 0 0 18"/></svg></span>
              <span class="mp-mobile-locale-toggle-label" data-i18n="nav.language">言語 / Language</span>
              <span class="mp-mobile-locale-toggle-chevron" aria-hidden="true">▾</span>
            </button>
            <div class="mp-mobile-locale-grid" id="mp-mobile-locale-grid" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ---- FOOTER ----
  function buildFooter() {
    return `
      <footer class="mp-site-footer" role="contentinfo">
        <a href="${localizedPath('/')}" class="mp-footer-logo-link" aria-label="PAAN">
          <div class="mp-footer-logo">PAAN</div>
        </a>
        <div class="mp-footer-tag" data-i18n="meta.tagline">未だ見ぬ料理への道を拓く。</div>

        <div class="mp-footer-links">
          <a href="${localizedPath('/')}"        class="mp-footer-link" data-i18n="nav.top">トップ</a>
          <a href="${localizedPath('/mission')}" class="mp-footer-link" data-i18n="nav.mission">ミッション・理念</a>
          <a href="${localizedPath('/brand')}"   class="mp-footer-link" data-i18n="nav.brand">ブランド</a>
          <a href="${localizedPath('/company')}" class="mp-footer-link" data-i18n="nav.company">会社概要</a>
          <a href="${localizedPath('/contact')}" class="mp-footer-link" data-i18n="nav.contact">お問い合わせ</a>
        </div>

        <!-- v30.31: 法的書類リンク -->
        <div class="mp-footer-legal">
          <a href="/privacy" class="mp-footer-legal-link" data-i18n="nav.privacy">プライバシーポリシー</a>
          <span class="mp-footer-legal-sep">·</span>
          <a href="/terms" class="mp-footer-legal-link" data-i18n="nav.terms">サイト利用規約</a>
          <span class="mp-footer-legal-sep">·</span>
          <a href="/cookie" class="mp-footer-legal-link" data-i18n="nav.cookie">クッキーポリシー</a>
        </div>

        <div class="mp-footer-copy" data-i18n="meta.copyright">
          &copy; 2026 株式会社PAAN (PAAN Co., Ltd.) · All rights reserved.
        </div>
      </footer>
    `;
  }

  // ---- LOCALE DROPDOWN INIT (デスクトップ用) ----
  function initLocaleDropdown() {
    if (!window.PAAN || !window.PAAN.i18n) return;
    const btn = document.getElementById('mp-locale-btn');
    const menu = document.getElementById('mp-locale-menu');
    const flagEl = document.getElementById('mp-locale-current-flag');
    const nameEl = document.getElementById('mp-locale-current-name');
    if (!btn || !menu) return;

    const META = window.PAAN.i18n.LOCALE_META;
    const locales = window.PAAN.i18n.getSupportedLocales();
    const current = window.PAAN.i18n.getLocale();

    const cur = META[current];
    if (cur) {
      // flag は線画 globe SVG 固定 (menupaan デザイン)。 ロケール毎の国旗絵文字には差し替えない
      if (nameEl) nameEl.textContent = cur.name;
    }

    menu.innerHTML = locales.map(loc => {
      const m = META[loc] || { flag: '🌐', name: loc };
      const isCur = loc === current;
      return `
        <a href="#" class="mp-locale-item${isCur ? ' is-current' : ''}" data-locale="${loc}" role="menuitem">
          <span class="mp-locale-item-flag">${m.flag}</span>
          <span class="mp-locale-item-name">${m.name}</span>
          ${isCur ? '<span class="mp-locale-item-check">✓</span>' : ''}
        </a>
      `;
    }).join('');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      menu.setAttribute('aria-hidden', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');
      }
    });

    menu.querySelectorAll('.mp-locale-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const loc = item.getAttribute('data-locale');
        if (!loc || loc === current) return;
        window.PAAN.i18n.setLocale(loc);
      });
    });
  }

  // ---- MOBILE DRAWER INIT (モバイル用) ----
  function initMobileDrawer() {
    const burger = document.getElementById('mp-burger-btn');
    const drawer = document.getElementById('mp-mobile-drawer');
    const closeBtn = document.getElementById('mp-mobile-close-btn');
    const grid = document.getElementById('mp-mobile-locale-grid');
    if (!burger || !drawer) return;

    // 言語グリッド populate
    if (grid && window.PAAN && window.PAAN.i18n) {
      const META = window.PAAN.i18n.LOCALE_META;
      const locales = window.PAAN.i18n.getSupportedLocales();
      const current = window.PAAN.i18n.getLocale();
      grid.innerHTML = locales.map(loc => {
        const m = META[loc] || { flag: '🌐', name: loc };
        const isCur = loc === current;
        return `
          <a href="#" class="mp-mobile-locale-item${isCur ? ' is-current' : ''}" data-locale="${loc}">
            <span class="mp-mobile-locale-flag">${m.flag}</span>
            <span class="mp-mobile-locale-name">${m.name}</span>
            ${isCur ? '<span class="mp-mobile-locale-check">✓</span>' : ''}
          </a>
        `;
      }).join('');

      grid.querySelectorAll('.mp-mobile-locale-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const loc = item.getAttribute('data-locale');
          if (!loc || loc === current) return;
          window.PAAN.i18n.setLocale(loc);
        });
      });
    }

    const open = () => {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    // v30.9: バーガーをトグル化 (= MENU-PAAN風、 もう一度タップで閉じる)
    const toggle = () => {
      if (drawer.classList.contains('is-open')) close();
      else open();
    };

    burger.addEventListener('click', toggle);
    if (closeBtn) closeBtn.addEventListener('click', close);
    // バックドロップ (= 自身) クリックで閉じる
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) close();
    });
    // ESCキーで閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
    // v30.9: ナビリンクタップ後にメニューを閉じる (= ドロップダウン式UX)
    drawer.querySelectorAll('.mp-mobile-link').forEach(link => {
      link.addEventListener('click', close);
    });

    // v30.10: 言語セクションのアコーディオン処理
    const localeToggle = document.getElementById('mp-mobile-locale-toggle');
    if (localeToggle && grid) {
      const setLocaleExpanded = (expanded) => {
        localeToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        grid.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        grid.classList.toggle('is-expanded', expanded);
      };
      // 初期状態 = 閉じる
      setLocaleExpanded(false);
      localeToggle.addEventListener('click', () => {
        const isExpanded = localeToggle.getAttribute('aria-expanded') === 'true';
        setLocaleExpanded(!isExpanded);
      });
      // メニュー全体を閉じる時、 言語セクションも閉じる
      const origClose = close;
      // closeに副作用追加するのは難しいので、 burger toggleとESCで毎回setLocaleExpanded(false)
    }
  }

  // ---- INJECT ----
  function inject() {
    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');
    if (headerSlot) headerSlot.outerHTML = buildHeader();
    if (footerSlot) footerSlot.outerHTML = buildFooter();

    const header = document.querySelector('.mp-site-header');
    if (header) {
      const onScroll = () => {
        if (window.scrollY > 8) header.classList.add('mp-scrolled');
        else header.classList.remove('mp-scrolled');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (window.PAAN && window.PAAN.i18n && window.PAAN.i18n.isReady && window.PAAN.i18n.isReady()) {
      window.PAAN.i18n.applyToDOM();
      initLocaleDropdown();
      initMobileDrawer();
    } else {
      window.addEventListener('paan:i18n:ready', () => {
        window.PAAN.i18n.applyToDOM();
        initLocaleDropdown();
        initMobileDrawer();
      }, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
