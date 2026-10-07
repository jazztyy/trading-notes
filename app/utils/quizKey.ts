// 選擇題作答紀錄的 key：{slug}:{題目文字雜湊}。
// 用題目文字雜湊而不是索引，調整題目順序不影響；改了題目文字，那題的紀錄就重來。

/** 32 位元 FNV-1a 雜湊，轉成 base36 */
export const textHash = (text: string): string => {
  let h = 0x811C9DC5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

export const quizKey = (slug: string, q: string) => `${slug}:${textHash(q)}`
