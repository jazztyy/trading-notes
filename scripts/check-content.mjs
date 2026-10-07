// 建置前的內容檢查：npm run check（npm run generate 會先跑）
// 檢查 content/notes/*.yml：
//   - slug 和檔名一致、沒有重複
//   - 沒隱藏的組：topic 在 topics.yml 裡、主標籤不在 excluded
//   - type 是四種之一
//   - 圖片與附件檔案存在於 public/
//   - 選擇題：4 個選項不重複、正解 0-3、有題目和解析
// 有錯就列出檔案與原因，結束代碼 1

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const ROOT = path.resolve(import.meta.dirname, '..')
const NOTES = path.join(ROOT, 'content/notes')
const TYPES = ['教學', '提問', '分析', '資源']

const { topics, excluded = [] } = parse(readFileSync(path.join(ROOT, 'content/topics.yml'), 'utf8'))
const topicNames = new Set(topics.map(t => t.name))

const errors = []
const seen = new Set()
let hidden = 0
let quizCount = 0

for (const file of readdirSync(NOTES).filter(f => f.endsWith('.yml'))) {
  const err = msg => errors.push(`content/notes/${file}：${msg}`)
  let note
  try {
    note = parse(readFileSync(path.join(NOTES, file), 'utf8'))
  }
  catch (e) {
    err(`YAML 格式錯誤 ${e.message}`)
    continue
  }
  if (String(note.slug) !== file.replace(/\.yml$/, '')) err(`slug ${note.slug} 和檔名不一致`)
  if (seen.has(note.slug)) err(`slug ${note.slug} 重複`)
  seen.add(note.slug)
  if (note.hidden) hidden++
  else quizCount += note.quiz?.length ?? 0
  if (!note.hidden && !topicNames.has(note.topic)) err(`topic「${note.topic}」不在 topics.yml（不要顯示的話設 hidden: true）`)
  if (!note.hidden && excluded.includes(note.tags?.[0])) err(`主標籤「${note.tags[0]}」在 excluded，應該設 hidden: true`)
  if (!TYPES.includes(note.type)) err(`type「${note.type}」不是 ${TYPES.join('／')}`)
  if (!note.messages?.length) err('沒有訊息')
  for (const [i, q] of (note.quiz ?? []).entries()) {
    if (!q.q || !q.e) err(`第 ${i + 1} 題缺題目或解析`)
    if (q.o?.length !== 4) err(`第 ${i + 1} 題要剛好 4 個選項`)
    if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < 4)) err(`第 ${i + 1} 題的正解 a 要是 0-3`)
    if (new Set(q.o).size !== q.o?.length) err(`第 ${i + 1} 題有重複選項`)
  }
  for (const m of note.messages ?? []) {
    for (const f of [...(m.images ?? []), ...(m.files ?? [])]) {
      if (!existsSync(path.join(ROOT, 'public', f.src))) err(`找不到檔案 public${f.src}`)
    }
  }
}

if (errors.length) {
  console.error(`內容檢查發現 ${errors.length} 個問題：\n${errors.map(e => `  - ${e}`).join('\n')}`)
  process.exit(1)
}
console.log(`內容檢查通過：${seen.size} 組（隱藏 ${hidden} 組），選擇題 ${quizCount} 題`)
