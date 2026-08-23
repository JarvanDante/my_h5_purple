const KEY = 'h5_search_history'
const MAX = 16

const read = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(list) ? list.filter((x) => typeof x === 'string' && x.trim()) : []
  } catch {
    return []
  }
}

const write = (list: string[]) => {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
}

export function listSearchHistory() {
  return read()
}

export function pushSearchHistory(word: string) {
  const q = word.trim()
  if (!q) return
  write([q, ...read().filter((item) => item !== q)])
}

export function clearSearchHistory() {
  write([])
}
