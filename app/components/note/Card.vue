<script setup lang="ts">
// 列表裡的一組討論：標題、類型、主要發言者、日期、重點，右上角顯示學習狀態與星號。
// hover 規則：卡片連結（DESIGN.md「游標與語系」）。
import type { NoteSummary } from '~/types/note'

const props = defineProps<{
  note: NoteSummary
  /** 列表已經依日期分組時不再顯示日期 */
  hideDate?: boolean
  /** 列表已經在某個主題裡時不再顯示主題 */
  hideTopic?: boolean
}>()

const study = useStudy()
const status = computed(() => study.statusOf(props.note.slug))
const starred = computed(() => study.isStarred(props.note.slug))
</script>

<template>
  <NuxtLink
    :to="`/n/${note.slug}`"
    class="flex flex-col gap-2 rounded-card border border-default bg-elevated p-4 transition-colors hover:border-secondary/70 hover:bg-accented"
    :class="{ 'opacity-75': status === 'known' }"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="text-title leading-snug font-bold text-highlighted">{{ note.title }}</h3>
      <div class="flex shrink-0 items-center gap-1.5 pt-1">
        <UIcon v-if="starred" name="i-lucide-star" class="size-4 text-primary" aria-label="已加星號" />
        <NoteStatusBadge :status="status" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted">
      <UBadge :label="note.type" color="neutral" variant="soft" size="sm" class="rounded-tag" />
      <span class="font-medium text-primary">{{ note.teacher }}</span>
      <span v-if="!hideTopic">· {{ note.topic }}</span>
      <span v-if="!hideDate" class="font-mono">· {{ note.date }}</span>
    </div>

    <p class="line-clamp-3 text-body-sm text-toned">{{ note.summary }}</p>
  </NuxtLink>
</template>
