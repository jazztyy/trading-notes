<script setup lang="ts">
// 一組討論的原始對話。同一個人連續發言（5 分鐘內）只顯示一次名字。
// 主要發言者（Shawnnnn、Alina、nick_AJ）的發言用金色左線＋淡金底標出來，其他人用一般底色。不加「講師」之類的身分標籤。
// 圖片點開用 UModal 看大圖，圖說是篩選時寫的重點。
import type { NoteImage, NoteMessage } from '~/types/note'

const props = defineProps<{ messages: NoteMessage[] }>()

const asset = useAsset()

const minutes = (time: string) => new Date(time.replace(' ', 'T')).getTime() / 60000

/** 和上一則同一個人、間隔 5 分鐘內 → 接續上一則，不重複顯示名字 */
const rows = computed(() =>
  props.messages.map((m, i) => {
    const prev = props.messages[i - 1]
    const continued = !!prev && prev.author === m.author && minutes(m.time) - minutes(prev.time) <= 5 && !m.reply
    return { ...m, continued, clock: m.time.slice(11) }
  }),
)

const viewing = ref<NoteImage | null>(null)
const open = computed({
  get: () => !!viewing.value,
  set: (v) => {
    if (!v) viewing.value = null
  },
})
</script>

<template>
  <ol class="flex flex-col">
    <li
      v-for="m in rows"
      :id="`m-${m.id}`"
      :key="m.id"
      class="flex scroll-mt-20 flex-col gap-1.5 border-l-2 py-1.5 pr-3 pl-3"
      :class="[
        m.teacher ? 'border-primary bg-primary-soft' : 'border-transparent',
        m.continued ? '' : 'mt-3 rounded-tr-card',
      ]"
    >
      <div v-if="!m.continued" class="flex items-baseline gap-2">
        <span class="text-small font-bold" :class="m.teacher ? 'text-primary' : 'text-toned'">{{ m.author }}</span>
        <span class="font-mono text-meta text-dimmed">{{ m.clock }}</span>
      </div>

      <component
        :is="m.reply.inGroup ? 'a' : 'p'"
        v-if="m.reply"
        :href="m.reply.inGroup ? `#m-${m.reply.id}` : undefined"
        class="flex min-w-0 items-center gap-1.5 text-meta text-muted"
        :class="{ 'hover:underline underline-offset-2': m.reply.inGroup }"
      >
        <UIcon name="i-lucide-corner-down-right" class="size-3.5 shrink-0" />
        <span class="shrink-0 font-medium">{{ m.reply.author }}</span>
        <span class="truncate">{{ m.reply.text || '（圖片）' }}</span>
      </component>

      <p v-if="m.text" class="text-body break-words whitespace-pre-line text-highlighted">
        <template v-for="(part, i) in linkify(m.text)" :key="i">
          <a
            v-if="part.kind === 'url'"
            :href="part.value"
            target="_blank"
            rel="noopener"
            class="break-all text-secondary underline-offset-2 hover:underline"
          >{{ part.value }}</a>
          <span v-else-if="part.kind === 'mention'" class="font-medium text-secondary">{{ part.value }}</span>
          <template v-else>{{ part.value }}</template>
        </template>
      </p>

      <div v-if="m.images?.length" class="flex flex-wrap gap-2">
        <button
          v-for="img in m.images"
          :key="img.src"
          type="button"
          class="group flex max-w-full flex-col gap-1 text-left sm:max-w-[420px]"
          :aria-label="`放大圖片：${img.alt}`"
          @click="viewing = img"
        >
          <img
            :src="asset(img.src)"
            :alt="img.alt"
            loading="lazy"
            class="max-h-72 rounded-control border border-default object-contain transition-colors group-hover:border-secondary/70"
          >
          <span class="text-meta text-muted">{{ img.alt }}</span>
        </button>
      </div>

      <ul v-if="m.files?.length" class="flex flex-col gap-1.5">
        <li v-for="f in m.files" :key="f.src">
          <a
            :href="asset(f.src)"
            target="_blank"
            rel="noopener"
            class="flex items-start gap-2 rounded-control border border-default bg-elevated p-2.5 transition-colors hover:border-secondary/70 hover:bg-accented"
          >
            <UIcon name="i-lucide-file-text" class="mt-0.5 size-4 shrink-0 text-secondary" />
            <span class="flex flex-col">
              <span class="text-small font-medium text-highlighted">{{ f.name }}</span>
              <span class="text-meta text-muted">{{ f.alt }}</span>
            </span>
          </a>
        </li>
      </ul>
    </li>
  </ol>

  <UModal v-model:open="open" :title="viewing?.alt ?? ''" :ui="{ content: 'max-w-[min(96vw,1200px)]', title: 'text-small font-medium' }">
    <template #body>
      <img v-if="viewing" :src="asset(viewing.src)" :alt="viewing.alt" class="mx-auto max-h-[80vh] object-contain">
    </template>
  </UModal>
</template>
