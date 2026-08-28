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
