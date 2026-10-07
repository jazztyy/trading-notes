// 靜態輸出（nuxt generate）部署到 GitHub Pages（.github/workflows/deploy.yml）。
// 網址前綴由環境變數 NUXT_APP_BASE_URL 決定（部署時為 /trading-notes/），本機開發時為 /。
// 規格見 SPEC.md，畫面規範見 DESIGN.md。
export default defineNuxtConfig({
  compatibilityDate: '2026-09-01',
  modules: ['@nuxt/ui', '@nuxt/content', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },

  // 中文字型改用 Google Fonts CSS（有 unicode-range 分片），不讓 @nuxt/fonts 下載整套字檔
  ui: { fonts: false },

  // 暗色為預設（和 TradingView 的暗色盤面一致），可以切換成淺色
  // storageKey 和悅讀聊天室分開：兩個站都在 jazztyy.github.io，localStorage 共用
  colorMode: { preference: 'dark', fallback: 'dark', storageKey: 'tn-color-mode' },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant' },
      title: '交易講義',
      meta: [
        { name: 'description', content: 'AV帝王-TV樂園 Discord 討論整理：主題講義與複習。' },
        { name: 'robots', content: 'noindex' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+TC:wght@400;500;700&display=swap',
        },
      ],
    },
  },

  nitro: {
    preset: 'github_pages',
    // 主題頁與每組討論的頁面由首頁和主題頁的連結爬出來
    prerender: { crawlLinks: true, routes: ['/', '/review', '/search'] },
  },
})
