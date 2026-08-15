import { defineStore } from 'pinia'
import { ref } from 'vue'

const TAB_PATHS = ['/comic', '/video', '/planet', '/ai', '/me']

export const useNavStore = defineStore('nav', () => {
  const transitionName = ref('fade')

  const setByRoute = (toPath: string, fromPath: string) => {
    const toTab = TAB_PATHS.includes(toPath)
    const fromTab = !fromPath || TAB_PATHS.includes(fromPath)
    if (toTab && fromTab) {
      transitionName.value = 'fade'
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
