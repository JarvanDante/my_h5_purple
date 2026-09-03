import { request } from '@/utils/request'

export const AD_SLOT = {
  banner: 'ad_banner',
  splash: 'ad_splash',
  feed: 'ad_feed',
  player: 'ad_player',
  popup: 'ad_popup',
  float: 'ad_float',
  icon: 'ad_icon',
} as const

export type AdItem = {
  campaign_id: string
  creative_id: string
  title: string
  media_url: string
  link_url: string
  slot_code: string
}

export function fetchAds(slotCode: string, limit = 10) {
  const q = new URLSearchParams()
  q.set('slot_code', slotCode)
  q.set('limit', String(limit))
  return request<{ list: AdItem[] }>(`/ads?${q}`)
}

export function reportAdEvent(body: {
  event_type: 'impression' | 'click'
  campaign_id?: string
  creative_id?: string
  slot_code?: string
}) {
  return request<{ ok: boolean }>('/ads/event', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
