<script setup lang="ts">
// /search：搜尋理論（標題、重點、說明、圖說、注意）與討論（標題、重點、對話內文與圖說）。多個關鍵字用空白分開，全部符合才算。
// 關鍵字同步到網址 ?q=，方便分享或回上一頁。
import type { Concept, Note } from '~/types/note'

useSeoMeta({ title: '搜尋・交易講義' })

const { data: notes } = await useAllNotesFull()
const { data: concepts } = await useConcepts()

const router = useRouter()
const q = ref('')
const query = refDebounced(q, 200)

onMounted(() => {
  q.value = new URLSearchParams(window.location.search).get('q') ?? ''
})

watch(query, (v) => {
  router.replace({ query: v.trim() ? { q: v.trim() } : {} })
})

const terms = computed(() => query.value.trim().toLowerCase().split(/\s+/).filter(Boolean))

const textOf = (n: Note) =>
  [n.title, n.summary, n.tags.join(' '), ...n.messages.flatMap(m => [m.text, ...(m.images ?? []).map(i => i.alt)])]
    .join('\n')
    .toLowerCase()

const index = computed(() => notes.value.map(n => ({ note: n, text: textOf(n) })))

const conceptText = (c: Concept) =>
  [c.title, c.summary, ...c.sections.flatMap(s => [s.heading, ...s.text, ...s.items, ...s.figures.map(f => f.caption)]), ...c.cautions]
    .join('\n')
    .toLowerCase()

const conceptIndex = computed(() => concepts.value.map(c => ({ concept: c, text: conceptText(c) })))

const conceptResults = computed(() => {
  if (!terms.value.length) return []
  return conceptIndex.value.filter(x => terms.value.every(t => x.text.includes(t))).map(x => x.concept)
})

/** 對話裡符合關鍵字的訊息，最多 2 則 */
const hitsOf = (n: Note) =>
  n.messages
    .filter(m => terms.value.some(t => m.text.toLowerCase().includes(t)))
    .slice(0, 2)

const results = computed(() => {
  if (!terms.value.length) return []
  return index.value
    .filter(x => terms.value.every(t => x.text.includes(t)))
    .map(x => ({ note: x.note, hits: hitsOf(x.note) }))
    .reverse()
})

/** 把文字切成符合／不符合的片段，用來標亮關鍵字 */
const mark = (text: string) => {
  if (!terms.value.length) return [{ hit: false, value: text }]
  const escaped = terms.value.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return text.split(new RegExp(`(${escaped.join('|')})`, 'gi')).filter(Boolean)
    .map(value => ({ hit: terms.value.includes(value.toLowerCase()), value }))
}

const SUGGEST = ['EMA', '停損', '前高', '開盤', '2分K', '動態指標', '回踩']
</script>

<template>
  <div>
    <SiteHeader />

    <main class="mx-auto flex max-w-[760px] flex-col gap-5 px-4 pt-7 pb-16">
      <h1 class="text-h1 leading-tight font-bold text-highlighted">搜尋</h1>

      <UInput
        v-model="q"
        icon="i-lucide-search"
        placeholder="例如：停損 EMA"
        size="xl"
        autofocus
        class="w-full"
        aria-label="搜尋關鍵字"
      />

      <div v-if="!terms.length" class="flex flex-wrap items-center gap-1.5">
        <span class="text-ui text-muted">試試看</span>
        <UButton
          v-for="s in SUGGEST"
          :key="s"
          :label="s"
          color="neutral"
          variant="outline"
          size="xs"
          class="rounded-full px-3"
          :ui="{ label: 'text-ui' }"
          @click="q = s"
        />
      </div>

      <template v-else>
        <p class="text-ui text-muted" aria-live="polite">找到 {{ conceptResults.length }} 個理論、{{ results.length }} 組討論</p>

        <section v-if="conceptResults.length" aria-label="理論" class="flex flex-col gap-3">
          <h2 class="text-title font-bold text-highlighted">理論</h2>
          <ul class="flex flex-col gap-3">
            <li v-for="c in conceptResults" :key="c.slug">
              <NuxtLink
                :to="conceptPath(c.slug)"
                class="flex flex-col gap-1.5 rounded-card border border-primary/40 bg-elevated p-4 transition-colors hover:border-secondary/70 hover:bg-accented"
              >
                <span class="text-meta text-muted">{{ c.topic }} · 理論</span>
                <span class="text-title leading-snug font-bold text-highlighted">{{ c.title }}</span>
                <span class="line-clamp-2 text-body-sm text-toned">{{ c.summary }}</span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <h2 v-if="conceptResults.length && results.length" class="text-title font-bold text-highlighted">討論</h2>

        <ul class="flex flex-col gap-3">
          <li v-for="r in results" :key="r.note.slug" class="flex flex-col gap-1.5">
            <NoteCard :note="r.note" />
            <ul v-if="r.hits.length" class="flex flex-col gap-1 pl-3">
              <li v-for="m in r.hits" :key="m.id">
                <NuxtLink
                  :to="`/n/${r.note.slug}#m-${m.id}`"
                  class="line-clamp-2 text-small text-toned underline-offset-2 hover:underline"
                >
                  <span class="font-medium" :class="m.teacher ? 'text-primary' : 'text-muted'">{{ m.author }}：</span>
                  <template v-for="(p, i) in mark(m.text)" :key="i">
                    <mark v-if="p.hit" class="rounded-tag bg-primary-soft px-0.5 text-highlighted">{{ p.value }}</mark>
                    <template v-else>{{ p.value }}</template>
                  </template>
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </template>
    </main>
  </div>
</template>
