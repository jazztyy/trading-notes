<script setup lang="ts">
// 頂部列：站名＋全站導覽（主題／複習／搜尋）＋深淺色切換。
// 導覽只用字色表示目前位置：選中金色、其他灰色。規格見 DESIGN.md「導覽」。
const route = useRoute()

const NAV = [
  { label: '主題', to: '/', match: (p: string) => p === '/' || p.startsWith('/t/') || p.startsWith('/n/') },
  { label: '複習', to: '/review', match: (p: string) => p.startsWith('/review') },
  { label: '搜尋', to: '/search', match: (p: string) => p.startsWith('/search') },
]

const navItems = computed(() => NAV.map(item => ({ ...item, active: item.match(route.path) })))
</script>

<template>
  <div class="sticky top-0 z-20 border-b border-default bg-default">
    <div class="mx-auto flex max-w-[960px] items-center justify-between gap-3 px-4 py-2.5">
      <div class="flex min-w-0 items-center gap-2 sm:gap-4">
        <NuxtLink
          to="/"
          class="shrink-0 rounded-control text-lead font-bold text-highlighted transition-colors hover:text-primary sm:text-title"
        >
          交易講義
        </NuxtLink>

        <nav
          aria-label="網站"
          class="flex min-w-0 items-center gap-0.5 overflow-x-auto sm:gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :aria-current="item.active ? 'page' : undefined"
            class="shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 text-ui font-medium transition-colors sm:px-2.5"
            :class="item.active ? 'text-primary' : 'text-muted hover:text-highlighted'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

      <UColorModeButton size="xs" />
    </div>
  </div>
</template>
