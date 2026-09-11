export function splitNames(raw: unknown): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  String(raw || '')
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((name) => {
      if (seen.has(name)) return
      seen.add(name)
      out.push(name)
    })
  return out
}

export function joinNames(list?: string[]): string {
  return (list || []).map((s) => s.trim()).filter(Boolean).join(',')
}

export function moduleMorePath(
  media: 'comic' | 'cartoon' | 'video',
  mod: { tags?: string[]; categories?: string[] },
) {
  const q = new URLSearchParams({ media })
  const cats = joinNames(mod.categories)
  const tags = joinNames(mod.tags)
  if (cats) {
    q.set('type', 'category')
    q.set('category', cats)
    q.set('categories', cats)
  }
  if (tags) {
    q.set('tag', tags)
    q.set('tags', tags)
  }
  if (!cats && !tags) q.set('type', 'daily')
  return `/list?${q}`
}

export function moduleChips(mod: { tags?: string[]; categories?: string[] }) {
  return {
    categories: (mod.categories || []).map((s) => s.trim()).filter(Boolean),
    tags: (mod.tags || []).map((s) => s.trim()).filter(Boolean),
  }
}

export type FloorLayout = 'rail' | 'wide-rail' | 'grid-2' | 'grid-3' | 'wide-grid' | 'hero-mix' | 'one-wide'

export function moduleLayout(style: number): FloorLayout {
  if (style === 1) return 'hero-mix'
  if (style === 2) return 'wide-grid'
  if (style === 3) return 'one-wide'
  if (style === 4) return 'grid-2'
  if (style === 5) return 'rail'
  if (style === 6) return 'wide-rail'
  return 'grid-3'
}

export function moduleTake<T>(style: number, size: number, items: T[]): T[] {
  if (style !== 8) return items
  const n = size > 0 ? size : 6
  return items.slice(0, n)
}
