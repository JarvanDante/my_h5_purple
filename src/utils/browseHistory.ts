export type BrowseKind = 'comic' | 'video' | 'novel'

export type BrowseItem = {
  id: number
  kind: BrowseKind
  title: string
  cover?: string
  tag?: string
  sub?: string
  at: number
}

const KEY = 'h5_browse_history'
const MAX = 80

const read = (): BrowseItem[] => {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as BrowseItem[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const write = (list: BrowseItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
}

export function listBrowse(kind: BrowseKind) {
  return read().filter((item) => item.kind === kind)
}

export function pushBrowse(item: Omit<BrowseItem, 'at'>) {
  if (!item.id || !item.title) return
  const next = read().filter((row) => !(row.kind === item.kind && row.id === item.id))
  next.unshift({ ...item, at: Date.now() })
  write(next)
}

export function removeBrowse(kind: BrowseKind, ids: number[]) {
  const set = new Set(ids)
  write(read().filter((item) => !(item.kind === kind && set.has(item.id))))
}
