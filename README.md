# 株式会社PAAN コーポレートサイト (paan.co.jp) — v17

12言語完全対応。 menupaan.com の構造を踏襲し、 Royal Navy 紺基調。

## v17 (2026-05-11) — 12言語多言語化

- **i18n.js**: URL prefix 方式 (`/en/mission`, `/zh-CN/brand` など)、 localStorage 記憶、 ブラウザ言語自動検出
- **辞書 12 言語完全対応**: ja / en / zh-CN / zh-TW / ko / es / fr / de / it / vi / id / th
  - 各言語 140 キー、 構造完全一致 (= 欠落・余剰なし)
  - 文学的トーン保持、 ビジネス文脈で通用
  - イギリス英語使用 (en)
- **言語ドロップダウン**: ヘッダー右側、 旗 + ネイティブ名 + 選択チェックマーク、 12言語2列グリッド表示
- **モバイル対応**: ドロップダウンは旗のみ表示
- **HTML 5ページ全部** に `data-i18n` 属性付与済 (= index/mission/brand/company/contact)
- **_redirects 多言語対応**: `/:lang/...` → 既存 HTML を返し、 i18n.js がクライアント側で翻訳

## ファイル構成

```
paan-corp/
├── index.html        # トップ (お知らせ)
├── mission.html      # ミッション・理念 (Various Regrets 7話)
├── brand.html        # ブランド (MENU-PAAN ほか)
├── company.html      # 会社概要・役員紹介
├── contact.html      # お問い合わせ
├── style.css         # 共通スタイル + 12言語ドロップダウンCSS
├── header-footer.js  # ヘッダー / フッター + 言語ドロップダウン
├── i18n.js           # 12言語辞書ロード + DOM適用ヘルパー
├── i18n/             # 12言語辞書 (各140キー)
│   ├── ja.json (マスター)
│   ├── en.json (イギリス英語)
│   ├── zh-CN.json / zh-TW.json
│   ├── ko.json / es.json / fr.json
│   ├── de.json / it.json / vi.json / id.json / th.json
├── images/           # 役員写真
│   ├── rokusaburo_inui.jpg
│   └── koki_yui.jpg
├── favicon.svg
├── _redirects        # 多言語URL対応 (`/:lang/...`)
├── _headers          # Netlifyセキュリティヘッダー
└── README.md
```

## i18n 仕組み

1. **URL prefix**: `paan.co.jp/en/mission` → `en` ロケール、 既存 `mission.html` を `_redirects` で返す
2. **i18n.js が決定**: URL → localStorage → ブラウザ言語 → デフォルト ja の順
3. **辞書ロード**: `/i18n/{locale}.json` を fetch
4. **DOM 適用**: `data-i18n="key.path"` 属性付き要素を一括翻訳
5. **属性翻訳**: `data-i18n-attr="content:meta.description"` で属性値も翻訳

## 言語切替

ヘッダー右側のドロップダウンで切替。 選択するとロケール prefix 付き URL に遷移し、 localStorage に保存。

## デプロイ

git push で Netlify が自動デプロイ。

## カラー

| 用途 | 値 |
|------|-----|
| メイン紺 | `#1A2E5C` Royal Navy |
| deep | `#0E1C3D` |
| サブ | `#6B7DA0` |
| ゴールド | `#C9A961` |
| カード背景 | `#FAFBFD` (微寒色) |
| MENU-PAAN導線のみ | `#9B1C31` ボルドー |

## 既知の留保

- タイ語 / ベトナム語 / インドネシア語は launch 後にネイティブモニターによる校正を予定
- og:image の言語別対応、 hreflang タグ追加は将来 Phase
