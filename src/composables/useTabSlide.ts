import { ref } from 'vue'
import { slideByIndex } from '@/stores/nav'

export function useTabSlide(items: readonly string[], initial?: string) {
  const current = ref(initial ?? items[0])
  const name = ref('tab-left')

  const select = (item: string) => {
    if (item === current.value) return
    name.value = slideByIndex(items.indexOf(current.value), items.indexOf(item))
    current.value = item
  }

  return { current, name, select }
}
