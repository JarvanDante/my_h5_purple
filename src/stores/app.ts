import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const cacheViews = ref<string[]>(['Comic'])

  return { cacheViews }
})
