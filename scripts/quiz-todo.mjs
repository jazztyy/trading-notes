// 列出還沒出選擇題的組（沒隱藏、也沒有 quiz 欄位），一行一個 slug：npm run quiz-todo
// 出題規則見 ../prompts/quiz.md

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const NOTES = path.resolve(import.meta.dirname, '../content/notes')

for (const file of readdirSync(NOTES).filter(f => f.endsWith('.yml')).sort()) {
  const note = parse(readFileSync(path.join(NOTES, file), 'utf8'))
  if (!note.hidden && note.quiz === undefined) console.log(note.slug)
}
