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
) {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  return request<{ list: CartoonItem[]; total: number; page: number; size: number }>(
    `/cartoon/list?${q}`,
  )
}
