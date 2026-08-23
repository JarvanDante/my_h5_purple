import { request } from '@/utils/request'

export function fetchHotSearch(category = '') {
  const q = new URLSearchParams()
  if (category) q.set('category', category)
  return request<{ list: { keyword: string }[] }>(`/hotsearch/list?${q}`)
}
