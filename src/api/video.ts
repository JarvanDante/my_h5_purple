import { request } from '@/utils/request'

export type VideoItem = {
  id: number
  title: string
  description: string
  cover_url: string
  source_url: string
  category?: string
  categories?: string[]
  duration: number
  created_at: string
  up_user_id?: number
  up_nickname?: string
  up_avatar?: string
  followed?: boolean
  comment_count?: number
}

export type VideoCategory = {
  id: number
  name: string
  kind: number
}

export function fetchVideoCategories() {
  return request<{ list: VideoCategory[] }>('/video/categories')
}

export function fetchVideoList(page = 1, size = 20, keyword = '', sort = 0, category = '', tag = '') {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  if (tag) q.set('tag', tag)
  return request<{ list: VideoItem[]; total: number; page: number; size: number }>(`/video/list?${q}`)
}

export type VideoModule = {
  id: number
  name: string
  style: number
  icon: number
  size: number
  tags: string[]
  categories?: string[]
  items: VideoItem[]
}

export function fetchVideoModules(position = 'video_home') {
  const q = new URLSearchParams()
  if (position) q.set('position', position)
  const suffix = q.toString() ? `?${q}` : ''
  return request<{ list: VideoModule[] }>(`/video/modules${suffix}`)
}

export function fetchVideoDetail(id: number) {
  return request<VideoItem>(`/video/detail?id=${id}`)
}
