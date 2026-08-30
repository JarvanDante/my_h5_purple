import type { Router } from 'vue-router'

export function openPromoLink(router: Router, href?: string) {
  const link = String(href || '').trim()
  if (!link) return
  if (/^https?:\/\//i.test(link)) {
    window.location.assign(link)
    return
  }
  router.push(link.startsWith('/') ? link : `/${link}`)
}
