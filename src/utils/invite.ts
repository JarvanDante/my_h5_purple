const KEY = 'h5_invite_code'

export function rememberInviteCode(raw?: unknown) {
  const code = String(Array.isArray(raw) ? raw[0] : (raw ?? '')).trim()
  if (code) localStorage.setItem(KEY, code)
}

export function peekInviteCode() {
  return localStorage.getItem(KEY) || ''
}

export function takeInviteCode() {
  const code = peekInviteCode()
  if (code) localStorage.removeItem(KEY)
  return code
}
