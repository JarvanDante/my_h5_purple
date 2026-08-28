import { ref } from 'vue'

export const likedIds = ref(new Set<number>())
export const collectedIds = ref(new Set<number>())

const pending = new Set<string>()
const dirty = new Set<string>()

export const markKey = (kind: 'like' | 'fav', id: number) => `${kind}:${id}`

export const isMarkPending = (key: string) => pending.has(key)
export const beginMark = (key: string) => {
  pending.add(key)
  dirty.add(key)
}
export const endMark = (key: string, revertDirty = false) => {
  pending.delete(key)
  if (revertDirty) dirty.delete(key)
}

export const applyMark = (kind: 'like' | 'fav', id: number, on: boolean) => {
  const src = kind === 'like' ? likedIds.value : collectedIds.value
  const copy = new Set(src)
  if (on) copy.add(id)
  else copy.delete(id)
  if (kind === 'like') likedIds.value = copy
  else collectedIds.value = copy
}

export const mergeMarks = (kind: 'like' | 'fav', ids: number[]) => {
  const src = kind === 'like' ? likedIds.value : collectedIds.value
  const copy = new Set(src)
  ids.forEach((id) => copy.add(id))
  if (kind === 'like') likedIds.value = copy
  else collectedIds.value = copy
}

export const keepDirty = (kind: 'like' | 'fav', next: Set<number>) => {
  dirty.forEach((key) => {
    const [k, raw] = key.split(':')
    if (k !== kind) return
    const id = Number(raw)
    const src = kind === 'like' ? likedIds.value : collectedIds.value
    if (src.has(id)) next.add(id)
    else next.delete(id)
  })
}
