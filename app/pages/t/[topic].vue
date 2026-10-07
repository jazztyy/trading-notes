<script setup lang="ts">
// /t/{主題}：一個主題的所有討論，依時間由舊到新（先學基礎）。可以用發言者、類型、學習狀態篩選。

const route = useRoute()
const name = computed(() => String(route.params.topic))

const { data: notes } = await useAllNotes()
const { data: meta } = await useTopics()

const topic = computed(() => meta.value.topics.find(t => t.name === name.value))
if (!topic.value) throw createError({ statusCode: 404, statusMessage: '找不到這個主題', fatal: true })

useSeoMeta({ title: `${name.value}・交易講義` })

const items = computed(() => notes.value.filter(n => n.topic === name.value))

const study = useStudy()

const teacher = ref<string | null>(null)
const type = ref<string | null>(null)
const show = ref<'all' | 'unread' | 'review' | 'star'>('all')

const teachers = computed(() => meta.value.teachers.filter(t => items.value.some(n => n.teacher === t)))
const types = computed(() => ['教學', '提問', '分析', '資源'].filter(t => items.value.some(n => n.type === t)))

const SHOW = [
  { value: 'all', label: '全部' },
  { value: 'unread', label: '未讀' },
  { value: 'review', label: '待複習' },
  { value: 'star', label: '星號' },
] as const

const filtered = computed(() =>
  items.value.filter(n =>
    (!teacher.value || n.teacher === teacher.value)
    && (!type.value || n.type === type.value)
    && (show.value === 'all'
      || (show.value === 'unread' && !study.statusOf(n.slug))
      || (show.value === 'review' && study.statusOf(n.slug) === 'review')
      || (show.value === 'star' && study.isStarred(n.slug))),
  ),
)

const done = computed(() => items.value.filter(n => study.statusOf(n.slug)).length)

const clear = () => {
  teacher.value = null
  type.value = null
  show.value = 'all'
}
</script>

<template>
  <div>
    <SiteHeader />

    <main class="mx-auto flex max-w-[960px] flex-col gap-6 px-4 pt-7 pb-16">
      <header class="flex flex-col gap-2">
        <NuxtLink to="/" class="text-ui text-muted transition-colors hover:text-highlighted">← 全部主題</NuxtLink>
        <h1 class="text-h1 leading-tight font-bold text-highlighted">{{ name }}</h1>
        <p class="text-body text-muted">{{ topic?.desc }}</p>
        <p class="font-mono text-meta text-muted">讀過 {{ done }} / {{ items.length }}</p>
      </header>

      <section aria-label="篩選" class="flex flex-col gap-2.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="w-12 shrink-0 text-ui text-muted">發言者</span>
          <UButton
            v-for="t in teachers"
            :key="t"
            :label="t"
            color="neutral"
            :variant="teacher === t ? 'solid' : 'outline'"
            size="xs"
            :aria-pressed="teacher === t"
            class="rounded-full px-3"
            :ui="{ label: 'text-ui font-medium' }"
            @click="teacher = teacher === t ? null : t"
          />
        </div>
        <div v-if="types.length > 1" class="flex flex-wrap items-center gap-1.5">
          <span class="w-12 shrink-0 text-ui text-muted">類型</span>
          <UButton
            v-for="t in types"
            :key="t"
            :label="t"
            color="neutral"
            :variant="type === t ? 'solid' : 'outline'"
            size="xs"
            :aria-pressed="type === t"
            class="rounded-full px-3"
            :ui="{ label: 'text-ui font-medium' }"
            @click="type = type === t ? null : t"
          />
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="w-12 shrink-0 text-ui text-muted">顯示</span>
          <UButton
            v-for="s in SHOW"
            :key="s.value"
            :label="s.label"
            color="neutral"
            :variant="show === s.value ? 'solid' : 'outline'"
            size="xs"
            :aria-pressed="show === s.value"
            class="rounded-full px-3"
            :ui="{ label: 'text-ui font-medium' }"
            @click="show = s.value"
          />
        </div>
        <div class="flex items-center gap-3 text-ui text-muted" aria-live="polite">
          <span>共 {{ filtered.length }} 組</span>
          <UButton
            v-if="teacher || type || show !== 'all'"
            label="清除篩選"
            color="secondary"
            variant="link"
            size="xs"
            class="p-0"
            :ui="{ label: 'text-ui' }"
            @click="clear"
          />
        </div>
      </section>

      <p v-if="!filtered.length" class="text-small text-muted">沒有符合的討論。</p>

      <ul class="flex flex-col gap-3">
        <li v-for="n in filtered" :key="n.slug">
          <NoteCard :note="n" hide-topic />
        </li>
      </ul>
    </main>
  </div>
</template>
