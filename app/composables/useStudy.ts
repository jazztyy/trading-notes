// 學習紀錄：已讀／待複習／已懂、星號、我的筆記、上次看的講義、選擇題作答紀錄。
// 全部存在使用者自己的瀏覽器（localStorage），key 一覽見 SPEC.md「瀏覽器儲存」。
//
// initOnMounted：預先產生的 HTML 一律用預設值，掛載後才讀 localStorage，避免 hydration 不一致。
// 無痕模式或儲存被封鎖時 VueUse 會退回記憶體中的值，網站照常運作。
import type { QuizRecord, StudyStatus } from '~/types/note'

const store = <T>(key: string, defaults: T) =>
  useLocalStorage<T>(key, defaults, { initOnMounted: true, mergeDefaults: false })

export const useStudy = () => {
  const status = store<Record<string, StudyStatus>>('tn-status', {})
  const stars = store<string[]>('tn-stars', [])
  const memos = store<Record<string, string>>('tn-memos', {})
  const last = store<string>('tn-last', '')
  const quiz = store<Record<string, QuizRecord>>('tn-quiz', {})

  const statusOf = (id: string): StudyStatus | undefined => status.value[id]

  const setStatus = (id: string, value: StudyStatus | undefined) => {
    const next = { ...status.value }
    if (value) next[id] = value
    else delete next[id]
    status.value = next
  }

  /** 打開一組時記成已讀；已經是待複習或已懂就不動 */
  const markRead = (id: string) => {
    if (!status.value[id]) setStatus(id, 'read')
    last.value = id
  }

  const isStarred = (id: string) => stars.value.includes(id)

  const toggleStar = (id: string) => {
    stars.value = isStarred(id) ? stars.value.filter(s => s !== id) : [...stars.value, id]
  }

  const memoOf = (id: string) => memos.value[id] ?? ''

  const setMemo = (id: string, text: string) => {
    const next = { ...memos.value }
    if (text.trim()) next[id] = text
    else delete next[id]
    memos.value = next
  }

  /** 記一題的作答結果；key 用 quizKey() */
  const recordAnswer = (key: string, correct: boolean) => {
    const prev = quiz.value[key] ?? { ok: 0, ng: 0, last: 'ok' }
    quiz.value = {
      ...quiz.value,
      [key]: correct ? { ...prev, ok: prev.ok + 1, last: 'ok' } : { ...prev, ng: prev.ng + 1, last: 'ng' },
    }
  }

  return { status, stars, memos, last, quiz, recordAnswer, statusOf, setStatus, markRead, isStarred, toggleStar, memoOf, setMemo }
}

export const STATUS_LABEL: Record<StudyStatus, string> = {
  read: '已讀',
  review: '待複習',
  known: '已懂',
}
