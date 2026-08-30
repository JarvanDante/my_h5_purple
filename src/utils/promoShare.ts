export function officialShareBase(shareUrl?: string, fallbackOrigin = location.origin) {
  const conf = String(shareUrl || '').trim().replace(/\/$/, '')
  if (conf && !/example\.com/i.test(conf)) return conf
  return fallbackOrigin.replace(/\/$/, '')
}

export function buildPromoUrl(base: string, code: string) {
  if (!code) return base
  try {
    const url = new URL(base)
    url.searchParams.set('invite', code)
    return url.toString()
  } catch {
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}invite=${encodeURIComponent(code)}`
  }
}

export function promoSlogan(configs?: Record<string, unknown>) {
  const raw = String(configs?.share_slogan || configs?.slogan || '').trim()
  return raw || '邀请好友一起看，复制链接在浏览器中打开！'
}

export function buildPromoText(slogan: string, url: string) {
  const s = slogan.trim()
  return s ? `${s} ${url}` : url
}
