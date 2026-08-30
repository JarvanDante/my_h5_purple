import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDrawerStore = defineStore('drawer', () => {
  const open = ref(false)
  const show = () => {
    open.value = true
  }
  const hide = () => {
    open.value = false
  }
  const toggle = () => {
    open.value = !open.value
  }
  return { open, show, hide, toggle }
})
