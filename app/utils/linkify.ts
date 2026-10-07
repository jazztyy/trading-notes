// 把訊息文字切成一般文字、網址、@提及，讓模板分別顯示（不用 v-html）

export type TextPart = { kind: 'text' | 'url' | 'mention', value: string }

const PATTERN = /(https?:\/\/[^\s<>()]+)|(@[^\s@]+)/g

export const linkify = (text: string): TextPart[] => {
  const parts: TextPart[] = []
  let cursor = 0
  for (const m of text.matchAll(PATTERN)) {
    const at = m.index ?? 0
    if (at > cursor) parts.push({ kind: 'text', value: text.slice(cursor, at) })
    parts.push({ kind: m[1] ? 'url' : 'mention', value: m[0] })
    cursor = at + m[0].length
  }
  if (cursor < text.length) parts.push({ kind: 'text', value: text.slice(cursor) })
  return parts
}
