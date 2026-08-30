import { request } from '@/utils/request'

export type BannerItem = {
  id: number
  position: string
  title: string
  cover_url: string
  link: string
}

export function fetchBannerList(position: string) {
  const q = new URLSearchParams()
  q.set('position', position)
  return request<{ list: BannerItem[] }>(`/banner/list?${q}`)
}
