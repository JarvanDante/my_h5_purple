import { request } from '@/utils/request'

export type NovelItem = {
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
  word_count: number
  is_audio: number
  view_count: number
  like_count: number
  update_status: number
  is_buy: boolean
  created_at: string
}

export type NovelDetail = NovelItem & {
  playable: boolean
  need_pay: boolean
  need_vip: boolean
  enough: boolean
  reason: string
}

export type NovelChapter = {
  id: number
  seq: number
  title: string
  word_count: number
  has_audio: boolean
  is_free: boolean
  playable: boolean
}

export type NovelCategory = {
  id: number
  name: string
  kind: number
  rank?: number
}

export function novelCategories(n: { category?: string; categories?: string[] }) {
  if (n.categories?.length) return n.categories
  if (!n.category) return []
  return n.category
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function chapterName(ch: { seq: number; title?: string }) {
  const title = (ch.title || '').trim()
  if (title) return title
  return `第${String(ch.seq).padStart(2, '0')}章`
}

export function fetchNovelCategories() {
  return request<{ list: NovelCategory[] }>('/novel/categories')
}

export function fetchNovelList(
  page = 1,
  size = 20,
  keyword = '',
  category = '',
  sort = 2,
  recommend?: number,
  tag = '',
) {
  const q = new URLSearchParams({ page: String(page), size: String(size), sort: String(sort) })
  if (keyword) q.set('keyword', keyword)
  if (category) q.set('category', category)
  if (tag) q.set('tag', tag)
  if (recommend) q.set('recommend', String(recommend))
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

export function fetchNovelDetail(id: number) {
  return request<NovelDetail>(`/novel/detail?id=${id}`)
}

export function fetchNovelChapters(id: number) {
  return request<{ novel_id: number; title: string; list: NovelChapter[] }>(`/novel/chapters?id=${id}`)
}

export function buyNovel(id: number) {
  return request<{ price: number; balance: number }>('/novel/buy', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}

export function readNovelChapter(chapterId: number) {
  return request<{
    chapter_id: number
    novel_id: number
    seq: number
    title: string
    content: string
    word_count: number
    audio_url: string
    prev_id: number
    next_id: number
  }>(`/novel/read?chapter_id=${chapterId}`)
}
