<script setup lang="ts">
// 學習狀態徽章：未讀不顯示；狀態除了顏色也有文字（DESIGN.md「無障礙」）
import type { StudyStatus } from '~/types/note'

defineProps<{ status?: StudyStatus }>()

const COLOR = { read: 'neutral', review: 'error', known: 'success' } as const
</script>

<template>
  <UBadge
    v-if="status"
    :label="STATUS_LABEL[status]"
    :color="COLOR[status]"
    variant="subtle"
    size="sm"
    class="rounded-full"
  />
</template>
