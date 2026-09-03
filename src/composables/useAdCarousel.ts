import { computed, nextTick, onUnmounted, watch, type Ref } from 'vue'
import type { AdItem } from '@/api/ads'
import { useAdsStore } from '@/stores/ads'

const INTERVAL_MS = 1500
const SLIDE_MS = 1500

export function useAdCarousel(track: Ref<HTMLElement | undefined>, list: Ref<AdItem[]>, enabled: Ref<boolean>) {
  const adsStore = useAdsStore()
  const index = { value: 0 }
  const slides = computed(() =>
    list.value.length > 1 ? [...list.value, list.value[0]] : list.value,
  )

  let slideTimer = 0
  let anim = 0
  let jumping = false
  let sliding = false

  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

  const atClone = () => {
    const el = track.value
    const n = list.value.length
    if (!el?.clientWidth || n <= 1) return false
    return el.scrollLeft >= n * el.clientWidth - 4
  }

  const onScroll = () => {
    const el = track.value
    if (sliding || jumping || !el?.clientWidth) return
    const n = list.value.length
    const i = Math.round(el.scrollLeft / el.clientWidth)
    index.value = n && i >= n ? n - 1 : i
  }

  const snapHome = (then?: () => void) => {
    const el = track.value
    if (!el) return
    jumping = true
    sliding = false
    window.cancelAnimationFrame(anim)
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'
    el.scrollTo({ left: 0, behavior: 'auto' })
    index.value = 0
    requestAnimationFrame(() => {
      el.style.scrollSnapType = ''
      el.style.scrollBehavior = ''
      jumping = false
      then?.()
    })
  }

  const settleClone = () => {
    if (sliding || jumping) return
    if (atClone()) snapHome()
  }

  const stop = () => {
    window.clearTimeout(slideTimer)
    slideTimer = 0
    window.cancelAnimationFrame(anim)
    sliding = false
  }

  const scheduleNext = (delay = INTERVAL_MS) => {
    window.clearTimeout(slideTimer)
    slideTimer = 0
    if (list.value.length <= 1 || !enabled.value) return
    slideTimer = window.setTimeout(goNext, delay)
  }

  const scrollToIndex = (next: number) => {
    const el = track.value
    if (!el?.clientWidth) return
    window.cancelAnimationFrame(anim)
    sliding = true
    const from = el.scrollLeft
    const to = next * el.clientWidth
    const started = performance.now()
    el.style.scrollSnapType = 'none'
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / SLIDE_MS)
      el.scrollLeft = from + (to - from) * easeInOut(t)
      if (t < 1) {
        anim = requestAnimationFrame(step)
        return
      }
      sliding = false
      const n = list.value.length
      if (next >= n) {
        adsStore.impression(list.value[0])
        snapHome(() => scheduleNext(0))
        return
      }
      el.style.scrollSnapType = ''
      adsStore.impression(list.value[next])
      scheduleNext(0)
    }
    anim = requestAnimationFrame(step)
  }

  const goNext = () => {
    const el = track.value
    const n = list.value.length
    if (sliding || jumping || !el?.clientWidth || n <= 1 || !enabled.value) return
    const cur = Math.min(index.value, n - 1)
    const next = cur + 1
    if (next < n) index.value = next
    scrollToIndex(next)
  }

  const start = async () => {
    stop()
    index.value = 0
    await nextTick()
    track.value?.scrollTo({ left: 0, behavior: 'auto' })
    if (list.value.length) adsStore.impression(list.value[0])
    scheduleNext()
  }

  watch(
    () => [enabled.value, list.value.map((a) => a.creative_id).join(',')],
    () => {
      if (enabled.value && list.value.length) start()
      else stop()
    },
    { immediate: true },
  )

  onUnmounted(stop)

  return { slides, onScroll, settleClone }
}
