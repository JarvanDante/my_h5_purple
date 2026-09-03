import { computed, nextTick, onUnmounted, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import type { AdItem } from '@/api/ads'
import { useAdsStore } from '@/stores/ads'

const HOLD_MS = 3000
const SLIDE_MS = 1000

export function useAdCarousel(
  track: Ref<HTMLElement | undefined>,
  list: Ref<AdItem[]>,
  enabled: Ref<boolean>,
  reverse: MaybeRefOrGetter<boolean> = false,
  vertical: MaybeRefOrGetter<boolean> = false,
) {
  const adsStore = useAdsStore()
  const index = { value: 0 }
  const scrollIndex = { value: 0 }
  const isReverse = () => toValue(reverse)
  const isVertical = () => toValue(vertical)
  const pageSize = (el: HTMLElement) => (isVertical() ? el.clientHeight : el.clientWidth)
  const pagePos = (el: HTMLElement) => (isVertical() ? el.scrollTop : el.scrollLeft)
  const scrollToPage = (el: HTMLElement, page: number) => {
    const px = page * pageSize(el)
    el.scrollTo(isVertical() ? { top: px, left: 0, behavior: 'auto' } : { left: px, top: 0, behavior: 'auto' })
  }
  const setPagePos = (el: HTMLElement, px: number) => {
    if (isVertical()) el.scrollTop = px
    else el.scrollLeft = px
  }

  const slides = computed(() => {
    const src = list.value
    if (src.length <= 1) return src
    if (!isReverse()) return [...src, src[0]]
    return [src[0], ...[...src].reverse()]
  })

  const current = computed(() => list.value[index.value] || list.value[0])

  let slideTimer = 0
  let anim = 0
  let jumping = false
  let sliding = false

  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

  const homeScroll = () => (isReverse() && list.value.length > 1 ? list.value.length : 0)

  const listIndexFromScroll = (pos: number) => {
    const n = list.value.length
    if (!n) return 0
    if (!isReverse()) return pos >= n ? 0 : pos
    return pos === 0 ? 0 : (n - pos + n) % n
  }

  const atClone = () => {
    const el = track.value
    const n = list.value.length
    if (!el || !pageSize(el) || n <= 1) return false
    const pos = pagePos(el)
    if (isReverse()) return pos <= 4
    return pos >= n * pageSize(el) - 4
  }

  const onScroll = () => {
    const el = track.value
    if (sliding || jumping || !el || !pageSize(el)) return
    const n = list.value.length
    const i = Math.round(pagePos(el) / pageSize(el))
    scrollIndex.value = i
    index.value = listIndexFromScroll(n && i >= n ? n : i)
  }

  const snapHome = (then?: () => void) => {
    const el = track.value
    if (!el) return
    jumping = true
    sliding = false
    window.cancelAnimationFrame(anim)
    el.style.scrollSnapType = 'none'
    el.style.scrollBehavior = 'auto'
    const home = homeScroll()
    scrollToPage(el, home)
    scrollIndex.value = home
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

  const scheduleNext = (delay = HOLD_MS) => {
    window.clearTimeout(slideTimer)
    slideTimer = 0
    if (list.value.length <= 1 || !enabled.value) return
    slideTimer = window.setTimeout(goNext, delay)
  }

  const scrollToIndex = (next: number) => {
    const el = track.value
    if (!pageSize(el)) return
    window.cancelAnimationFrame(anim)
    sliding = true
    const from = pagePos(el)
    const to = next * pageSize(el)
    const started = performance.now()
    el.style.scrollSnapType = 'none'
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / SLIDE_MS)
      setPagePos(el, from + (to - from) * easeInOut(t))
      if (t < 1) {
        anim = requestAnimationFrame(step)
        return
      }
      sliding = false
      const n = list.value.length
      index.value = listIndexFromScroll(next)
      adsStore.impression(list.value[index.value])
      if ((!isReverse() && next >= n) || (isReverse() && next <= 0)) {
        snapHome(() => scheduleNext())
        return
      }
      el.style.scrollSnapType = ''
      scheduleNext()
    }
    anim = requestAnimationFrame(step)
  }

  const goNext = () => {
    const el = track.value
    const n = list.value.length
    if (sliding || jumping || !el || !pageSize(el) || n <= 1 || !enabled.value) return
    const next = isReverse() ? scrollIndex.value - 1 : Math.min(scrollIndex.value, n - 1) + 1
    scrollIndex.value = next
    scrollToIndex(next)
  }

  const start = async () => {
    stop()
    const home = homeScroll()
    scrollIndex.value = home
    index.value = 0
    await nextTick()
    const el = track.value
    if (el && pageSize(el)) scrollToPage(el, home)
    if (list.value.length) adsStore.impression(list.value[0])
    scheduleNext()
  }

  watch(
    () => [enabled.value, isReverse(), isVertical(), list.value.map((a) => a.creative_id).join(',')],
    () => {
      if (enabled.value && list.value.length) start()
      else stop()
    },
    { immediate: true },
  )

  onUnmounted(stop)

  return { slides, current, onScroll, settleClone }
}
