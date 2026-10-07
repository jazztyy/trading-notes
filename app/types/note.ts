// 元件用的型別，要和 content.config.ts 同步

export type NoteType = '教學' | '提問' | '分析' | '資源'

export interface NoteImage {
  src: string
  alt: string
}

export interface NoteFile extends NoteImage {
  name: string
}

export interface NoteMessage {
  id: string
  author: string
  teacher: boolean
  time: string
  text: string
  reply?: { id: string, author: string, text: string, inGroup: boolean }
  images?: NoteImage[]
  files?: NoteFile[]
}

/** 列表用的欄位（不含訊息） */
export interface NoteSummary {
  /** 第一則訊息的 Discord ID，網址 /n/{slug} */
  slug: string
  title: string
  type: NoteType
  topic: string
  tags: string[]
  teacher: string
  channel: string
  date: string
  url: string
  summary: string
}

export interface QuizItem {
  q: string
  o: string[]
  /** 正解在 o 的索引 */
  a: number
  /** 解析 */
  e: string
}

export interface Note extends NoteSummary {
  messages: NoteMessage[]
  quiz?: QuizItem[]
}

/** 複習頁用：列表欄位＋選擇題 */
export interface NoteWithQuiz extends NoteSummary {
  quiz: QuizItem[]
}

/** 一題的作答紀錄 */
export interface QuizRecord {
  ok: number
  ng: number
  last: 'ok' | 'ng'
}

export interface Topic {
  name: string
  desc: string
}

/** 學習狀態：已讀、待複習、已懂；沒有紀錄就是未讀 */
export type StudyStatus = 'read' | 'review' | 'known'
