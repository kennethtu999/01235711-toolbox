# 01235711 工具箱

一個簡單實用的開發者工具集，包含JSON、YAML、XML格式化和HAR解析功能。

## 功能特色

- **JSON 格式化**: 美化和壓縮JSON數據
- **YAML 格式化**: 轉換和格式化YAML配置
- **XML 格式化**: 美化和壓縮XML文檔
- **HAR 解析**: 解析和分析HTTP Archive檔案

## 技術棧

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- React Syntax Highlighter

## 在 Cloudflare Pages 上部署

### 方式一：使用 Wrangler CLI

1. 安裝依賴：
```bash
npm install
```

2. 建置專案：
```bash
npm run build
```

3. 使用 Wrangler 部署：
```bash
npm run deploy
```

### 方式二：使用 Cloudflare Dashboard

1. 在 Cloudflare Dashboard 中建立新的 Pages 專案
2. 連接到 Git 倉庫
3. 設置建置配置：
   - **建置命令**: `npm run build`
   - **建置輸出目錄**: `out`
   - **Node.js 版本**: `18.x`

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev

# 建置生產版本
npm run build

# 本地預覽建置結果
npm run preview
```

## 專案結構

```
src/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx           # 首頁（導向工具箱）
│   ├── globals.css        # 全域樣式
│   └── toolbox/
│       └── page.tsx       # 工具箱主頁
└── components/
    ├── JsonPreview.tsx    # JSON 預覽組件
    └── toolbox/
        ├── JsonFormatter.tsx
        ├── YamlFormatter.tsx
        ├── XmlFormatter.tsx
        ├── HarParser.tsx
        ├── LayoutToggle.tsx
        └── SyntaxHighlighter.tsx
```

## 授權

MIT License 