<script setup lang="ts">
// /t/{主題}：一個主題的理論，依 order 由基礎到進階。每個理論顯示重點、讀過了沒、底下有幾組原始對話。

const route = useRoute()
const name = computed(() => String(route.params.topic))

const { data: concepts } = await useConcepts()
const { data: meta } = await useTopics()

const topic = computed(() => meta.value.topics.find(t => t.name === name.value))
if (!topic.value) throw createError({ statusCode: 404, statusMessage: '找不到這個主題', fatal: true })

useSeoMeta({ title: `${name.value}・交易講義` })

const study = useStudy()

const items = computed(() => concepts.value.filter(c => c.topic === name.value))

const done = computed(() => items.value.filter(c => study.statusOf(c.slug)).length)
</script>

<template>
  <div>
    <SiteHeader />

    <main class="mx-auto flex max-w-[960px] flex-col gap-6 px-4 pt-7 pb-16">
      <header class="flex flex-col gap-2">
        <NuxtLink to="/" class="text-ui text-muted transition-colors hover:text-highlighted">← 全部主題</NuxtLink>
        <h1 class="text-h1 leading-tight font-bold text-highlighted">{{ name }}</h1>
        <p class="text-body text-muted">{{ topic?.desc }}</p>
        <p class="font-mono text-meta text-muted">讀過 {{ done }} / {{ items.length }} 個理論</p>
        <UProgress :model-value="done" :max="Math.max(items.length, 1)" size="2xs" class="max-w-xs" />
      </header>

      <ol class="flex flex-col gap-3">
        <li v-for="(c, i) in items" :key="c.slug">
          <NuxtLink
            :to="conceptPath(c.slug)"
            class="flex flex-col gap-2 rounded-card border border-default bg-elevated p-4 transition-colors hover:border-secondary/70 hover:bg-accented"
          >
            <div class="flex items-baseline justify-between gap-3">
              <h2 class="text-title leading-snug font-bold text-highlighted">
                <span class="mr-1.5 font-mono text-ui text-dimmed">{{ String(i + 1).padStart(2, '0') }}</span>{{ c.title }}
              </h2>
              <NoteStatusBadge :status="study.statusOf(c.slug)" class="shrink-0" />
            </div>
            <p class="line-clamp-3 text-body-sm text-toned">{{ c.summary }}</p>
            <p class="text-meta text-muted">原始對話 {{ c.notes.length }} 組</p>
          </NuxtLink>
        </li>
      </ol>
    </main>
  </div>
</template>
