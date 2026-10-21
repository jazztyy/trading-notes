<script setup lang="ts">
// 理論說明裡的 TV 截圖：圖、圖說、出處（哪一天哪組討論，可以點過去看原始對話）。
// 一張時佔滿欄寬，兩張以上在寬螢幕排兩欄；手機截圖是直的，限制高度避免一張佔掉整個畫面。點圖用 UModal 看大圖。
import type { ConceptFigure, NoteSummary } from '~/types/note'

const props = defineProps<{
  figures: ConceptFigure[]
  /** 用來顯示出處的標題與日期 */
  notes: NoteSummary[]
}>()

const asset = useAsset()

const items = computed(() =>
  props.figures.map(f => ({ ...f, note: props.notes.find(n => n.slug === f.from) })),
)

const viewing = ref<ConceptFigure | null>(null)
const open = computed({
  get: () => !!viewing.value,
  set: (v) => {
    if (!v) viewing.value = null
  },
})
</script>

<template>
  <div class="grid gap-4" :class="{ 'sm:grid-cols-2': figures.length > 1 }">
    <figure v-for="f in items" :key="f.src" class="flex flex-col gap-1.5">
      <button
        type="button"
        class="group flex justify-center rounded-control border border-default bg-elevated p-1 transition-colors hover:border-secondary/70"
        :aria-label="`放大圖片：${f.caption}`"
        @click="viewing = f"
      >
        <img
          :src="asset(f.src)"
          :alt="f.caption"
          loading="lazy"
          class="max-h-96 w-auto max-w-full rounded-tag object-contain"
        >
      </button>
      <figcaption class="flex flex-col gap-0.5">
        <span class="text-small text-toned">{{ f.caption }}</span>
        <NuxtLink
          v-if="f.note"
          :to="`/n/${f.note.slug}`"
          class="self-start text-meta text-secondary underline-offset-2 hover:underline"
        >
          出處：<span class="font-mono">{{ f.note.date.slice(5).replace('-', '/') }}</span> {{ f.note.title }} →
        </NuxtLink>
      </figcaption>
    </figure>
  </div>

  <UModal v-model:open="open" :title="viewing?.caption ?? ''" :ui="{ content: 'max-w-[min(96vw,1200px)]', title: 'text-small font-medium' }">
    <template #body>
      <img v-if="viewing" :src="asset(viewing.src)" :alt="viewing.caption" class="mx-auto max-h-[80vh] object-contain">
    </template>
  </UModal>
</template>
