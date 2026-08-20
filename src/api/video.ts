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
}

export type VideoCategory = {
  id: number
  name: string
  kind: number
}

export function fetchVideoCategories() {
  return request<{ list: VideoCategory[] }>('/video/categories')
}

export function fetchVideoList(page = 1, size = 20, keyword = '', sort = 0, category = '') {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  return request<{ list: VideoItem[]; total: number; page: number; size: number }>(`/video/list?${q}`)
}

export function fetchVideoDetail(id: number) {
  return request<VideoItem>(`/video/detail?id=${id}`)
}
