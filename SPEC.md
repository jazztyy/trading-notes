# 交易講義 功能規格

> 2026-10-07 ・ 畫面規範見 [DESIGN.md](DESIGN.md)

## 1. 目的與讀者

讀者是 Kai 自己：把 Discord 群裡 Shawnnnn、Alina、nick_AJ 的教學整理成可以**系統性學習**的講義，並能追蹤哪些讀過、哪些還不熟。Kai 會直接說要改什麼，Claude 改 `content/` 或程式。

## 2. 網址

| 網址 | 頁面 |
|---|---|
| `/` | 首頁：整體進度、待複習數、上次看到哪裡、主題卡片（組數、發言者、讀過幾組） |
| `/t/{主題}` | 主題頁：該主題所有討論（含盤勢分析），依時間由舊到新；可用發言者、類型、狀態（全部／未讀／待複習／星號）篩選 |
| `/n/{slug}` | 一組討論：重點、學習紀錄、原始對話、同主題上一組／下一組。打開就記成已讀 |
| `/review` | 複習：選擇題，每輪 10 題。範圍可選全部主題、待複習、答錯過、星號或單一主題。答錯過的先出、再來沒做過的；選項順序每輪打亂。作答後顯示對錯與解析；這組任一題最近一次答錯 → 待複習，全部答對 → 已懂。一輪結束列出答錯的題目與連回原討論的連結 |
| `/memos` | 我的筆記：列出每一篇寫過的筆記（`tn-memos`），依主題分組，可以直接修改；「複製全部」把筆記整理成純文字（`# 主題` / `## 標題` / 筆記）放進剪貼簿 |
| `/search?q=` | 搜尋標題、重點、標籤、對話與圖說；空白分隔的關鍵字全部符合才算 |

## 3. 資料結構

### 3.1 `content/notes/{slug}.yml`

| 欄位 | 說明 |
|---|---|
| `slug` | 第一則訊息的 Discord ID，等於檔名。不叫 `id`，因為會和 Nuxt Content 內建的 `id` 撞名 |
| `title` | 標題，10-20 字 |
| `type` | `教學`、`提問`、`分析`、`資源` |
| `topic` | 歸在哪個主題，必須是 `topics.yml` 的 `name`（hidden 的組不限）。規則見 3.2 |
| `tags` | 1-3 個標籤，第一個是主標籤 |
| `teacher` | 主要發言者（Shawnnnn、Alina、nick_AJ 之中發言字數最多的） |
| `channel`、`date`、`url` | 頻道、日期（台北時間）、跳回 Discord 的連結 |
| `summary` | 重點，1-3 句 |
| `hidden` | `true` 就不顯示 |
| `quiz[]` | 選擇題 `{q, o[4], a, e}`（題目、選項、正解索引 0-3、解析），依 `../prompts/quiz.md` 由 agent 出題。沒有這個欄位 = 還沒出題（`npm run quiz-todo` 會列出來）；`[]` = 沒有可以考的 |
| `messages[]` | `id`、`author`、`teacher`、`time`、`text`，可能有 `reply`（被回覆的訊息摘要，`inGroup` 表示可以跳過去）、`images[]`（`src`、`alt`）、`files[]`（`src`、`alt`、`name`） |

主要發言者用 Discord 使用者 ID 認人（`../lib/groups.mjs` 的 `TEACHER_IDS`），暱稱改了也認得。

### 3.2 `content/topics.yml`

`topics[]`（`name`、`desc`，順序大致由基礎到進階）、`teachers[]`（主要發言者）、`excluded[]`（拿掉的主題）。

歸主題的規則（`build-site.mjs` 產生新組時套用）：

1. 主標籤（`tags` 第一個）在 `excluded` → `hidden: true`
2. 否則 `topic` = 第一個在 `topics` 裡的標籤
3. 都不在 → `hidden: true`

畫面上的標籤只顯示 `topics` 裡有的。

### 3.3 內容取捨紀錄

2026-10-07 Kai 拿掉：「下單工具」「程式交易」兩個主題、「盤勢日誌」（分析類改依標籤分到各主題），以及 24 組個別討論（TradingView 操作、Pine 腳本、外部分析師轉述、個股／ETF 等）。同類內容在 `../prompts/filter.md` 的「不收」裡排除。畫面上不標示「講師」。

## 4. 內容檢查（`npm run check`）

- `slug` 和檔名一致、不重複
- 沒隱藏的組：`topic` 在 `topics.yml` 裡、主標籤不在 `excluded`
- `type` 是四種之一
- 每組至少一則訊息；圖片與附件檔案存在於 `public/`
- 選擇題：4 個選項不重複、正解 0-3、有題目和解析

## 5. 瀏覽器儲存（localStorage）

全部透過 `useStudy()`，存在 Kai 自己的瀏覽器，不跨裝置。`initOnMounted`：預先產生的 HTML 用預設值，掛載後才讀，避免 hydration 不一致。

| Key | 內容 |
|---|---|
| `tn-status` | `{slug: 'read' \| 'review' \| 'known'}`，沒有紀錄就是未讀 |
| `tn-stars` | 加星號的 slug 陣列 |
| `tn-memos` | `{slug: 筆記}` |
| `tn-last` | 上次打開的 slug |
| `tn-quiz` | 選擇題作答紀錄 `{quizKey: {ok, ng, last}}`，`quizKey` = `{slug}:{題目文字雜湊}`（`utils/quizKey.ts`）。改了題目文字，那題的紀錄就重來 |

學習紀錄用 `slug` 當 key，改標題、重點都不影響；**改 slug（檔名）會讓那組的紀錄消失**，所以 slug 不改。

## 6. 發佈

- 公開 repo `jazztyy/trading-notes`（這個 `site/` 資料夾），GitHub Pages：https://jazztyy.github.io/trading-notes/
- push 到 `main` 自動部署（`.github/workflows/deploy.yml`，`NUXT_APP_BASE_URL=/trading-notes/`）
- 網址有前綴，content 裡的 `/img/…`、`/files/…` 一律透過 `useAsset()` 加前綴
- 不讓搜尋引擎收錄：`<meta name="robots" content="noindex">` 與 `public/robots.txt`
- Kai 確認過：網站公開（拿到網址就能看），其他成員保留原名
- localStorage 和悅讀聊天室同在 `jazztyy.github.io`，key 一律用 `tn-` 開頭（深淺色是 `tn-color-mode`）

## 7. 更新流程

在 `discord-export/` 跑 `/update-notes`：

1. `npm run update`：只抓上次之後的新訊息
2. `npm run chunks`：只把還沒整理過的訊息切成新 chunk
3. 每個新 chunk 開一個 agent 篩選成 `work/result-N.json`（`prompts/filter.md`）
4. `npm run site`：新的組寫進 `site/content/notes/`，舊檔不動
5. `cd site && npm run quiz-todo` 列出還沒出題的組，交給 agent 依 `prompts/quiz.md` 出題
6. `cd site && npm run check`
7. `cd site && git add -A && git commit && git push`：自動部署

## 修改紀錄

- 2026-10-07：第一版。
- 2026-10-07：加「筆記」分頁（`/memos`）。
- 2026-10-07：發佈到 GitHub Pages。
- 2026-10-07：複習改成選擇題（`quiz` 欄位、`tn-quiz`）。
- 2026-10-07：拿掉盤勢日誌、下單工具、程式交易與 24 組討論；加 `excluded`；不標示講師。
