import { request } from '@/utils/request'

export const MEDIA_COMICS = 3
export const COLLECT_FAV = 1

export function operateCollect(id: number, mediaType: number, flag: boolean, type = COLLECT_FAV) {
  return request<Record<string, never>>('/collect/operate', {
    method: 'POST',
    body: JSON.stringify({ id, media_type: mediaType, flag, type }),
  })
}

export function fetchCollectList(type = COLLECT_FAV, mediaType = MEDIA_COMICS, page = 1, size = 50) {
  const q = new URLSearchParams({
    type: String(type),
    media_type: String(mediaType),
    page: String(page),
    size: String(size),
  })
  return request<{ list: { content_id: number }[]; total: number }>(`/collect/list?${q}`)
}
