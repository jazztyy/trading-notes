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

/** 理論說明裡的一張 TV 截圖 */
export interface ConceptFigure {
  src: string
  /** 這張圖要看什麼 */
  caption: string
  /** 出自哪組討論（slug） */
  from: string
}

/** 理論說明的一段 */
export interface ConceptSection {
  heading: string
  text: string[]
  items: string[]
  figures: ConceptFigure[]
}

/** 理論：同一個觀念的整理，底下的討論是它的出處 */
export interface Concept {
  /** = 檔名，網址 /c/{slug} */
  slug: string
  title: string
  topic: string
  /** 在主題裡的順序 */
  order: number
  summary: string
  sections: ConceptSection[]
  cautions: string[]
  /** 屬於這個理論的討論 slug，依時間由舊到新 */
  notes: string[]
}

/** 學習狀態：已讀、待複習、已懂；沒有紀錄就是未讀 */
export type StudyStatus = 'read' | 'review' | 'known'
