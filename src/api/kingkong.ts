import { request } from '@/utils/request'

export type KingkongItem = {
  id: number
  name: string
  icon_url: string
  open_mode: string
  link: string
  app_link: string
  position: string
  sort: number
}

export function fetchKingkongList(position: string) {
  const q = new URLSearchParams()
  q.set('position', position)
  return request<{ list: KingkongItem[] }>(`/kingkong/list?${q}`)
}
