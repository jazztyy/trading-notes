<script setup lang="ts">
// 這組的學習紀錄：狀態（已讀／待複習／已懂）、星號、我的筆記。存在瀏覽器（useStudy）。
import type { StudyStatus } from '~/types/note'

const props = defineProps<{ id: string }>()

const study = useStudy()

const status = computed(() => study.statusOf(props.id))
const starred = computed(() => study.isStarred(props.id))

const OPTIONS: { value: StudyStatus, icon: string, color: 'neutral' | 'error' | 'success' }[] = [
  { value: 'read', icon: 'i-lucide-eye', color: 'neutral' },
  { value: 'review', icon: 'i-lucide-rotate-ccw', color: 'error' },
  { value: 'known', icon: 'i-lucide-check', color: 'success' },
]

const memo = computed({
  get: () => study.memoOf(props.id),
  set: (v: string) => study.setMemo(props.id, v),
})

const memoOpen = ref(false)
watch(() => study.memoOf(props.id), (v) => {
  if (v) memoOpen.value = true
}, { immediate: true })
</script>

<template>
  <section aria-label="我的學習紀錄" class="flex flex-col gap-3 rounded-card border border-default bg-elevated p-3">
    <div class="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="學習狀態" class="flex flex-wrap gap-1.5">
        <UButton
          v-for="o in OPTIONS"
          :key="o.value"
          :label="STATUS_LABEL[o.value]"
          :icon="o.icon"
          :color="o.color"
          :variant="status === o.value ? 'solid' : 'outline'"
          size="sm"
          :aria-pressed="status === o.value"
          class="rounded-full"
          :ui="{ label: 'text-ui' }"
          @click="study.setStatus(id, status === o.value ? undefined : o.value)"
        />
      </div>

      <div class="ml-auto flex gap-1.5">
        <UButton
          icon="i-lucide-star"
          :label="starred ? '已加星號' : '加星號'"
          color="primary"
          :variant="starred ? 'soft' : 'ghost'"
          size="sm"
          :aria-pressed="starred"
          :ui="{ label: 'text-ui', leadingIcon: starred ? 'fill-current' : '' }"
          @click="study.toggleStar(id)"
        />
        <UButton
          icon="i-lucide-notebook-pen"
          label="筆記"
          color="neutral"
          :variant="memoOpen ? 'soft' : 'ghost'"
          size="sm"
          :aria-expanded="memoOpen"
          :ui="{ label: 'text-ui' }"
          @click="memoOpen = !memoOpen"
        />
      </div>
    </div>

    <UTextarea
      v-if="memoOpen"
      v-model="memo"
      placeholder="用自己的話寫下重點、想問的問題…（只存在這台電腦的瀏覽器）"
      autoresize
      :rows="3"
      class="w-full"
      :ui="{ base: 'text-body-sm' }"
    />
  </section>
</template>
