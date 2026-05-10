// ============================================================
// 株式会社 PAAN — Unified Site Header & Footer
// menupaan.com の header-footer.js 構造を完全踏襲、 紺基調に変更
// ============================================================
// Usage:
//   <div id="site-header"></div>
//   <div id="site-footer"></div>
//   <script src="/header-footer.js" defer></script>
// ============================================================

(function() {
  'use strict';

  // ---- HEADER (menupaan の mp-lp-nav 方式踏襲) ----
  function buildHeader() {
    const path = window.location.pathname;
    const isActive = (p) => {
      if (p === '/' && (path === '/' || path === '/index.html')) return 'active';
      if (p !== '/' && path.indexOf(p) === 0) return 'active';
      return '';
    };

    return `
      <header class="mp-site-header" role="banner">
        <a href="/" class="mp-site-logo" aria-label="株式会社PAAN ホーム">PAAN</a>
        <nav class="mp-lp-nav" aria-label="グローバルナビゲーション">
          <a href="/mission" class="mp-lp-link ${isActive('/mission')}">理念</a>
          <a href="/brand"   class="mp-lp-link ${isActive('/brand')}">ブランド</a>
          <a href="/company" class="mp-lp-link ${isActive('/company')}">会社概要</a>
          <a href="/contact" class="mp-lp-link ${isActive('/contact')}">お問い合わせ</a>
        </nav>
        <div class="mp-header-spacer" aria-hidden="true"></div>
      </header>
    `;
  }

  // ---- FOOTER (menupaan の構造完全踏襲) ----
  function buildFooter() {
    return `
      <footer class="mp-site-footer" role="contentinfo">
        <a href="/" class="mp-footer-logo-link" aria-label="株式会社PAAN ホーム">
          <div class="mp-footer-logo">PAAN</div>
        </a>
        <div class="mp-footer-tag">Unlocking the path to undiscovered cuisines.</div>

        <div class="mp-footer-links">
          <a href="/mission" class="mp-footer-link">理念</a>
          <a href="/brand"   class="mp-footer-link">ブランド</a>
          <a href="/company" class="mp-footer-link">会社概要</a>
          <a href="/contact" class="mp-footer-link">お問い合わせ</a>
        </div>

        <div class="mp-footer-cross-wrap">
          <a href="https://www.menupaan.com" target="_blank" rel="noopener" class="mp-footer-cross-link">
            MENU-PAAN を見る →
          </a>
        </div>

        <div class="mp-footer-copy">
          &copy; 2026 株式会社PAAN (PAAN Co., Ltd.) · All rights reserved.
        </div>
      </footer>
    `;
  }

  // ---- INJECT ----
  function inject() {
    const headerSlot = document.getElementById('site-header');
    const footerSlot = document.getElementById('site-footer');
    if (headerSlot) headerSlot.outerHTML = buildHeader();
    if (footerSlot) footerSlot.outerHTML = buildFooter();

    // Scroll shadow (menupaan踏襲)
    const header = document.querySelector('.mp-site-header');
    if (header) {
      const onScroll = () => {
        if (window.scrollY > 8) header.classList.add('mp-scrolled');
        else header.classList.remove('mp-scrolled');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
