// content 裡的圖片與附件路徑（/img/…、/files/…）加上網址前綴。
// 部署到 GitHub Pages 時前綴是 /trading-notes/，本機是 /。一般 <img>、<a> 不會自動加，所以一律透過這裡。
export const useAsset = () => {
  const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
  return (src: string) => `${base}${src}`
}
