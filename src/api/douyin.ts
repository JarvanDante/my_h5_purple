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
  follow = 0,
  upUserId = 0,
) {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  if (tag) q.set('tag', tag)
  if (follow) q.set('follow', String(follow))
  if (upUserId) q.set('up_user_id', String(upUserId))
  return request<{ list: DouyinItem[]; total: number; page: number; size: number }>(`/douyin/list?${q}`)
}

export type DouyinMineItem = DouyinItem & {
  status: number
  reject_reason?: string
}

export function fetchMyDouyin(page = 1, size = 50) {
  return request<{ list: DouyinMineItem[]; total: number }>(`/douyin/my?page=${page}&size=${size}`)
}

export function submitDouyin(body: {
  title: string
  description?: string
  cover_url: string
  cover_key?: string
  source_url: string
  source_key?: string
  duration?: number
  tags?: string[]
}) {
  return request<{ id: number }>('/douyin/submit', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
