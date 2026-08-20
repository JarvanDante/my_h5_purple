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

/** 相对路径走同域 /static（开发由 Vite 代理到 my_service）。 */
export function mediaUrl(path?: string) {
  if (!path) return ''
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path
  return path.startsWith('/') ? path : `/${path}`
}

/** H5 用户上传明文图, 服务端加密为 .bnc。 */
export async function uploadMedia(file: File, purpose: 'image' | 'avatar' = 'image') {
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Authorization', token)
  const body = new FormData()
  body.append('file', file)
  body.append('purpose', purpose)
  const res = await fetch(`${BASE}/media/upload`, { method: 'POST', headers, body })
  const json = (await res.json()) as Envelope<{ url: string; object_key: string }>
  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || '上传失败')
  }
  return json.data
}
