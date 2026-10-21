// 列出還沒歸進任何理論的組（沒隱藏、也不在任何 content/concepts/*.yml 的 notes 裡），一行一個 slug：npm run concept-todo
// 歸類規則見 ../prompts/concept.md

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

const NOTES = path.resolve(import.meta.dirname, '../content/notes')
const CONCEPTS = path.resolve(import.meta.dirname, '../content/concepts')

const owned = new Set()
if (existsSync(CONCEPTS)) {
  for (const file of readdirSync(CONCEPTS).filter(f => f.endsWith('.yml'))) {
    for (const id of parse(readFileSync(path.join(CONCEPTS, file), 'utf8')).notes ?? []) owned.add(String(id))
  }
}

for (const file of readdirSync(NOTES).filter(f => f.endsWith('.yml')).sort()) {
  const note = parse(readFileSync(path.join(NOTES, file), 'utf8'))
  if (!note.hidden && !owned.has(String(note.slug))) console.log(note.slug)
}
