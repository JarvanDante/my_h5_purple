declare global {
  interface Window {
    __MY_NATIVE_APP__?: string | boolean
  }
}

const SESSION_KEY = 'h5_native_app'

function readQueryFlag() {
  const raw = new URLSearchParams(window.location.search).get('app')
  if (raw === '0') {
    sessionStorage.removeItem(SESSION_KEY)
    return false
  }
  if (raw === '1' || raw === 'android' || raw === 'ios') {
    sessionStorage.setItem(SESSION_KEY, raw === '1' ? 'android' : raw)
    return true
  }
  return sessionStorage.getItem(SESSION_KEY) === 'android' || sessionStorage.getItem(SESSION_KEY) === 'ios'
}

/** 套壳 APP（安卓 WebView / iOS WKWebView），普通浏览器不展示全局加载。 */
export function isNativeApp() {
  if (typeof window === 'undefined') return false
  if (readQueryFlag()) return true

  const flag = window.__MY_NATIVE_APP__
  if (flag === true || flag === '1' || flag === 'android' || flag === 'ios') {
    return true
  }

  const ua = navigator.userAgent || ''
  if (/MyNativeApp/i.test(ua)) return true
  if (/Android/i.test(ua) && /; wv\)/i.test(ua)) return true

  if (/iPhone|iPad|iPod/i.test(ua)) {
    const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|MicroMessenger|QQ\//i.test(ua)
    if (otherBrowser) return false
    const safari = /Safari/i.test(ua) && /Version/i.test(ua)
    return !safari
  }

  return false
}
