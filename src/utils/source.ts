const KEY = 'h5_source_code'

export function rememberSource(raw?: unknown) {
  const code = String(Array.isArray(raw) ? raw[0] : (raw ?? '')).trim()
  if (code) localStorage.setItem(KEY, code)
}

export function peekSource() {
  return localStorage.getItem(KEY) || ''
}

export function takeSource() {
  const code = peekSource()
  if (code) localStorage.removeItem(KEY)
  return code
}
