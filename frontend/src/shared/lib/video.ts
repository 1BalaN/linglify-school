/** Конвертирует любую YouTube/Vimeo ссылку в embed-формат */
export function toEmbedUrl(url: string): string {
  if (!url) return url
  // YouTube: watch?v=ID или youtu.be/ID
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  // Vimeo: vimeo.com/ID
  const vm = url.match(/(?:vimeo\.com\/)(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

/** Определяет, является ли URL прямым видеофайлом (не iframe) */
export function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url) || url.includes('cloudinary.com')
}
