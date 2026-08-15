import { showToast } from 'vant'

const BASE = import.meta.env.VITE_API_BASE || '/front/v1'

type Envelope<T> = {
  code: number
  message: string
  data: T
}

export class ApiError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export function getToken() {
  return localStorage.getItem('h5_token') || ''
}

export function setToken(token: string) {
  if (token) {
    localStorage.setItem('h5_token', token)
    return
  }
  localStorage.removeItem('h5_token')
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', token)
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const json = (await res.json()) as Envelope<T>
  if (json.code !== 0) {
    const err = new ApiError(json.code, json.message || '请求失败')
    if (json.code === 61) {
      setToken('')
    }
    throw err
  }
  return json.data
}

export function toastError(err: unknown) {
  const msg = err instanceof Error ? err.message : '请求失败'
  showToast(msg)
}
