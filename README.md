# 株式会社PAAN コーポレートサイト (paan.co.jp) — v2

menupaan.com の構造・余白・フォント・ヘッダー/フッター・装飾を**完全踏襲**し、
カラーテーマのみ **Royal Navy (紺)** に置換した姉妹サイト。

## v2 で v1 から修正した点

1. **page-title 下の独自ゴールド線を削除** (menupaanには存在しない装飾)
2. **section-title / info-h 下のゴールド線も削除** (同上)
3. **ヒーロー構造を menupaan の hero / hero-title / hero-sub / hero-tagline 形式に変更**
4. **ヒーローに背景画像枠を追加** (`/assets/hero/hero-london-{800,1600,2400}.webp` を後で配置)
5. **ロゴを「PAAN」単独表記に統一** (Marcellus、サブテキスト無し、menupaan の MENU-PAAN と完全同形式)
6. **mp-lp-nav 方式のヘッダー** (中央寄せ、下線active、`mp-lp-link.active::after`)
7. **CTAボタンを pill (rounded-full) 型に変更** (menupaan の hero-cta 踏襲)
8. **フッタータグラインを Playfair Display italic に維持** (menupaan の mp-footer-tag 踏襲)

## 重要: ヒーロー画像の配置

トップページのヒーロー背景画像は現在プレースホルダ参照のみ。
`/assets/hero/` ディレクトリを作って以下を配置すれば自動表示されます:

- `hero-london-800.webp` (mobile, 800w)
- `hero-london-1600.webp` (desktop default, 1600w)
- `hero-london-2400.webp` (Retina desktop, 2400w)

画像は紺基調に合うイギリス風景 (ロンドン街並み・パブ前・テムズ川等)
または抽象的な紺グラデーション等を推奨。配置するまでは上層の白いoverlay
だけが表示され、文字は問題なく読めます。

## ファイル構成

```
paan-corp/
├── index.html        # トップページ (ヒーロー + お知らせ)
├── mission.html      # 理念・ミッション
├── brand.html        # ブランド (MENU-PAAN ほか)
├── company.html      # 会社概要・役員紹介
├── contact.html      # お問い合わせ (info@paan.co.jp)
├── style.css         # 共通スタイル (menupaan完全踏襲)
├── header-footer.js  # ヘッダー/フッター注入
├── favicon.svg       # ファビコン (紺×白)
├── _redirects        # Netlify URL設定 (拡張子無しURL)
├── _headers          # Netlify セキュリティヘッダー
└── README.md
```

## カラーマッピング (menupaan→PAAN)

| 用途 | menupaan (赤) | PAAN (紺) |
|------|---------------|-----------|
| メイン | `#9B1C31` | `#1A2E5C` Royal Navy |
| メイン deep | `#7A1025` | `#0E1C3D` |
| サブラベル | `#C27680` | `#6B7DA0` |
| 本文 | `#3A1420` | `#1A2040` |
| ボーダー | `#F0E4D9` | `#E4E8F0` |
| カード背景 | `#FDFAF7` | `#FDFAFB` |

## 編集ポイント

- **お知らせ追加**: `index.html` の `<ul class="news-list">` 内に `<li class="news-item">` を追加
- **新ブランド追加**: `brand.html` の `<article class="brand-card">` を複製
- **役員情報変更**: `company.html` の `<div class="founder-card">` を編集
- **ヒーロー文言変更**: `index.html` の `.hero-title` `.hero-sub` `.hero-tagline`

## デプロイ

git push で Netlify が自動デプロイ。
お知らせ追加等の小さな更新は GitHub の Web UI から `index.html` を編集
→ コミット → 自動デプロイで完結します。
