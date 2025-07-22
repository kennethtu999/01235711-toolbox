# Cloudflare Pages 部署指南

## 自動部署（推薦）

### 透過 Git 連接

1. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 進入 Pages 頁面
3. 點擊「建立專案」
4. 連接到 Git 提供者（GitHub/GitLab）
5. 選擇此倉庫
6. 設定建置配置：
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (預設)
   - **Environment variables**: 不需要額外設定

7. 點擊「部署」

### 建置設定

```yaml
Build command: npm run build
Build output directory: out
Node.js version: 18.x
```

## 手動部署

### 使用 Wrangler CLI

1. 安裝 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登入 Cloudflare：
```bash
wrangler login
```

3. 建置專案：
```bash
npm run build
```

4. 部署到 Pages：
```bash
wrangler pages deploy out --project-name=01235711-toolbox
```

### 使用 Cloudflare 專用建置

```bash
# 使用 @cloudflare/next-on-pages 建置
npm run pages:build

# 部署
wrangler pages deploy .vercel/output/static --project-name=01235711-toolbox
```

## 自定義網域

1. 在 Cloudflare Pages 專案設定中
2. 進入「自定義網域」頁籤
3. 點擊「設定自定義網域」
4. 輸入網域名稱
5. 依照指示設定 DNS 記錄

## 環境變數

此專案不需要特殊的環境變數設定，所有功能都在前端運行。

## 故障排除

### 建置失敗
- 確保 Node.js 版本為 18.x 或更高
- 檢查所有依賴是否正確安裝
- 確認建置命令為 `npm run build`

### 頁面無法載入
- 確認建置輸出目錄設定為 `out`
- 檢查路由設定是否正確

### 部署後功能異常
- 確認所有靜態資源已正確生成
- 檢查瀏覽器控制台是否有 JavaScript 錯誤

## 更新部署

當程式碼更新後：

1. **自動部署**: 推送到連接的 Git 倉庫分支即可自動觸發部署
2. **手動部署**: 重新執行建置和部署命令

## 效能優化

- 啟用 Cloudflare 的 Minify（HTML、CSS、JS）
- 啟用 Brotli 壓縮
- 設定適當的快取規則
- 啟用 HTTP/2 和 HTTP/3 