import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  GLOBAL_LOADING_END,
  GLOBAL_LOADING_RESET,
  GLOBAL_LOADING_START,
} from '@/utils/globalLoading'
import { isNativeApp } from '@/utils/nativeApp'

const showDelayMs = 300
const minLoadingMs = 100
const maxLoadingMs = 2000

export function useGlobalLoading() {
  const enabled = isNativeApp()
  const showGlobalLoading = ref(enabled)
  let loadingCount = 0
  let loadingShownAt = Date.now()
  let showTimer: number | null = null
  let hideTimer: number | null = null
  let forceHideTimer: number | null = null

  const clearTimer = (id: number | null) => {
    if (id) window.clearTimeout(id)
    return null
  }

  const scheduleForceHide = () => {
    if (forceHideTimer) return
    forceHideTimer = window.setTimeout(() => {
      loadingCount = 0
      showGlobalLoading.value = false
      forceHideTimer = null
    }, maxLoadingMs)
  }

  const showLoading = () => {
    if (!enabled) return
    loadingCount += 1
    hideTimer = clearTimer(hideTimer)

    if (showGlobalLoading.value) {
      scheduleForceHide()
      return
    }
    if (showTimer) return

    showTimer = window.setTimeout(() => {
      showTimer = null
      if (loadingCount === 0 || showGlobalLoading.value) return
      showGlobalLoading.value = true
      loadingShownAt = Date.now()
      scheduleForceHide()
    }, showDelayMs)
  }

  const hideLoading = () => {
    if (!enabled) return
    loadingCount = Math.max(0, loadingCount - 1)
    if (loadingCount !== 0) return

    if (showTimer) {
      showTimer = clearTimer(showTimer)
    }

    if (!showGlobalLoading.value) {
      forceHideTimer = clearTimer(forceHideTimer)
      return
    }

    const remain = Math.max(0, minLoadingMs - (Date.now() - loadingShownAt))
    hideTimer = clearTimer(hideTimer)
    hideTimer = window.setTimeout(() => {
      if (loadingCount === 0) {
        showGlobalLoading.value = false
        forceHideTimer = clearTimer(forceHideTimer)
      }
      hideTimer = null
    }, remain)
  }

  const resetLoading = () => {
    loadingCount = 0
    showGlobalLoading.value = false
    showTimer = clearTimer(showTimer)
    hideTimer = clearTimer(hideTimer)
    forceHideTimer = clearTimer(forceHideTimer)
  }

  onMounted(() => {
    if (!enabled) {
      showGlobalLoading.value = false
      return
    }

    showGlobalLoading.value = true
    loadingShownAt = Date.now()
    const hideInitialLoading = () => {
      const remain = Math.max(0, minLoadingMs - (Date.now() - loadingShownAt))
      window.setTimeout(() => {
        if (loadingCount === 0) showGlobalLoading.value = false
      }, remain)
    }

    if (document.readyState === 'complete') {
      hideInitialLoading()
    } else {
      window.addEventListener('load', hideInitialLoading, { once: true })
    }

    window.addEventListener(GLOBAL_LOADING_START, showLoading)
    window.addEventListener(GLOBAL_LOADING_END, hideLoading)
    window.addEventListener(GLOBAL_LOADING_RESET, resetLoading)
  })

  onBeforeUnmount(() => {
    window.removeEventListener(GLOBAL_LOADING_START, showLoading)
    window.removeEventListener(GLOBAL_LOADING_END, hideLoading)
    window.removeEventListener(GLOBAL_LOADING_RESET, resetLoading)
    resetLoading()
  })

  return { showGlobalLoading }
}
