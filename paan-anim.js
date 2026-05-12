/**
 * paan-anim.js (v32)
 *
 * 軽量UXアニメーション (=3G環境でも快適に動くよう設計):
 *   1. <html class="no-js"> を即削除 → CSS制御開始
 *   2. hero画像 fade-in は CSS @keyframes heroFadeIn (= v30.42以降JS不要)
 *   3. hero内テキスト staggered fade-in は CSS @keyframes heroTextIn (= v31.2以降JS不要)
 *   4. IntersectionObserver でセクションのスクロール reveal
 *   5. ハンバーガー backdrop blur (= v32でクラス名修正、 ようやく動作)
 *   6. ページ遷移フェード + drawer-instant-hide
 *   7. ヒーローパララックス + haptic feedback
 *   8. prefers-reduced-motion 対応 (= アクセシビリティ)
 *
 * v32 修正:
 *   - initMenuBackdrop: .mp-mobile-menu → .mp-mobile-drawer (= 実際のクラス名)
 *   - closeDrawerIfOpen: .mp-mobile-burger → .mp-burger (= 実際のクラス名)
 *   - initHeroText / initHeroFadeIn 削除 (= CSS keyframe移行後の残骸)
 */
(function() {
  'use strict';

  // Step 1: <html> から no-js クラスを即削除 (= JS有効を CSS に通知)
  document.documentElement.classList.remove('no-js');

  // prefers-reduced-motion 検出 (= 動きが苦手な人/低スペック端末)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // Step 3: ヒーロー内テキスト staggered fade-in
  //   → v31.2 で CSS @keyframes に置き換え、 JS関数は不要に
  //   → v32 でデッドコード削除
  // ============================================

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
      // v31.2: anim-reveal クラスは既にHTMLに付与済み (=チラつき防止)
      // v31.3: 画像 fade完了 (=1.0s) 後に本文が順次登場、 上にあるほど早く、 下にあるほど遅く
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const delay = 1.1 + (rect.top / window.innerHeight) * 0.4;
        el.style.transitionDelay = `${delay}s`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.classList.add('revealed');
        }));
        return;
      }
      observer.observe(el);
    });

    // v30.40: フッターも遅れて fade-in (= 本文よりさらに後)
    const footer = document.querySelector('.mp-site-footer');
    if (footer) {
      footer.classList.add('anim-reveal');
      const rect = footer.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        footer.style.transitionDelay = '1.6s';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          footer.classList.add('revealed');
        }));
      } else {
        observer.observe(footer);
      }
    }
  }

  // ============================================
  // 起動
  // ============================================
  function init() {
    // v31.2: initHeroText は削除 (= CSS @keyframes で確実に毎回 fade-in)
    initScrollReveal();
    initPageTransitionFade();
    initHeroParallax();
    initMenuBackdrop();
    initHapticFeedback();
  }

  // ============================================
  // v30.38: hero画像のフェードイン
  //   → v30.42 で CSS @keyframes heroFadeIn に置き換え、 JS関数は不要に
  //   → v32 でデッドコード削除
  // ============================================

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
    // v32: 実際の class は .mp-mobile-drawer (旧コードの .mp-mobile-menu は誤り、 一度も動作してなかった)
    // モバイルメニューの開閉を MutationObserver で検知
    const observer = new MutationObserver(() => {
      const mobileDrawer = document.querySelector('.mp-mobile-drawer');
      if (!mobileDrawer) return;
      // 表示中かどうか判定 (= is-open クラスが付くと開いてる、 header-footer.js の実装に合わせる)
      const isOpen =
        mobileDrawer.classList.contains('is-open') ||
        mobileDrawer.getAttribute('aria-hidden') === 'false';
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
    // v30.42: drawer閉じる処理は全ブラウザ共通で必要なので、 reduceMotion / View Transitions の判定より前に
    const closeDrawerIfOpen = () => {
      const openDrawer = document.querySelector('.mp-mobile-drawer.is-open');
      if (openDrawer) {
        openDrawer.classList.remove('is-open');
        openDrawer.setAttribute('aria-hidden', 'true');
      }
      const burgerBtn = document.querySelector('.mp-burger[aria-expanded="true"]');
      if (burgerBtn) {
        burgerBtn.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('menu-open');
    };

    // すべてのブラウザでリンククリック時に drawer を即閉じる (= 遷移時の残像防止)
    const supportsViewTransitions = 'startViewTransition' in document;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank') return;
      if (link.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;

      // v31.1: drawer を即閉じる
      closeDrawerIfOpen();

      // v31.1: drawer を transition なしで即非表示にするためのクラス付与
      // (= View Transitions API でも非対応でも、 ハンバーガーは即消す)
      document.body.classList.add('drawer-instant-hide');

      // View Transitions API 非対応の場合のみ body フェードアウト
      if (!supportsViewTransitions) {
        document.body.classList.add('page-fading-out');
      }
    }, true); // capture phase で先に処理

    // 以下は View Transitions API 非対応ブラウザ用 fade-out
    if (reduceMotion) return;
    if ('startViewTransition' in document) return;

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank') return;
      if (link.hasAttribute('download')) return;
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
