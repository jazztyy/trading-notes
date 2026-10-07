<script setup lang="ts">
// /memos 我的筆記：列出每一篇寫過的筆記（tn-memos），依主題分組、主題內依時間排序。
// 可以直接在這裡改，清空就刪掉（清空的那篇留在畫面上到重新整理，避免打字打到一半消失）；「複製全部」把所有筆記整理成純文字放進剪貼簿。
useSeoMeta({ title: '我的筆記・交易講義' })

const { data: notes } = await useAllNotes()
const { data: meta } = await useTopics()

const study = useStudy()

/** 這次打開頁面後出現過筆記的篇（localStorage 在掛載後才讀到，所以用 watch 累積） */
const shown = ref(new Set<string>())
watch(() => Object.keys(study.memos.value), (slugs) => {
  shown.value = new Set([...shown.value, ...slugs])
}, { immediate: true })

/** 有筆記的篇，依 topics.yml 的主題順序分組 */
const groups = computed(() => {
  const withMemo = notes.value.filter(n => shown.value.has(n.slug))
  return meta.value.topics
    .map(t => ({ topic: t.name, items: withMemo.filter(n => n.topic === t.name) }))
    .filter(g => g.items.length)
})

const count = computed(() => groups.value.reduce((s, g) => s + g.items.length, 0))

const toast = useToast()
const { copy } = useClipboard({ legacy: true })

const copyAll = async () => {
  const text = groups.value
    .map(g => ({ ...g, items: g.items.filter(n => study.memoOf(n.slug).trim()) }))
    .filter(g => g.items.length)
    .map(g => `# ${g.topic}\n\n${g.items.map(n => `## ${n.title}\n${study.memoOf(n.slug).trim()}`).join('\n\n')}`)
    .join('\n\n')
  await copy(text)
  toast.add({ title: '已複製全部筆記', color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div>
    <SiteHeader />

    <main class="mx-auto flex max-w-[760px] flex-col gap-6 px-4 pt-7 pb-16">
      <header class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-h1 leading-tight font-bold text-highlighted">我的筆記</h1>
          <UButton
            v-if="count"
            label="複製全部"
            icon="i-lucide-copy"
            color="neutral"
            variant="outline"
            size="sm"
            class="rounded-full"
            :ui="{ label: 'text-ui' }"
            @click="copyAll"
          />
        </div>
        <p class="text-body text-muted">每一篇寫過的筆記都在這裡，可以直接修改，清空就刪掉。筆記只存在這台電腦的瀏覽器。</p>
      </header>

      <p v-if="!count" class="rounded-card border border-dashed border-default p-6 text-center text-small text-muted">
        還沒有筆記。在任何一篇按「筆記」就能寫。
      </p>

      <section v-for="g in groups" :key="g.topic" class="flex flex-col gap-3">
        <h2 class="flex items-baseline gap-2 text-title font-bold text-highlighted">
          {{ g.topic }}<span class="font-mono text-meta font-normal text-muted">{{ g.items.length }}</span>
        </h2>
        <ul class="flex flex-col gap-3">
          <li v-for="n in g.items" :key="n.slug" class="flex flex-col gap-2 rounded-card border border-default bg-elevated p-4">
            <NuxtLink
              :to="`/n/${n.slug}`"
              class="flex items-baseline justify-between gap-3 text-body font-bold text-highlighted underline-offset-2 hover:underline"
            >
              <span>{{ n.title }}</span>
              <span class="shrink-0 font-mono text-meta font-normal text-muted">{{ n.date }}</span>
            </NuxtLink>
            <UTextarea
              :model-value="study.memoOf(n.slug)"
              autoresize
              :rows="2"
              class="w-full"
              :ui="{ base: 'text-body-sm' }"
              :aria-label="`${n.title} 的筆記`"
              @update:model-value="(v: string) => study.setMemo(n.slug, v)"
            />
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
