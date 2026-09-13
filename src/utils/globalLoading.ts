import { isNativeApp } from '@/utils/nativeApp'

export const GLOBAL_LOADING_START = 'app:global-loading-start'
export const GLOBAL_LOADING_END = 'app:global-loading-end'
export const GLOBAL_LOADING_RESET = 'app:global-loading-reset'

export function emitGlobalLoadingStart() {
  if (typeof window === 'undefined' || !isNativeApp()) return
  window.dispatchEvent(new CustomEvent(GLOBAL_LOADING_START))
}

export function emitGlobalLoadingEnd() {
  if (typeof window === 'undefined' || !isNativeApp()) return
  window.dispatchEvent(new CustomEvent(GLOBAL_LOADING_END))
}

export function emitGlobalLoadingReset() {
  if (typeof window === 'undefined' || !isNativeApp()) return
  window.dispatchEvent(new CustomEvent(GLOBAL_LOADING_RESET))
}
