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
  document.documentElement.classList.add('js-on');

  // prefers-reduced-motion 検出 (= 動きが苦手な人/低スペック端末)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================
  // Step 2: hero画像 fade-in
  // ============================================
  function initHeroFadeIn() {
    const heroImg = document.querySelector('.hero-bg-img');
    if (!heroImg) return;

    if (reduceMotion) {
      heroImg.classList.add('loaded');
      return;
    }

    // すでにロード完了してたら即追加
    if (heroImg.complete && heroImg.naturalWidth > 0) {
      heroImg.classList.add('loaded');
    } else {
      heroImg.addEventListener('load', () => {
        heroImg.classList.add('loaded');
      });
      heroImg.addEventListener('error', () => {
        // エラー時もとりあえず表示 (= フォールバック)
        heroImg.classList.add('loaded');
      });
    }
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
