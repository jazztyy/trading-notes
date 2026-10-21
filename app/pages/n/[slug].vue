<script setup lang="ts">
// /n/{slug}：一組討論，是某個理論的補充。上面是所屬理論、重點與我的學習紀錄，下面是原始對話；
// 最下面是同一個理論的上一組／下一組。打開就記成已讀（已經是待複習或已懂就不動）。
const route = useRoute()
const slug = String(route.params.slug)

const { data: note } = await useNote(slug)
if (!note.value) throw createError({ statusCode: 404, statusMessage: '找不到這組討論', fatal: true })

const { data: notes } = await useAllNotes()
const { data: concepts } = await useConcepts()
const { data: meta } = await useTopics()

useSeoMeta({ title: `${note.value.title}・交易講義` })

/** 這組是哪個理論的補充 */
const concept = computed(() => concepts.value.find(c => c.notes.includes(slug)))
const siblings = computed(() =>
  (concept.value?.notes ?? []).map(id => notes.value.find(n => n.slug === id)).filter(n => !!n),
)
const index = computed(() => siblings.value.findIndex(n => n.slug === slug))
const prev = computed(() => siblings.value[index.value - 1])
const next = computed(() => siblings.value[index.value + 1])

/** 只顯示還在用的主題標籤（拿掉的主題不顯示） */
const tags = computed(() => note.value?.tags.filter(t => meta.value.topics.some(x => x.name === t)) ?? [])

const study = useStudy()
onMounted(() => study.markRead(slug))
</script>

<template>
  <div v-if="note">
    <SiteHeader />

    <main class="mx-auto flex max-w-[760px] flex-col gap-5 px-4 pt-6 pb-16">
      <nav aria-label="位置" class="flex items-center gap-1.5 text-ui text-muted">
        <NuxtLink :to="topicPath(note.topic)" class="shrink-0 transition-colors hover:text-highlighted">{{ note.topic }}</NuxtLink>
        <template v-if="concept">
          <span aria-hidden="true" class="text-dimmed">›</span>
          <NuxtLink :to="conceptPath(concept.slug)" class="min-w-0 truncate transition-colors hover:text-highlighted">{{ concept.title }}</NuxtLink>
          <span aria-hidden="true" class="text-dimmed">›</span>
          <span class="shrink-0 font-mono">{{ index + 1 }} / {{ siblings.length }}</span>
        </template>
      </nav>

      <header class="flex flex-col gap-2.5">
        <h1 class="text-h1 leading-tight font-bold text-highlighted">{{ note.title }}</h1>
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-ui text-muted">
          <UBadge :label="note.type" color="neutral" variant="soft" size="sm" class="rounded-tag" />
          <span class="font-medium text-primary">{{ note.teacher }}</span>
          <span>· #{{ note.channel }}</span>
          <span class="font-mono">· {{ note.date }}</span>
          <a
            :href="note.url"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-1 text-secondary underline-offset-2 hover:underline"
          >· 在 Discord 打開<UIcon name="i-lucide-external-link" class="size-3.5" /></a>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="tag in tags"
            :key="tag"
            :label="`#${tag}`"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full"
          />
        </div>
      </header>

      <NuxtLink
        v-if="concept"
        :to="conceptPath(concept.slug)"
        class="flex flex-col gap-0.5 rounded-card border border-default bg-elevated px-4 py-3 transition-colors hover:border-secondary/70 hover:bg-accented"
      >
        <span class="text-meta text-muted">這組是這個理論的補充</span>
        <span class="text-body font-bold text-highlighted">{{ concept.title }} <span class="text-secondary">→</span></span>
      </NuxtLink>

      <section aria-label="重點" class="rounded-card border border-primary/40 bg-primary-soft p-4">
        <h2 class="mb-1 text-ui font-bold text-primary">重點</h2>
        <p class="text-body leading-relaxed text-highlighted">{{ note.summary }}</p>
      </section>

      <NoteStudyBar :id="note.slug" />

      <section aria-labelledby="chat-title" class="flex flex-col gap-1">
        <h2 id="chat-title" class="text-title font-bold text-highlighted">原始對話</h2>
        <NoteMessages :messages="note.messages" />
      </section>

      <nav aria-label="同一個理論的其他討論" class="mt-4 grid gap-3 border-t border-default pt-5 sm:grid-cols-2">
        <NuxtLink
          v-if="prev"
          :to="`/n/${prev.slug}`"
          class="flex flex-col gap-1 rounded-card border border-default bg-elevated p-3 transition-colors hover:border-secondary/70 hover:bg-accented"
        >
          <span class="text-meta text-muted">← 上一組</span>
          <span class="line-clamp-2 text-small font-medium text-highlighted">{{ prev.title }}</span>
        </NuxtLink>
        <span v-else class="hidden sm:block" />
        <NuxtLink
          v-if="next"
          :to="`/n/${next.slug}`"
          class="flex flex-col gap-1 rounded-card border border-default bg-elevated p-3 text-right transition-colors hover:border-secondary/70 hover:bg-accented"
        >
          <span class="text-meta text-muted">下一組 →</span>
          <span class="line-clamp-2 text-small font-medium text-highlighted">{{ next.title }}</span>
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>
