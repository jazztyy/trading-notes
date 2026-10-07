// 讀取內容的共用入口：講義（notes）與主題（topics）。所有頁面和元件都透過這裡查詢，不要直接呼叫 queryCollection。
// 靜態輸出時這些查詢在建置階段執行，結果存進頁面 payload，瀏覽器端不需要資料庫。
import type { Note, NoteSummary, NoteWithQuiz, Topic } from '~/types/note'

const SUMMARY_FIELDS = ['slug', 'title', 'type', 'topic', 'tags', 'teacher', 'channel', 'date', 'url', 'summary'] as const

/** 依日期、再依 slug（= 第一則訊息的時間）由舊到新 */
const byTime = (a: NoteSummary, b: NoteSummary) =>
  a.date.localeCompare(b.date) || (BigInt(a.slug) < BigInt(b.slug) ? -1 : 1)

/** 所有講義的列表欄位（不含訊息），hidden 的不算 */
export const useAllNotes = () =>
  useAsyncData('notes:all', async () => {
    const items = await queryCollection('notes').where('hidden', '=', false).select(...SUMMARY_FIELDS).all()
    return (items as unknown as NoteSummary[]).sort(byTime)
  }, { default: () => [] as NoteSummary[] })

/** 有選擇題的講義（複習頁用，不含訊息） */
export const useQuizNotes = () =>
  useAsyncData('notes:quiz', async () => {
    const items = await queryCollection('notes').where('hidden', '=', false).select(...SUMMARY_FIELDS, 'quiz').all()
    return (items as unknown as NoteWithQuiz[]).filter(n => n.quiz?.length).sort(byTime)
  }, { default: () => [] as NoteWithQuiz[] })

/** 所有講義含訊息（搜尋用，資料量大，只在搜尋頁用） */
export const useAllNotesFull = () =>
  useAsyncData('notes:full', async () => {
    const items = await queryCollection('notes').where('hidden', '=', false).all()
    return (items as unknown as Note[]).sort(byTime)
  }, { default: () => [] as Note[] })

/** 單組講義 */
export const useNote = (slug: string) =>
  useAsyncData(`note:${slug}`, async () => {
    const item = await queryCollection('notes').where('slug', '=', slug).first()
    return item && !item.hidden ? (item as unknown as Note) : null
  })

/** 主題（依 topics.yml 的順序）與主要發言者 */
export const useTopics = () =>
  useAsyncData('topics', async () => {
    const item = await queryCollection('topics').first()
    return { topics: (item?.topics ?? []) as Topic[], teachers: (item?.teachers ?? []) as string[] }
  }, { default: () => ({ topics: [] as Topic[], teachers: [] as string[] }) })

/** 主題頁網址 */
export const topicPath = (name: string) => `/t/${encodeURIComponent(name)}`
