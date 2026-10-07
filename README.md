# 交易講義（網站）

AV帝王-TV樂園 Discord 上 Shawnnnn、Alina、nick_AJ 的教學、問答與盤勢看法，依主題整理成網站。每組討論有重點摘要、原始對話與圖片，可以標記已讀／待複習／已懂、加星號、寫筆記，也可以用抽認卡複習。

## 技術

Nuxt 4 + Nuxt Content 3 + Nuxt UI 4 + Tailwind CSS 4 + VueUse + TypeScript，架構參考 `~/Documents/sunday-salon/site`。用 `npm run generate` 輸出純靜態網站，部署到 GitHub Pages：https://jazztyy.github.io/trading-notes/ （公開 repo，push 到 `main` 自動部署；網頁設 noindex，不讓搜尋引擎收錄）。

## 指令

```bash
npm install
npm run dev        # 本機開發 http://localhost:3000
npm run check      # 內容檢查
npm run typecheck  # 型別檢查
npm run generate   # 內容檢查通過後，輸出靜態網站到 .output/public
```

## 內容從哪裡來

```
../out/                  Discord 原始訊息（../export.mjs）
../work/result-*.json    agent 篩選出的討論組（../prompts/filter.md）
        ↓ ../build-site.mjs
content/notes/{slug}.yml 每組一個檔案
public/img/、public/files/ 縮過的圖片與附件
```

更新流程在上一層跑 `/update-notes`（見 `../.claude/commands/update-notes.md`）。`build-site.mjs` **只新增、不覆蓋**已經存在的檔案，所以手動改過的內容會保留。

## 修改內容

| 要做的事 | 怎麼改 |
|---|---|
| 改標題、重點、標籤 | 直接改 `content/notes/{slug}.yml` 的 `title`、`summary`、`tags` |
| 換主題 | 改 `topic`（必須是 `content/topics.yml` 裡的 `name`） |
| 移除某一組 | 刪掉 `content/notes/{slug}.yml`（和只有它用到的圖片），並把 slug、標題加到 `content/removed.yml`，下次更新才不會再產生回來 |
| 刪掉一則無關的訊息 | 從 `messages` 移除那一則 |
| 主題順序、說明 | 改 `content/topics.yml` |
| 整個主題拿掉 | 從 `topics.yml` 的 `topics` 移到 `excluded`，再移除主標籤是它的組（`npm run check` 會列出來）；之後新的同類組不會寫入 |

改完跑 `npm run check`。規格見 [SPEC.md](SPEC.md)，畫面規範見 [DESIGN.md](DESIGN.md)。
