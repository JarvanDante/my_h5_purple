export function formatViews(n: number) {
  if (!n) return ''
  if (n >= 10000) {
    const w = n / 10000
    const text = w >= 10 ? String(Math.round(w)) : w.toFixed(1).replace(/\.0$/, '')
    return `${text}w`
  }
  return String(n)
}

export function formatDuration(sec: number) {
  if (!sec) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function isRecent(createdAt?: string, days = 7) {
  if (!createdAt) return false
  const t = Date.parse(createdAt)
  return Number.isFinite(t) && Date.now() - t < days * 86400000
}
