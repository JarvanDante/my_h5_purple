import { request } from '@/utils/request'

export type NovelItem = {
  id: number
  title: string
  author: string
  cover: string
  intro: string
  category: string
  tags: string[]
  is_vip: number
  chapter_count: number
  view_count: number
  update_status: number
  created_at: string
}

export type NovelCategory = {
  id: number
  name: string
  kind: number
}

export function fetchNovelCategories() {
  return request<{ list: NovelCategory[] }>('/novel/categories')
}

export function fetchNovelList(page = 1, size = 20, keyword = '', category = '', sort = 2) {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  return request<{ list: NovelItem[]; total: number }>(`/novel/list?${q}`)
}

export type NovelModule = {
  id: number
  name: string
  style: number
  icon: number
  size: number
  tags: string[]
  categories?: string[]
  items: NovelItem[]
}

export function fetchNovelModules(position = '') {
  const q = new URLSearchParams()
  if (position) q.set('position', position)
  const suffix = q.toString() ? `?${q}` : ''
  return request<{ list: NovelModule[] }>(`/novel/modules${suffix}`)
}
