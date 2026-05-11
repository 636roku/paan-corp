/**
 * paan-anim.js (v30.33)
 *
 * 軽量UXアニメーション (=3G環境でも快適に動くよう設計):
 *   1. <html class="no-js"> を即削除 → CSS制御開始
 *   2. hero画像読込完了で .loaded クラス → fade-in
 *   3. ヒーロー内テキスト staggered fade-in (= eyebrow → title → sub)
 *   4. IntersectionObserver でセクションのスクロール reveal
 *   5. prefers-reduced-motion 対応 (= アクセシビリティ)
 *
 * サイズ目標: ~2KB gzipped、 描画コスト最小 (=transform/opacityのみ使用)
 */
(function() {
  'use strict';

  // Step 1: <html> から no-js クラスを即削除 (= JS有効を CSS に通知)
  document.documentElement.classList.remove('no-js');

  // prefers-reduced-motion 検出 (= 動きが苦手な人/低スペック端末)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // Step 2: hero画像 fade-in (= まだロード中の場合のみ演出を付加)
  // ============================================
  function initHeroFadeIn() {
    const heroImg = document.querySelector('.hero-bg-img');
    if (!heroImg) return;

    // すでに画像読み込み完了 → 何もしない (= デフォルト opacity:1 のまま表示)
    if (heroImg.complete && heroImg.naturalWidth > 0) {
      heroImg.classList.add('loaded');
      // この時 .js-on クラスはまだないので opacity:1 のまま
      return;
    }

    if (reduceMotion) {
      heroImg.classList.add('loaded');
      return;
    }

    // 画像がまだロード中 → js-on クラスを付けて opacity:0 → load 完了で opacity:1 にフェード
    document.documentElement.classList.add('js-on');

    heroImg.addEventListener('load', () => {
      heroImg.classList.add('loaded');
    });
    heroImg.addEventListener('error', () => {
      // エラー時もとりあえず表示 (= フォールバック)
      heroImg.classList.add('loaded');
    });

    // 安全策: 3秒経っても load イベントが来なかったら強制表示
    setTimeout(() => {
      if (!heroImg.classList.contains('loaded')) {
        heroImg.classList.add('loaded');
      }
    }, 3000);
  }

  // ============================================
  // Step 3: ヒーロー内テキスト staggered fade-in
  // ============================================
  function initHeroText() {
    if (reduceMotion) return;

    // index.html: .hero-title, .hero-sub
    // sub-hero: .page-eyebrow, .page-title
    const selectors = [
      '.hero-content .hero-title',
      '.hero-content .hero-sub',
      '.sub-hero .page-eyebrow',
      '.sub-hero .page-title',
    ];

    let index = 0;
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.classList.add('anim-hero-text');
        // 順番に 0.15秒ずつ遅延
        el.style.animationDelay = `${0.4 + index * 0.15}s`;
        index++;
      });
    });
  }

  // ============================================
  // Step 4: スクロール reveal (= IntersectionObserver)
  // ============================================
  function initScrollReveal() {
    if (reduceMotion) {
      // reduce-motion: 即表示
      document.querySelectorAll('.info-section, .section, .message-article').forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      // 古いブラウザ: 全部 revealed (= フォールバック)
      document.querySelectorAll('.info-section, .section, .message-article').forEach(el => {
        el.classList.add('revealed');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      // 画面下端から 80px 上の位置で発火 (= 入る少し前)
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.01,
    });

    document.querySelectorAll('.info-section, .section, .message-article').forEach(el => {
      el.classList.add('anim-reveal');
      observer.observe(el);
    });
  }

  // ============================================
  // 起動
  // ============================================
  function init() {
    initHeroFadeIn();
    initHeroText();
    initScrollReveal();
    initPageTransitionFade();
    initHeroParallax();
    initMenuBackdrop();
    initHapticFeedback();
  }

  // ============================================
  // #17: ヒーロー画像 zoom-out パララックス
  // スクロール量に応じて画像が 1.04倍 にゆっくり拡大
  // ============================================
  function initHeroParallax() {
    if (reduceMotion) return;

    const heroSections = document.querySelectorAll('.hero, .sub-hero');
    if (!heroSections.length) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        heroSections.forEach(hero => {
          // スクロール量が hero 高さの 30% を超えたら scrolled クラス付与
          if (scrollY > hero.offsetHeight * 0.3) {
            hero.classList.add('scrolled');
          } else {
            hero.classList.remove('scrolled');
          }
        });
        ticking = false;
      });
      ticking = true;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ============================================
  // #19: ハンバーガーメニューオープン検知 → backdrop blur
  // ============================================
  function initMenuBackdrop() {
    // モバイルメニューの開閉を MutationObserver で検知
    const observer = new MutationObserver(() => {
      const mobileMenu = document.querySelector('.mp-mobile-menu');
      if (!mobileMenu) return;
      // 表示中かどうか判定 (= display や class名から)
      const isOpen =
        mobileMenu.classList.contains('open') ||
        mobileMenu.classList.contains('is-open') ||
        mobileMenu.getAttribute('aria-hidden') === 'false' ||
        getComputedStyle(mobileMenu).display !== 'none';
      document.body.classList.toggle('menu-open', isOpen);
    });

    // body 全体を監視 (= header-footer.js が動的にメニュー挿入する可能性)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'aria-hidden', 'style'],
      subtree: true,
      childList: true,
    });
  }

  // ============================================
  // #20: 触感フィードバック (= モバイル haptic)
  // リンクタップ時に軽くバイブ (= 対応端末のみ)
  // ============================================
  function initHapticFeedback() {
    if (!('vibrate' in navigator)) return;
    if (reduceMotion) return;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a, button');
      if (!link) return;
      // 微弱な振動 (= 10ms、 ほぼ知覚しないレベル)
      try { navigator.vibrate(8); } catch (err) { /* iOS は無視 */ }
    });
  }

  // ============================================
  // ページ遷移フェード (=View Transitions API 非対応時のフォールバック)
  // Safari 17以前等で「バチっと消える」 のを防ぐ
  // ============================================
  function initPageTransitionFade() {
    if (reduceMotion) return;

    // View Transitions API 対応してれば CSS が担当するのでスキップ
    if ('startViewTransition' in document) return;

    // リンククリック時に手動でフェードアウト
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // 外部リンク、 同一ページ内アンカー、 メールリンク等はスキップ
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank') return;
      if (link.hasAttribute('download')) return;
      // 修飾キー押下時 (= 新タブで開く意図) はスキップ
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      e.preventDefault();
      document.body.classList.add('page-fading-out');
      setTimeout(() => {
        window.location.href = href;
      }, 280);
    });
  }

  // DOMContentLoaded 前なら待つ、 後なら即実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ============================================
  // Service Worker 登録 (= 2回目以降のオフライン即表示、 3G対応)
  // ============================================
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        // SW登録失敗してもサイトは普通に動くので、 console警告のみ
        console.warn('[paan] SW registration failed:', err);
      });
    });
  }
})();
