export const IMAGE_MAX_BYTES = 1 * 1024 * 1024
export const VIDEO_MAX_BYTES = 600 * 1024 * 1024

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  const mb = bytes / (1024 * 1024)
  return `${mb >= 100 ? mb.toFixed(0) : mb.toFixed(1)}M`
}
