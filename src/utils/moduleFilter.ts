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
