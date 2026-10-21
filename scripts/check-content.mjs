// 建置前的內容檢查：npm run check（npm run generate 會先跑）
// 檢查 content/notes/*.yml：
//   - slug 和檔名一致、沒有重複、不在 removed.yml（移除的組不應該再出現）
//   - 沒隱藏的組：topic 在 topics.yml 裡、主標籤不在 excluded
//   - type 是四種之一
//   - 圖片與附件檔案存在於 public/
//   - 選擇題：4 個選項不重複、正解 0-3、有題目和解析
// 檢查 content/concepts/*.yml（理論）：
//   - slug 和檔名一致（英文小寫、數字、連字號）、topic 在 topics.yml 裡、同主題的 order 不重複、有重點和說明
//   - 說明每段有小標題和內文；截圖的 from 在這個理論的 notes 裡，而且那組討論真的有這張圖
//   - notes 裡的組都存在、沒隱藏、沒有被兩個理論重複收
//   - 每組沒隱藏的討論都屬於剛好一個理論，而且 topic 和理論一樣
// 有錯就列出檔案與原因，結束代碼 1

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const ROOT = path.resolve(import.meta.dirname, '..')
const NOTES = path.join(ROOT, 'content/notes')
const CONCEPTS = path.join(ROOT, 'content/concepts')
const TYPES = ['教學', '提問', '分析', '資源']

const { topics, excluded = [] } = parse(readFileSync(path.join(ROOT, 'content/topics.yml'), 'utf8'))
const topicNames = new Set(topics.map(t => t.name))
const removedFile = path.join(ROOT, 'content/removed.yml')
const removed = new Set(existsSync(removedFile) ? (parse(readFileSync(removedFile, 'utf8')).removed ?? []).map(r => String(r.slug)) : [])

const errors = []
const seen = new Set()
/** slug → 沒隱藏的組的 topic */
const visible = new Map()
/** slug → 這組討論裡的圖片路徑 */
const imagesOf = new Map()
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
  if (removed.has(String(note.slug))) err('這組在 removed.yml 裡，應該刪掉這個檔案')
  seen.add(note.slug)
  if (note.hidden) hidden++
  else {
    quizCount += note.quiz?.length ?? 0
    visible.set(String(note.slug), note.topic)
    imagesOf.set(String(note.slug), new Set((note.messages ?? []).flatMap(m => (m.images ?? []).map(i => i.src))))
  }
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

// 理論
/** 組的 slug → 收它的理論 */
const owner = new Map()
const orders = new Set()
const conceptFiles = existsSync(CONCEPTS) ? readdirSync(CONCEPTS).filter(f => f.endsWith('.yml')) : []
for (const file of conceptFiles) {
  const err = msg => errors.push(`content/concepts/${file}：${msg}`)
  let c
  try {
    c = parse(readFileSync(path.join(CONCEPTS, file), 'utf8'))
  }
  catch (e) {
    err(`YAML 格式錯誤 ${e.message}`)
    continue
  }
  const slug = file.replace(/\.yml$/, '')
  if (c.slug !== slug) err(`slug ${c.slug} 和檔名不一致`)
  if (!/^[a-z0-9-]+$/.test(slug)) err('檔名只能用英文小寫、數字和連字號')
  if (!topicNames.has(c.topic)) err(`topic「${c.topic}」不在 topics.yml`)
  if (!Number.isInteger(c.order)) err('order 要是整數')
  else if (orders.has(`${c.topic}#${c.order}`)) err(`「${c.topic}」裡 order ${c.order} 重複`)
  orders.add(`${c.topic}#${c.order}`)
  if (!c.title || !c.summary) err('缺 title 或 summary')
  if (!c.sections?.length) err('沒有 sections（說明）')
  for (const [i, sec] of (c.sections ?? []).entries()) {
    if (!sec.heading) err(`第 ${i + 1} 段沒有 heading`)
    if (!sec.text?.length && !sec.items?.length) err(`第 ${i + 1} 段「${sec.heading}」沒有內文`)
    for (const f of sec.figures ?? []) {
      if (!f.caption) err(`第 ${i + 1} 段的圖 ${f.src} 沒有 caption`)
      if (!(c.notes ?? []).map(String).includes(String(f.from))) err(`圖 ${f.src} 的 from ${f.from} 不在這個理論的 notes 裡`)
      else if (!imagesOf.get(String(f.from))?.has(f.src)) err(`圖 ${f.src} 不在討論 ${f.from} 裡`)
      if (!existsSync(path.join(ROOT, 'public', f.src ?? ''))) err(`找不到檔案 public${f.src}`)
    }
  }
  if (!c.notes?.length) err('沒有 notes（補充討論）')
  for (const id of (c.notes ?? []).map(String)) {
    if (!visible.has(id)) err(`notes 裡的 ${id} 不存在或已隱藏`)
    else if (owner.has(id)) err(`${id} 也在 ${owner.get(id)}，一組只能屬於一個理論`)
    else {
      owner.set(id, `content/concepts/${file}`)
      if (visible.get(id) !== c.topic) err(`${id} 的 topic 是「${visible.get(id)}」，和理論的「${c.topic}」不一樣`)
    }
  }
}
const orphans = [...visible.keys()].filter(id => !owner.has(id))
if (orphans.length) {
  errors.push(`${orphans.length} 組還沒歸進任何理論（npm run concept-todo 列出來，規則見 ../prompts/concept.md）：${orphans.join('、')}`)
}

if (errors.length) {
  console.error(`內容檢查發現 ${errors.length} 個問題：\n${errors.map(e => `  - ${e}`).join('\n')}`)
  process.exit(1)
}
console.log(`內容檢查通過：理論 ${conceptFiles.length} 個，討論 ${seen.size} 組（隱藏 ${hidden} 組），選擇題 ${quizCount} 題`)
