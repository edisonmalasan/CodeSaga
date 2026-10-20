export function safeImagePath(src: string) {
  return /^\/media\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|webp|jpe?g|avif)$/.test(src);
}
export function safeVideoUrl(src: string) {
  return /^https:\/\/(?:www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}|player\.vimeo\.com\/video\/[0-9]{1,12})$/.test(src);
}
