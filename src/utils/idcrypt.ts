const KEY = 'myh5v1k'

const xor = (s: string) =>
  [...s]
    .map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ KEY.charCodeAt(i % KEY.length)))
    .join('')

export function encodeId(id: number | string) {
  const n = Number(id)
  if (!Number.isFinite(n) || n <= 0) return ''
  const raw = `${n}:${(n * 31 + 7).toString(36)}`
  return btoa(xor(raw)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeId(token: string | string[]) {
  const rawToken = Array.isArray(token) ? token[0] : token
  if (!rawToken) return 0
  try {
    const b64 = rawToken.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const raw = xor(atob(pad))
    const [idPart, check] = raw.split(':')
    const n = Number(idPart)
    if (!n || (n * 31 + 7).toString(36) !== check) return 0
    return n
  } catch {
    return 0
  }
}

export function routeId(token: unknown) {
  const raw = Array.isArray(token) ? token[0] : token
  if (raw == null || raw === '') return 0
  const decoded = decodeId(String(raw))
  if (decoded) return decoded
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : 0
}

export function videoPath(id: number | string) {
  return `/video/${encodeId(id)}`
}

export function comicPath(id: number | string) {
  return `/comic/${encodeId(id)}`
}

export function comicReadPath(comicId: number | string, chapterId: number | string) {
  return `/comic/${encodeId(comicId)}/read/${encodeId(chapterId)}`
}

export function postPath(id: number | string) {
  return `/planet/${encodeId(id)}`
}

export function userPath(id: number | string) {
  return `/user/${encodeId(id)}`
}
