<script setup lang="ts">
// /review 複習：選擇題。每輪最多 ROUND 題，答錯過的先出、再來沒做過的，其他的排後面（各段內打亂）。
// 範圍：待複習、答錯過、星號、全部主題、單一主題。選項順序每輪打亂。
// 作答後：記進 tn-quiz；這組任一題最近一次答錯 → 待複習，全部最近一次都答對 → 已懂。
// 出題順序在掛載後才決定（預先產生的 HTML 不含題目），避免 hydration 不一致。
import type { NoteWithQuiz, QuizItem } from '~/types/note'

useSeoMeta({ title: '複習・交易講義' })

const ROUND = 10

const { data: notes } = await useQuizNotes()
const { data: meta } = await useTopics()

const study = useStudy()

type Question = QuizItem & { key: string, note: NoteWithQuiz, order: number[] }

const keyOf = (n: NoteWithQuiz, q: QuizItem) => quizKey(n.slug, q.q)
const lastOf = (key: string) => study.quiz.value[key]?.last

const scope = ref('all')

const scopes = computed(() => [
  { value: 'all', label: '全部主題' },
  { value: 'review', label: '待複習' },
  { value: 'wrong', label: '答錯過' },
  { value: 'star', label: '星號' },
  ...meta.value.topics
    .filter(t => notes.value.some(n => n.topic === t.name))
    .map(t => ({ value: `t:${t.name}`, label: t.name })),
])

/** 這個範圍的所有題目 */
const pool = computed(() => {
  const all = notes.value.flatMap(n => n.quiz.map(q => ({ ...q, key: keyOf(n, q), note: n })))
  if (scope.value === 'review') return all.filter(x => study.statusOf(x.note.slug) === 'review')
  if (scope.value === 'wrong') return all.filter(x => lastOf(x.key) === 'ng')
  if (scope.value === 'star') return all.filter(x => study.isStarred(x.note.slug))
  if (scope.value.startsWith('t:')) return all.filter(x => x.note.topic === scope.value.slice(2))
  return all
})

const shuffle = <T>(list: T[]) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

// 一輪：開始時固定題目、順序與選項排列（作答會改變 pool，所以不能直接用 pool）
const deck = ref<Question[]>([])
const pos = ref(0)
const picked = ref<number | null>(null)
const results = ref<boolean[]>([])
const started = ref(false)

const start = () => {
  const wrong = pool.value.filter(x => lastOf(x.key) === 'ng')
  const fresh = pool.value.filter(x => !lastOf(x.key))
  const done = pool.value.filter(x => lastOf(x.key) === 'ok')
  deck.value = [...shuffle(wrong), ...shuffle(fresh), ...shuffle(done)]
    .slice(0, ROUND)
    .map(x => ({ ...x, order: shuffle([0, 1, 2, 3]) }))
  pos.value = 0
  picked.value = null
  results.value = []
  started.value = true
}

onMounted(start)
watch(scope, start)

const current = computed(() => deck.value[pos.value])
const finished = computed(() => started.value && deck.value.length > 0 && pos.value >= deck.value.length)
const answered = computed(() => picked.value !== null)
const score = computed(() => results.value.filter(Boolean).length)

/** 依這組每一題最近一次的結果，更新這組的學習狀態 */
const updateStatus = (note: NoteWithQuiz) => {
  const lasts = note.quiz.map(q => lastOf(keyOf(note, q)))
  if (lasts.includes('ng')) study.setStatus(note.slug, 'review')
  else if (lasts.every(l => l === 'ok')) study.setStatus(note.slug, 'known')
}

const pick = (option: number) => {
  const q = current.value
  if (!q || answered.value) return
  picked.value = option
  const correct = option === q.a
  results.value.push(correct)
  study.recordAnswer(q.key, correct)
  updateStatus(q.note)
}

const next = () => {
  pos.value++
  picked.value = null
}

/** 選項的樣式：作答前可選；作答後正解綠、選錯的紅、其他淡化 */
const optionClass = (option: number) => {
  const q = current.value
  if (!q || !answered.value) return 'border-default bg-default hover:border-secondary/70 hover:bg-accented'
  if (option === q.a) return 'border-success bg-success-soft text-highlighted'
  if (option === picked.value) return 'border-error bg-error-soft text-highlighted'
  return 'border-default opacity-60'
}

const wrongList = computed(() => deck.value.filter((_, i) => results.value[i] === false))
</script>

<template>
  <div>
    <SiteHeader />

    <main class="mx-auto flex max-w-[760px] flex-col gap-6 px-4 pt-7 pb-16">
      <header class="flex flex-col gap-2">
        <h1 class="text-h1 leading-tight font-bold text-highlighted">複習</h1>
        <p class="text-body text-muted">每輪 {{ ROUND }} 題選擇題，答錯過的會先出。答錯的那組會標成「待複習」，全部答對就標成「已懂」。</p>
      </header>

      <div role="group" aria-label="複習範圍" class="flex flex-wrap gap-1.5">
        <UButton
          v-for="s in scopes"
          :key="s.value"
          :label="s.label"
          color="neutral"
          :variant="scope === s.value ? 'solid' : 'outline'"
          size="xs"
          :aria-pressed="scope === s.value"
          class="rounded-full px-3"
          :ui="{ label: 'text-ui font-medium' }"
          @click="scope = s.value"
        />
      </div>

      <p v-if="started && !deck.length" class="rounded-card border border-dashed border-default p-6 text-center text-small text-muted">
        這個範圍沒有題目。
      </p>

      <section v-else-if="finished" aria-label="這輪結果" class="flex flex-col gap-4 rounded-sheet border border-default bg-elevated p-5 sm:p-7">
        <div class="flex flex-col items-center gap-1 text-center">
          <p class="text-ui text-muted">這輪答對</p>
          <p class="font-mono text-h1 font-medium text-highlighted">{{ score }}<span class="text-title text-muted"> / {{ deck.length }}</span></p>
        </div>

        <div v-if="wrongList.length" class="flex flex-col gap-2">
          <h2 class="text-small font-bold text-error">答錯的題目</h2>
          <ul class="flex flex-col gap-2">
            <li v-for="q in wrongList" :key="q.key">
              <NuxtLink
                :to="`/n/${q.note.slug}`"
                class="flex flex-col gap-1 rounded-card border border-default p-3 transition-colors hover:border-secondary/70 hover:bg-accented"
              >
                <span class="text-small font-medium text-highlighted">{{ q.q }}</span>
                <span class="text-meta text-success">正解：{{ q.o[q.a] }}</span>
                <span class="text-meta text-secondary">回去看「{{ q.note.title }}」→</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <UButton label="再來一輪" icon="i-lucide-refresh-cw" color="primary" variant="soft" class="self-center rounded-full" @click="start" />
      </section>

      <article v-else-if="current" class="flex flex-col gap-4 rounded-sheet border border-default bg-elevated p-5 sm:p-7">
        <div class="flex items-center justify-between gap-3 text-meta text-muted">
          <span class="truncate">{{ current.note.topic }} · {{ current.note.title }}</span>
          <span class="shrink-0 font-mono">{{ pos + 1 }} / {{ deck.length }}</span>
        </div>

        <h2 class="text-title leading-snug font-bold text-highlighted">{{ current.q }}</h2>

        <ol class="flex flex-col gap-2">
          <li v-for="(option, i) in current.order" :key="option">
            <button
              type="button"
              :disabled="answered"
              class="flex w-full items-start gap-3 rounded-card border p-3 text-left transition-colors"
              :class="optionClass(option)"
              @click="pick(option)"
            >
              <span class="shrink-0 font-mono text-ui font-medium text-muted">{{ 'ABCD'[i] }}</span>
              <span class="flex-1 text-body-sm">{{ current.o[option] }}</span>
              <UIcon v-if="answered && option === current.a" name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-success" />
              <UIcon v-else-if="answered && option === picked" name="i-lucide-x" class="mt-0.5 size-4 shrink-0 text-error" />
            </button>
          </li>
        </ol>

        <div v-if="answered" class="flex flex-col gap-3" aria-live="polite">
          <div class="rounded-card p-4" :class="picked === current.a ? 'bg-success-soft' : 'bg-error-soft'">
            <p class="mb-1 text-ui font-bold" :class="picked === current.a ? 'text-success' : 'text-error'">
              {{ picked === current.a ? '答對了' : '答錯了' }}
            </p>
            <p class="text-body-sm leading-relaxed text-highlighted">{{ current.e }}</p>
          </div>
          <div class="flex items-center justify-between gap-3">
            <NuxtLink :to="`/n/${current.note.slug}`" class="text-ui text-secondary underline-offset-2 hover:underline">看原始對話 →</NuxtLink>
            <UButton
              :label="pos + 1 < deck.length ? '下一題' : '看結果'"
              trailing-icon="i-lucide-arrow-right"
              color="primary"
              class="rounded-full"
              @click="next"
            />
          </div>
        </div>
      </article>
    </main>
  </div>
</template>
