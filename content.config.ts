// 內容集合定義。欄位規則見 SPEC.md「資料結構」。
// 跨檔案的規則（topic 在 topics.yml 裡、id 和檔名一致…）由 scripts/check-content.mjs 在建置前檢查。
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const image = z.object({
  src: z.string(), // 網站路徑，例：/img/123-image.jpg
  alt: z.string(), // 圖上的重點，一句話
})

const message = z.object({
  id: z.string(), // Discord 訊息 ID
  author: z.string(),
  teacher: z.boolean(), // 主要發言者（topics.yml 的 teachers）的發言，畫面上用底色標出來
  time: z.string(), // 'YYYY-MM-DD HH:mm'（台北時間）
  text: z.string(),
  reply: z.object({
    id: z.string(),
    author: z.string(),
    text: z.string(), // 被回覆的訊息前 60 字
    inGroup: z.boolean(), // 被回覆的訊息也在這組裡
  }).optional(),
  images: z.array(image).optional(),
  files: z.array(image.extend({ name: z.string() })).optional(), // PDF、程式碼等附件
})

export default defineContentConfig({
  collections: {
    // 每組討論一個檔案：content/notes/{第一則訊息的 ID}.yml，由 ../build-site.mjs 產生，之後可以手動改
    notes: defineCollection({
      type: 'data',
      source: 'notes/*.yml',
      schema: z.object({
        slug: z.string(), // 第一則訊息的 Discord ID = 檔名，網址 /n/{slug}；不叫 id，避免和 Nuxt Content 內建的 id 撞名
        title: z.string(),
        type: z.enum(['教學', '提問', '分析', '資源']),
        topic: z.string(), // 歸在哪個主題，必須是 topics.yml 的 name（hidden 的組不限）
        tags: z.array(z.string()),
        teacher: z.string(), // 主要發言者
        channel: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        url: z.string().url(), // 跳回 Discord
        summary: z.string(),
        hidden: z.boolean().default(false), // true 就不顯示（不要刪檔，刪了下次更新會再產生）
        messages: z.array(message),
        // 複習用的選擇題，由 agent 依 ../prompts/quiz.md 出題。沒有這個欄位 = 還沒出題；[] = 這組沒有可以考的
        quiz: z.array(z.object({
          q: z.string(), // 題目
          o: z.array(z.string()).length(4), // 選項
          a: z.number().int().min(0).max(3), // 正解在 o 的索引
          e: z.string(), // 解析
        })).optional(),
      }),
    }),

    // 理論：同一個觀念的整理。content/concepts/{slug}.yml，手動維護（新的組由 agent 依 ../prompts/concept.md 歸進來）
    // 每組沒隱藏的討論都屬於剛好一個理論，當作它的出處；討論的 topic 要和理論的 topic 一樣
    concepts: defineCollection({
      type: 'data',
      source: 'concepts/*.yml',
      schema: z.object({
        slug: z.string(), // = 檔名，英文小寫加連字號，網址 /c/{slug}
        title: z.string(),
        topic: z.string(), // 必須是 topics.yml 的 name
        order: z.number().int(), // 在主題裡的順序（由基礎到進階）
        summary: z.string(), // 一兩句講完這個理論
        // 說明：分段，每段一個小標題，內文是段落（text）和條列（items），可以附當時的 TV 截圖（figures）
        sections: z.array(z.object({
          heading: z.string(),
          text: z.array(z.string()).default([]),
          items: z.array(z.string()).default([]),
          figures: z.array(z.object({
            src: z.string(), // 討論裡的圖片路徑，例：/img/123-image.jpg
            caption: z.string(), // 這張圖要看什麼
            from: z.string(), // 出自哪組討論（slug，必須在 notes 裡）
          })).default([]),
        })),
        cautions: z.array(z.string()).default([]), // 注意：容易犯的錯
        notes: z.array(z.string()), // 出處：屬於這個理論的討論 slug，依時間由舊到新
      }),
    }),

    // 主題的順序與說明
    topics: defineCollection({
      type: 'data',
      source: 'topics.yml',
      schema: z.object({
        topics: z.array(z.object({ name: z.string(), desc: z.string() })),
        teachers: z.array(z.string()),
        excluded: z.array(z.string()).default([]), // 主標籤是這些的組一律隱藏
      }),
    }),
  },
})
