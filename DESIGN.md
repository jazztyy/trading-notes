# 交易講義 設計系統

> 2026-10-07 ・ 對應 `app/assets/css/main.css`、`app/app.config.ts`、`app/components/`、`app/pages/`
>
> 色票、字級、元件寫法沿用悅讀聊天室（`~/Documents/sunday-salon/site/DESIGN.md`），這裡只寫不一樣的地方。改畫面前先讀這份。

## 1. 設計原則

1. **重點先行。** 每組討論最上面是黃底的「重點」，原始對話放在下面當佐證。
2. **主要發言者的話要一眼找到。** Shawnnnn、Alina、nick_AJ 的發言用金色左線＋淡金底、名字金色；其他人用一般底色、灰色名字。**不標示「講師」等身分。**
3. **學習狀態用形式表達。** 待複習是紅色、已懂是綠色、已讀是灰色，徽章一律附文字。已懂的卡片降低不透明度。
4. **暗色是預設**，和 TradingView 的暗色盤面一致；淺色主題也要能用。
5. **不用 emoji、不用漸層。**

## 2. 顏色

| 語意 | 用途 |
|---|---|
| primary（琥珀金） | 目前位置、重點框、主要發言者 |
| secondary（盤面藍） | 連結、@提及 |
| error | 待複習 |
| success | 已懂 |
| neutral | 已讀、類型徽章 |

額外語意色 `bg-primary-soft`（重點框、主要發言者底色、搜尋標亮）。

## 3. 元件目錄

| 元件 | 用途 |
|---|---|
| `SiteHeader` | 頂部列：站名、主題／複習／搜尋、深淺色切換 |
| `NoteCard` | 列表裡的一組（標題、類型、發言者、日期、重點三行、狀態與星號） |
| `NoteStatusBadge` | 學習狀態徽章 |
| `NoteStudyBar` | 一組的學習紀錄：狀態按鈕、星號、筆記 |
| `NoteMessages` | 原始對話；同一人 5 分鐘內連續發言只顯示一次名字；圖片點開用 `UModal` 看大圖 |

## 4. 實作規則

同悅讀聊天室 DESIGN.md 第 7 節：只用 Tailwind utility（不寫 hex、px 字級、inline style、`<style>`），Nuxt UI 優先，調整用 `ui` prop；內容查詢一律透過 `useContent.ts`；瀏覽器儲存一律透過 `useStudy()`；`<script setup lang="ts">`、箭頭函式。

## 5. 檢查清單

- [ ] 暗色、淺色都看過
- [ ] 390px 寬沒有橫向捲軸
- [ ] 可點的元素有 hover 變化與 focus 外框
- [ ] 狀態除了顏色也有文字
