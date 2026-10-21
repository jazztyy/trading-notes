# 交易講義 功能規格

> 2026-10-07 ・ 畫面規範見 [DESIGN.md](DESIGN.md)

## 1. 目的與讀者

讀者是 Kai 自己：把 Discord 群裡 Shawnnnn、Alina、nick_AJ 的教學整理成可以**系統性學習**的講義，並能追蹤哪些讀過、哪些還不熟。Kai 會直接說要改什麼，Claude 改 `content/` 或程式。

內容分兩層：**理論**是整理好的觀念說明（同一個觀念散在好幾次對話裡，合併成一篇，配上當時的 TV 截圖），**討論**是原始對話，每組討論都屬於一個理論，在理論頁最下面列成出處。理論頁要讓人不看原始對話也能學會。

## 2. 網址

| 網址 | 頁面 |
|---|---|
| `/` | 首頁：讀過幾個理論、待複習數、上次看到哪裡（理論或討論）、主題卡片（讀過幾個理論 / 理論數） |
| `/t/{主題}` | 主題頁：該主題的理論，依 `order` 由基礎到進階；讀過幾個理論；每個理論顯示重點、已讀狀態、原始對話組數 |
| `/c/{slug}` | 理論（打開就記成已讀）：重點、分段說明（附當時的 TV 截圖，圖說下有出處連結，點圖看大圖）、注意；最下面是收起來的出處清單（原始對話的日期與標題）；同主題上一個／下一個理論 |
| `/n/{slug}` | 一組討論：所屬理論、重點、學習紀錄、原始對話、同理論的上一組／下一組。打開就記成已讀 |
| `/review` | 複習：選擇題，每輪 10 題。範圍可選全部主題、待複習、答錯過、星號或單一主題。答錯過的先出、再來沒做過的；選項順序每輪打亂。作答後顯示對錯與解析；這組任一題最近一次答錯 → 待複習，全部答對 → 已懂。一輪結束列出答錯的題目與連回原討論的連結 |
| `/memos` | 我的筆記：列出每一篇寫過的筆記（`tn-memos`），依主題分組，可以直接修改；「複製全部」把筆記整理成純文字（`# 主題` / `## 標題` / 筆記）放進剪貼簿 |
| `/search?q=` | 搜尋理論（標題、重點、說明、圖說、注意）和討論（標題、重點、標籤、對話與圖說）；空白分隔的關鍵字全部符合才算 |

## 3. 資料結構

### 3.1 `content/notes/{slug}.yml`

| 欄位 | 說明 |
|---|---|
| `slug` | 第一則訊息的 Discord ID，等於檔名。不叫 `id`，因為會和 Nuxt Content 內建的 `id` 撞名 |
| `title` | 標題，10-20 字 |
| `type` | `教學`、`提問`、`分析`、`資源` |
| `topic` | 歸在哪個主題，必須是 `topics.yml` 的 `name`（hidden 的組不限），而且要和所屬理論的 `topic` 一樣。新組的初始值見 3.2，歸進理論時改成理論的主題 |
| `tags` | 1-3 個標籤，第一個是主標籤 |
| `teacher` | 主要發言者（Shawnnnn、Alina、nick_AJ 之中發言字數最多的） |
| `channel`、`date`、`url` | 頻道、日期（台北時間）、跳回 Discord 的連結 |
| `summary` | 重點，1-3 句 |
| `hidden` | `true` 就不顯示（保留給暫時藏起來用；Kai 不要的組直接刪檔並記進 `removed.yml`） |
| `quiz[]` | 選擇題 `{q, o[4], a, e}`（題目、選項、正解索引 0-3、解析），依 `../prompts/quiz.md` 由 agent 出題。沒有這個欄位 = 還沒出題（`npm run quiz-todo` 會列出來）；`[]` = 沒有可以考的 |
| `messages[]` | `id`、`author`、`teacher`、`time`、`text`，可能有 `reply`（被回覆的訊息摘要，`inGroup` 表示可以跳過去）、`images[]`（`src`、`alt`）、`files[]`（`src`、`alt`、`name`） |

主要發言者用 Discord 使用者 ID 認人（`../lib/groups.mjs` 的 `TEACHER_IDS`），暱稱改了也認得。主講者不是這三位的組預設不收；Kai 指定要收的，在 `../work/result-N.json` 那組加 `"include": true`。

### 3.1.1 `content/concepts/{slug}.yml`（理論）

手動維護，格式與寫法見 `../prompts/concept.md`（範本 `content/concepts/ema200.yml`）；新的組由 agent 依同一份文件歸進來，必要時補充說明或新增理論。

| 欄位 | 說明 |
|---|---|
| `slug` | 等於檔名，英文小寫、數字、連字號。網址 `/c/{slug}` |
| `title` | 標題，10-20 字 |
| `topic` | 歸在哪個主題，必須是 `topics.yml` 的 `name` |
| `order` | 在主題裡的順序（由基礎到進階），同主題不重複 |
| `summary` | 重點，一兩句講完這個理論 |
| `sections[]` | 說明，3-5 段：`heading`（小標題）、`text[]`（段落）、`items[]`（條列）、`figures[]`（TV 截圖：`src` 討論裡的圖片路徑、`caption` 這張圖要看什麼、`from` 出自哪組討論） |
| `cautions[]` | 注意：容易犯的錯 |
| `notes[]` | 出處：屬於這個理論的討論 slug，依時間由舊到新。每組沒隱藏的討論剛好屬於一個理論 |

### 3.2 `content/topics.yml`

`topics[]`（`name`、`desc`，順序大致由基礎到進階）、`teachers[]`（主要發言者）、`excluded[]`（拿掉的主題）。

歸主題的規則（`build-site.mjs` 產生新組時套用）：

1. slug 在 `content/removed.yml` → 不寫入
2. 主標籤（`tags` 第一個）在 `excluded` → 不寫入
3. 否則 `topic` = 第一個在 `topics` 裡的標籤；都不在 → 不寫入

### 3.2.1 `content/removed.yml`

Kai 移除的組（`slug`、`title`）。這些組的檔案和只有它們用到的圖片已經刪掉，也從所屬理論的 `notes` 拿掉；`build-site.mjs` 看到就跳過，`npm run check` 發現它們又出現會報錯。

畫面上的標籤只顯示 `topics` 裡有的。

### 3.3 內容取捨紀錄

2026-10-07 Kai 拿掉：「下單工具」「程式交易」兩個主題、「盤勢日誌」（分析類改依標籤分到各主題），以及 24 組個別討論（TradingView 操作、Pine 腳本、外部分析師轉述、個股／ETF 等）。同類內容在 `../prompts/filter.md` 的「不收」裡排除。畫面上不標示「講師」。

## 4. 內容檢查（`npm run check`）

- `slug` 和檔名一致、不重複
- 沒隱藏的組：`topic` 在 `topics.yml` 裡、主標籤不在 `excluded`
- `type` 是四種之一
- 每組至少一則訊息；圖片與附件檔案存在於 `public/`
- 選擇題：4 個選項不重複、正解 0-3、有題目和解析
- 理論：`slug` 和檔名一致、`topic` 在 `topics.yml` 裡、同主題 `order` 不重複、有重點和說明（每段有小標題和內文）；截圖的 `from` 在 `notes` 裡、那組討論真的有這張圖、檔案存在；`notes` 裡的組都存在且沒隱藏、不被兩個理論重複收
- 每組沒隱藏的討論都屬於剛好一個理論，`topic` 和理論一樣（`npm run concept-todo` 列出還沒歸類的）

## 5. 瀏覽器儲存（localStorage）

全部透過 `useStudy()`，存在 Kai 自己的瀏覽器，不跨裝置。`initOnMounted`：預先產生的 HTML 用預設值，掛載後才讀，避免 hydration 不一致。

| Key | 內容 |
|---|---|
| `tn-status` | `{slug: 'read' \| 'review' \| 'known'}`，沒有紀錄就是未讀。討論和理論共用（理論的 slug 是英文、討論是數字，不會撞） |
| `tn-stars` | 加星號的 slug 陣列 |
| `tn-memos` | `{slug: 筆記}` |
| `tn-last` | 上次打開的討論或理論的 slug |
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
6. `cd site && npm run concept-todo` 列出還沒歸進理論的組，交給一個 agent 依 `prompts/concept.md` 歸類
7. `cd site && npm run check`
8. `cd site && git add -A && git commit && git push`：自動部署

## 修改紀錄

- 2026-10-07：第一版。
- 2026-10-07：隱藏的 86 組改成直接刪除（檔案與圖片），記進 `removed.yml`。
- 2026-10-07：加「筆記」分頁（`/memos`）。
- 2026-10-07：發佈到 GitHub Pages。
- 2026-10-07：複習改成選擇題（`quiz` 欄位、`tn-quiz`）。
- 2026-10-07：拿掉盤勢日誌、下單工具、程式交易與 24 組討論；加 `excluded`；不標示講師。
- 2026-10-21：加「理論」（`content/concepts/`、`/c/{slug}`）：165 組討論整理成 36 個理論，主題頁改列理論，討論變成理論的補充；49 組討論的 `topic` 跟著理論調整。
- 2026-10-21：理論改成分段說明（`sections`）並附當時的 TV 截圖，取代條列的 `points`；原始對話在理論頁收成出處清單。
