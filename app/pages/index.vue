<script setup lang="ts">
// 首頁：整體進度（讀過幾個理論）、繼續上次、待複習數量，以及每個主題的卡片（讀過幾個理論 / 理論數）。
useSeoMeta({ title: '交易講義' })

const { data: notes } = await useAllNotes()
const { data: concepts } = await useConcepts()
const { data: meta } = await useTopics()

const study = useStudy()

const isDone = (id: string) => !!study.statusOf(id)

const topics = computed(() =>
  meta.value.topics.map((t) => {
    const items = concepts.value.filter(c => c.topic === t.name)
    return { ...t, total: items.length, done: items.filter(c => isDone(c.slug)).length }
  }).filter(t => t.total > 0),
)

const doneCount = computed(() => concepts.value.filter(c => isDone(c.slug)).length)
const reviewCount = computed(() => notes.value.filter(n => study.statusOf(n.slug) === 'review').length)

/** 上次打開的理論或討論 */
const lastPage = computed(() => {
  const concept = concepts.value.find(c => c.slug === study.last.value)
  if (concept) return { title: concept.title, to: conceptPath(concept.slug) }
  const note = notes.value.find(n => n.slug === study.last.value)
  return note ? { title: note.title, to: `/n/${note.slug}` } : null
})
const latestDate = computed(() => notes.value.at(-1)?.date ?? '')
</script>

<template>
  <div>
    <SiteHeader />

    <main class="mx-auto flex max-w-[960px] flex-col gap-8 px-4 pt-7 pb-16">
      <header class="flex flex-col gap-2">
        <h1 class="text-h1 leading-tight font-bold text-highlighted">AV帝王-TV樂園 交易講義</h1>
        <p class="text-body text-muted">
          {{ meta.teachers.join('、') }} 在 Discord 的教學、問答與盤勢看法，依主題整理成 {{ concepts.length }} 個理論，
          原始對話 {{ notes.length }} 組放在各理論底下當補充，更新到 <span class="font-mono">{{ latestDate }}</span>。
        </p>
      </header>

      <section aria-label="我的進度" class="grid gap-3 sm:grid-cols-3">
        <div class="flex flex-col gap-2 rounded-card border border-default bg-elevated p-4">
          <span class="text-ui text-muted">讀過的理論</span>
          <span class="font-mono text-h2 font-medium text-highlighted">{{ doneCount }}<span class="text-body text-muted"> / {{ concepts.length }}</span></span>
          <UProgress :model-value="doneCount" :max="Math.max(concepts.length, 1)" size="xs" />
        </div>

        <NuxtLink
          to="/review"
          class="flex flex-col gap-2 rounded-card border border-default bg-elevated p-4 transition-colors hover:border-secondary/70 hover:bg-accented"
        >
          <span class="text-ui text-muted">待複習</span>
          <span class="font-mono text-h2 font-medium" :class="reviewCount ? 'text-error' : 'text-highlighted'">{{ reviewCount }}</span>
          <span class="text-meta text-secondary">去複習 →</span>
        </NuxtLink>

        <NuxtLink
          v-if="lastPage"
          :to="lastPage.to"
          class="flex flex-col gap-2 rounded-card border border-default bg-elevated p-4 transition-colors hover:border-secondary/70 hover:bg-accented"
        >
          <span class="text-ui text-muted">上次看到</span>
          <span class="line-clamp-2 text-body font-bold text-highlighted">{{ lastPage.title }}</span>
          <span class="text-meta text-secondary">繼續 →</span>
        </NuxtLink>
        <div v-else class="flex flex-col gap-2 rounded-card border border-dashed border-default p-4">
          <span class="text-ui text-muted">從這裡開始</span>
          <span class="text-body-sm text-toned">主題由基礎排到進階，建議從「{{ topics[0]?.name }}」讀起。</span>
        </div>
      </section>

      <section aria-labelledby="topics-title" class="flex flex-col gap-4">
        <h2 id="topics-title" class="text-h2 font-bold text-highlighted">主題</h2>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li v-for="(t, i) in topics" :key="t.name">
            <NuxtLink
              :to="topicPath(t.name)"
              class="flex h-full flex-col gap-2 rounded-card border border-default bg-elevated p-4 transition-colors hover:border-secondary/70 hover:bg-accented"
            >
              <div class="flex items-baseline justify-between gap-3">
                <span class="text-title font-bold text-highlighted">
                  <span class="mr-1.5 font-mono text-ui text-dimmed">{{ String(i + 1).padStart(2, '0') }}</span>{{ t.name }}
                </span>
                <span class="shrink-0 font-mono text-meta text-muted">{{ t.done }} / {{ t.total }}</span>
              </div>
              <p class="text-small text-toned">{{ t.desc }}</p>
              <UProgress :model-value="t.done" :max="t.total" size="2xs" class="mt-auto" />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
