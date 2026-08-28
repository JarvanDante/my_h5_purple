import { request } from '@/utils/request'

export type CartoonItem = {
  id: number
  title: string
  description: string
  cover_url: string
  source_url: string
  category: string
  categories?: string[]
  duration: number
  created_at: string
}

export type CartoonCategory = {
  id: number
  name: string
  kind: number
}

export function cartoonCategories(c: { category?: string; categories?: string[] }) {
  if (c.categories?.length) return c.categories
  if (!c.category) return []
  return c.category
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function fetchCartoonCategories() {
  return request<{ list: CartoonCategory[] }>('/cartoon/categories')
}

export function fetchCartoonList(
  page = 1,
  size = 20,
  keyword = '',
  category = '',
  sort = 0,
  tag = '',
) {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  if (tag) q.set('tag', tag)
  return request<{ list: CartoonItem[]; total: number; page: number; size: number }>(
    `/cartoon/list?${q}`,
  )
}

export type CartoonModule = {
  id: number
  name: string
  style: number
  icon: number
  size: number
  tags: string[]
  items: CartoonItem[]
}

export function fetchCartoonModules(position = 'cartoon_home') {
  const q = new URLSearchParams()
  if (position) q.set('position', position)
  const suffix = q.toString() ? `?${q}` : ''
  return request<{ list: CartoonModule[] }>(`/cartoon/modules${suffix}`)
}
