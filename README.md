# 株式会社PAAN コーポレートサイト (paan.co.jp)

menupaan.com の構造・余白・フォント・ヘッダー/フッター方式を踏襲し、
カラーテーマを **Royal Navy (紺)** に置換した姉妹サイト。

## ファイル構成

```
paan-corp/
├── index.html        # トップページ (お知らせ中心)
├── mission.html      # 理念・ミッション
├── brand.html        # ブランド (MENU-PAAN ほか)
├── company.html      # 会社概要・役員紹介
├── contact.html      # お問い合わせ (info@paan.co.jp)
├── style.css         # 共通スタイル (menupaan踏襲)
├── header-footer.js  # ヘッダー/フッター注入 (menupaan踏襲)
├── favicon.svg       # ファビコン (紺×金)
├── _redirects        # Netlify URL設定 (拡張子無しURL)
├── _headers          # Netlify セキュリティヘッダー
└── README.md
```

## カラーマッピング (menupaan→PAAN)

| 用途 | menupaan (赤) | PAAN (紺) |
|------|---------------|-----------|
| メイン | #9B1C31 | **#1A2E5C** (Royal Navy) |
| メイン deep | — | **#0E1C3D** |
| サブ | #C27680 | **#6B7DA0** |
| ゴールド | #C9A961 | **#B8985A / #C9A961** |
| ボーダー | #F0E4D9 | **#E4E8F0** |
| カード背景 | #FDFAF7 | **#FDFAFB** |
| 本文 | #3A1420 | **#1A2040** |

## 踏襲した menupaan の仕様

- **ヘッダー**: fixed + blur (`rgba(255,255,255,0.96)` + `backdrop-filter`)
- **本文オフセット**: `body padding-top:96px` (mobile 72px)
- **page-wrap**: `max-width:760px; padding:48px 24px 40px` (mobile 32/22/32)
- **info-section**: `margin-bottom:40px`
- **info-row**: `grid-template-columns:140px 1fr; gap:20px` (mobile 100px/14px)
- **founders-grid**: PC 2列 / mobile 1列
- **フッター**: 白背景・中央寄せ・Marcellusロゴ
- **フォント**: Marcellus (英ロゴ) / Playfair Display italic (英サブ) / Noto Serif JP / Noto Sans JP

## デプロイ手順 (Netlify + お名前.com)

```bash
# 1. ローカルへ展開
mkdir -p /Users/636_roku/Documents/PAAN_Co_Ltd/PAAN/git
cd /Users/636_roku/Documents/PAAN_Co_Ltd/PAAN/git
unzip -o ~/Downloads/paan-corp-site.zip

# 2. git 初期化
git init
git add .
git commit -m 'initial commit: PAAN corporate site v1'

# 3. GitHub に push
gh repo create 636roku/paan-corp --public --source=. --push
# あるいは: github.com で手動作成 → git remote add → push

# 4. Netlify
# - https://app.netlify.com → Add new site → Import an existing project
# - Build command: 空欄
# - Publish directory: . (ルート)
# - Site settings → Domain management → Add custom domain → paan.co.jp
# - お名前.com の DNS で Netlify 指示の A / CNAME を設定
# - SSL は Let's Encrypt で自動発行
```

## 編集ポイント

- **お知らせ追加**: `index.html` の `<ul class="news-list">` 内に `<li class="news-item">` を追加
- **新ブランド追加**: `brand.html` の `<article class="brand-card">` を複製
- **役員情報変更**: `company.html` の `<div class="founder-card">` を編集
- **ヘッダー/フッターのリンク追加**: `header-footer.js` の `buildHeader()` / `buildFooter()` を編集

## アクセシビリティ

- WCAG AA 相当のコントラスト確保 (Royal Navy on white は約 11:1)
- `aria-current="page"` でナビ現在地表示 (`active` クラスでも視覚化)
- `aria-label` を主要ランドマーク (banner / contentinfo / nav) に付与
