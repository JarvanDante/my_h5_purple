import { request } from '@/utils/request'
import type { VideoCategory, VideoItem } from '@/api/video'

export type DouyinItem = VideoItem
export type DouyinCategory = VideoCategory

export function fetchDouyinCategories() {
  return request<{ list: DouyinCategory[] }>('/douyin/categories')
}

export function fetchDouyinList(
  page = 1,
  size = 20,
  keyword = '',
  sort = 0,
  category = '',
  tag = '',
) {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  if (tag) q.set('tag', tag)
  return request<{ list: DouyinItem[]; total: number; page: number; size: number }>(`/douyin/list?${q}`)
}
