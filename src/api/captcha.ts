import { request } from '@/utils/request'

export function fetchCaptcha() {
  return request<{ id: string; image: string }>('/captcha')
}

export function verifyCaptcha(id: string, code: string) {
  return request<{ ok: boolean }>('/captcha/verify', {
    method: 'POST',
    body: JSON.stringify({ id, code }),
  })
}
