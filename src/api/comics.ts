import { request } from '@/utils/request'

export type ComicsItem = {
  id: number
  title: string
  author: string
  cover: string
  intro: string
  category: string
  categories?: string[]
  tags: string[]
  is_vip: number
  price: number
  free_chapter: number
  chapter_count: number
  view_count: number
  like_count: number
  update_status: number
  is_buy: boolean
  created_at: string
}

export type ComicsDetail = ComicsItem & {
  playable: boolean
  need_pay: boolean
  need_vip: boolean
  enough: boolean
  reason: string
}

export type ChapterItem = {
  id: number
  seq: number
  title: string
  pic_count: number
  is_free: boolean
  playable: boolean
}

export function comicCategories(c: { category?: string; categories?: string[] }) {
  if (c.categories?.length) return c.categories
  if (!c.category) return []
  return c.category
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function fetchComicsList(
  page = 1,
  size = 20,
  keyword = '',
  category = '',
  sort?: number,
  recommend?: number,
  tag = '',
  payType?: number,
) {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  if (tag) q.set('tag', tag)
  if (sort !== undefined) q.set('sort', String(sort))
  if (recommend) q.set('recommend', String(recommend))
  if (payType) q.set('pay_type', String(payType))
  return request<{ list: ComicsItem[]; total: number }>(`/comics/list?${q}`)
}

export type ComicsCategory = {
  id: number
  name: string
  kind: number
}

export function fetchComicsCategories() {
  return request<{ list: ComicsCategory[] }>('/comics/categories')
}

export type ComicsModule = {
  id: number
  name: string
  style: number
  icon: number
  size: number
  tags: string[]
  categories?: string[]
  items: ComicsItem[]
}

export function fetchComicsModules(position = 'comic_home') {
  const q = new URLSearchParams()
  if (position) q.set('position', position)
  const suffix = q.toString() ? `?${q}` : ''
  return request<{ list: ComicsModule[] }>(`/comics/modules${suffix}`)
}

export function fetchComicsDetail(id: number) {
  return request<ComicsDetail>(`/comics/detail?id=${id}`)
}

export function fetchComicsChapters(id: number) {
  return request<{ comics_id: number; title: string; list: ChapterItem[] }>(`/comics/chapters?id=${id}`)
}

export function buyComics(id: number) {
  return request<{ price: number; balance: number }>('/comics/buy', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}

export function readChapter(chapterId: number) {
  return request<{
    chapter_id: number
    title: string
    pics: { url: string; width: number; height: number }[]
    prev_id: number
    next_id: number
  }>(`/comics/read?chapter_id=${chapterId}`)
}
