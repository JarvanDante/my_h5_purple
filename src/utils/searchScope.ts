export type SearchScope = 'comic' | 'cartoon' | 'novel' | 'short' | 'video' | 'planet' | 'ai'

const SCOPE_LABEL: Record<SearchScope, string> = {
  comic: '漫画',
  cartoon: '动漫',
  novel: '小说',
  short: '短剧',
  video: '视频',
  planet: '星球',
  ai: 'AI',
}

const ALIAS: Record<string, SearchScope> = {
  comic: 'comic',
  漫画: 'comic',
  cartoon: 'cartoon',
  动漫: 'cartoon',
  novel: 'novel',
  小说: 'novel',
  short: 'short',
  短剧: 'short',
  video: 'video',
  视频: 'video',
  planet: 'planet',
  星球: 'planet',
  ai: 'ai',
  AI: 'ai',
}

export function parseScope(raw: unknown): SearchScope {
  const key = String(raw || '').trim()
  return ALIAS[key] || 'comic'
}

export function scopeLabel(scope: SearchScope) {
  return SCOPE_LABEL[scope]
}

export function searchHint(scope: SearchScope) {
  return `搜索更多${scopeLabel(scope)}`
}

export function searchPath(raw: string | SearchScope) {
  return `/search?scope=${parseScope(raw)}`
}
