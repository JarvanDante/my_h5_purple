import { defineStore } from 'pinia'
import { ref } from 'vue'

export const TAB_PATHS = ['/comic', '/video', '/planet', '/ai', '/me']

export function tabIndex(path: string) {
  const p = path === '/' ? '/comic' : path
  return TAB_PATHS.indexOf(p)
}

export function slideByIndex(from: number, to: number) {
  if (from < 0 || to < 0 || from === to) return 'tab-left'
  return to > from ? 'tab-left' : 'tab-right'
}

export const useNavStore = defineStore('nav', () => {
  const transitionName = ref('tab-left')

  const setByRoute = (toPath: string, fromPath: string) => {
    const toIdx = tabIndex(toPath)
    const fromIdx = tabIndex(fromPath)
    const toTab = toIdx >= 0
    const fromTab = !fromPath || fromIdx >= 0

    if (toTab && fromTab) {
      transitionName.value = slideByIndex(fromIdx, toIdx)
      return
    }
    if (!toTab && fromTab) {
      transitionName.value = 'slide-left'
      return
    }
    if (toTab && !fromTab) {
      transitionName.value = 'slide-right'
      return
    }
    transitionName.value = 'slide-left'
  }

  return { transitionName, setByRoute }
})
