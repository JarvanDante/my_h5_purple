import { request } from '@/utils/request'

export type ComicsItem = {
  id: number
  title: string
  author: string
  cover: string
  intro: string
  category: string
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

export function fetchComicsList(
  page = 1,
  size = 20,
  keyword = '',
  category = '',
  sort?: number,
) {
  const q = new URLSearchParams({ page: String(page), size: String(size) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  if (sort !== undefined) q.set('sort', String(sort))
  return request<{ list: ComicsItem[]; total: number }>(`/comics/list?${q}`)
}

export function fetchComicsCategories() {
  return request<{ list: { id: number; name: string; kind: number }[] }>('/comics/categories')
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
