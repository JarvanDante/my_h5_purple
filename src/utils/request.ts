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

/** 本机播放网关改成同域 /hls，CF / HTTPS 才能走到 Vite 反代。 */
const LOCAL_PLAY = /^https?:\/\/(?:127\.0\.0\.1|localhost|host\.docker\.internal):8006(?=\/|$)/i

export function rewritePlayGateway(url: string) {
  return url.replace(LOCAL_PLAY, '')
}

/** 相对路径走同域 /static（开发由 Vite 代理到 my_service）。 */
export function mediaUrl(path?: string) {
  if (!path) return ''
  const next = rewritePlayGateway(path)
  if (/^(https?:)?\/\//i.test(next) || next.startsWith('data:') || next.startsWith('blob:')) return next
  return next.startsWith('/') ? next : `/${next}`
}

function uploadFailMessage(text: string, status: number) {
  if (/ParseMul|request body too large|entity too large/i.test(text)) {
    return '文件过大，请压缩后重试'
  }
  const trimmed = text.replace(/\s+/g, ' ').trim()
  return trimmed.slice(0, 80) || `上传失败(${status})`
}

/** H5 图片上传：服务端加密 .bnc 后写入统一存储 my-storage。 */
export async function uploadMedia(file: File, purpose: 'image' | 'avatar' | 'video' | 'ad' | 'cover' | 'post' = 'image') {
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Authorization', token)
  const body = new FormData()
  body.append('file', file)
  body.append('purpose', purpose)
  const res = await fetch(`${BASE}/media/upload`, { method: 'POST', headers, body })
  const text = await res.text()
  let json: Envelope<{ url: string; object_key: string }>
  try {
    json = JSON.parse(text) as Envelope<{ url: string; object_key: string }>
  } catch {
    throw new ApiError(-1, uploadFailMessage(text, res.status))
  }
  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || '上传失败')
  }
  return json.data
}
