import { ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import { resolveMediaSrc } from '@/utils/aesbnc'

export function useEncryptedSrc(src: MaybeRefOrGetter<string | undefined>) {
  const displaySrc = ref('')
  watch(
    () => toValue(src),
    async (url) => {
      if (!url) {
        displaySrc.value = ''
        return
      }
      try {
        displaySrc.value = await resolveMediaSrc(url)
      } catch {
        displaySrc.value = ''
      }
    },
    { immediate: true },
  )
  return displaySrc
}
