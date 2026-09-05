const KEY = 'h5_channel_name'

function normalizeChannel(raw?: unknown) {
  let s = String(Array.isArray(raw) ? raw[0] : (raw ?? '')).trim()
  if (!s) return ''
  s = s.replace(/^channel:\/\//, '').replace(/^agent:\/\//, '').trim()
  if (!s || /^(official|404)$/i.test(s)) return ''
  return s.slice(0, 64)
}

export function rememberChannel(raw?: unknown) {
  const name = normalizeChannel(raw)
  if (name) localStorage.setItem(KEY, name)
}

export function peekChannel() {
  return localStorage.getItem(KEY) || ''
}

export function takeChannel() {
  const name = peekChannel()
  if (name) localStorage.removeItem(KEY)
  return name
}
