<script setup lang="ts">
// /c/{slug}：一個理論。重點 → 分段說明（附當時的 TV 截圖）→ 注意；
// 原始對話只在最下面列成出處清單（預設收起來），點進去才看對話。最下面是同主題的上一個／下一個理論。
// 打開就記成已讀（和討論共用 tn-status，理論的 slug 是英文、討論是數字，不會撞）。
const route = useRoute()
const slug = String(route.params.slug)

const { data: concept } = await useConcept(slug)
if (!concept.value) throw createError({ statusCode: 404, statusMessage: '找不到這個理論', fatal: true })

const { data: concepts } = await useConcepts()
const { data: notes } = await useAllNotes()

useSeoMeta({ title: `${concept.value.title}・交易講義` })

const sources = computed(() =>
  (concept.value?.notes ?? []).map(id => notes.value.find(n => n.slug === id)).filter(n => !!n),
)

const siblings = computed(() => concepts.value.filter(c => c.topic === concept.value?.topic))
const index = computed(() => siblings.value.findIndex(c => c.slug === slug))
const prev = computed(() => siblings.value[index.value - 1])
const next = computed(() => siblings.value[index.value + 1])

const study = useStudy()
const done = computed(() => sources.value.filter(n => study.statusOf(n.slug)).length)
onMounted(() => study.markRead(slug))
</script>

<template>
  <div v-if="concept">
    <SiteHeader />

    <main class="mx-auto flex max-w-[760px] flex-col gap-6 px-4 pt-6 pb-16">
      <nav aria-label="位置" class="flex items-center gap-1.5 text-ui text-muted">
        <NuxtLink :to="topicPath(concept.topic)" class="transition-colors hover:text-highlighted">{{ concept.topic }}</NuxtLink>
        <span aria-hidden="true" class="text-dimmed">›</span>
        <span class="font-mono">{{ index + 1 }} / {{ siblings.length }}</span>
      </nav>

      <header class="flex flex-col gap-4">
        <h1 class="text-h1 leading-tight font-bold text-highlighted">{{ concept.title }}</h1>
        <section aria-label="重點" class="rounded-card border border-primary/40 bg-primary-soft p-4">
          <h2 class="mb-1 text-ui font-bold text-primary">重點</h2>
          <p class="text-body leading-relaxed text-highlighted">{{ concept.summary }}</p>
        </section>
      </header>

      <section
        v-for="(s, i) in concept.sections"
        :key="i"
        :aria-labelledby="`s-${i}`"
        class="flex flex-col gap-3"
      >
        <h2 :id="`s-${i}`" class="text-title font-bold text-highlighted">{{ s.heading }}</h2>
        <p v-for="(t, j) in s.text" :key="`t-${j}`" class="text-body leading-relaxed text-default">{{ t }}</p>
        <ul v-if="s.items.length" class="flex flex-col gap-1.5">
          <li v-for="(item, j) in s.items" :key="`i-${j}`" class="flex gap-2.5 text-body leading-relaxed text-default">
            <span aria-hidden="true" class="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{{ item }}</span>
          </li>
        </ul>
        <ConceptFigures v-if="s.figures.length" :figures="s.figures" :notes="sources" class="mt-1" />
      </section>

      <section v-if="concept.cautions.length" aria-labelledby="cautions-title" class="flex flex-col gap-2 rounded-card border border-default bg-elevated p-4">
        <h2 id="cautions-title" class="text-ui font-bold text-error">注意</h2>
        <ul class="flex flex-col gap-1.5">
          <li v-for="(c, i) in concept.cautions" :key="i" class="flex gap-2 text-body-sm leading-relaxed text-toned">
            <span aria-hidden="true" class="shrink-0 text-dimmed">–</span>
            <span>{{ c }}</span>
          </li>
        </ul>
      </section>

      <UCollapsible class="flex flex-col gap-2 border-t border-default pt-4">
        <UButton
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-chevron-down"
          class="group -mx-2 justify-between px-2"
          :ui="{ label: 'text-ui text-muted', trailingIcon: 'text-muted transition-transform group-data-[state=open]:rotate-180' }"
        >
          出處：群組裡的原始對話 {{ sources.length }} 組（讀過 {{ done }}）
        </UButton>
        <template #content>
          <ul class="flex flex-col">
            <li v-for="n in sources" :key="n.slug">
              <NuxtLink
                :to="`/n/${n.slug}`"
                class="flex items-baseline gap-3 rounded-control px-2 py-1.5 transition-colors hover:bg-accented"
              >
                <span class="shrink-0 font-mono text-meta text-muted">{{ n.date.slice(5).replace('-', '/') }}</span>
                <span class="min-w-0 flex-1 text-small text-toned">{{ n.title }}</span>
                <NoteStatusBadge :status="study.statusOf(n.slug)" class="shrink-0" />
              </NuxtLink>
            </li>
          </ul>
        </template>
      </UCollapsible>

      <nav aria-label="同主題的其他理論" class="grid gap-3 border-t border-default pt-5 sm:grid-cols-2">
        <NuxtLink
          v-if="prev"
          :to="conceptPath(prev.slug)"
          class="flex flex-col gap-1 rounded-card border border-default bg-elevated p-3 transition-colors hover:border-secondary/70 hover:bg-accented"
        >
          <span class="text-meta text-muted">← 上一個理論</span>
          <span class="line-clamp-2 text-small font-medium text-highlighted">{{ prev.title }}</span>
        </NuxtLink>
        <span v-else class="hidden sm:block" />
        <NuxtLink
          v-if="next"
          :to="conceptPath(next.slug)"
          class="flex flex-col gap-1 rounded-card border border-default bg-elevated p-3 text-right transition-colors hover:border-secondary/70 hover:bg-accented"
        >
          <span class="text-meta text-muted">下一個理論 →</span>
          <span class="line-clamp-2 text-small font-medium text-highlighted">{{ next.title }}</span>
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>
