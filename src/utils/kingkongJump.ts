import type { Router } from 'vue-router'
import type { KingkongItem } from '@/api/kingkong'

export const VIDEO_CHANNEL_KEY = 'h5_video_channel'

export function positionOfChannel(channel: string) {
  if (channel === '动漫') return 'cartoon'
  if (channel === '视频') return 'movie'
  if (channel === '小说') return 'novel'
  if (channel === '短剧') return 'short'
  return 'comics'
}

function mediaOfPosition(position: string) {
  if (position === 'cartoon') return 'cartoon'
  if (position === 'movie') return 'video'
  if (position === 'novel') return 'novel'
  if (position === 'short') return 'video'
  return 'comic'
}

export function resolveKingkongJump(item: Pick<KingkongItem, 'open_mode' | 'link' | 'position'>) {
  const mode = item.open_mode || 'block'
  const link = (item.link || '').trim()
  const media = mediaOfPosition(item.position || 'comics')

  if (mode === 'douyin') {
    sessionStorage.setItem(VIDEO_CHANNEL_KEY, '抖音')
    return '/video'
  }
  if (mode === 'list' && !link) {
    return `/list?media=${media}`
  }
  if (!link) return ''

  if (/^https?:\/\//i.test(link)) return link
  if (link.startsWith('/')) return link

  switch (link) {
    case 'activityLand':
      return '/planet'
    case 'selected':
      return `/list?media=${media}&type=recommend`
    case 'day':
      return `/list?media=${media}&type=daily`
    case 'checkin':
      return '/checkin'
    case 'invite':
      return '/invite'
    case 'collect':
      return '/favorite'
    case 'submission':
      return '/creator'
    case 'aiExperience':
    case 'huangyou':
      return '/ai'
    case 'douyin':
      sessionStorage.setItem(VIDEO_CHANNEL_KEY, '抖音')
      return '/video'
    case 'vipUpgrade':
    case 'memberCenter':
      return '/vip'
    default:
      return `/${link.replace(/^\//, '')}`
  }
}

export function goKingkong(router: Router, item: Pick<KingkongItem, 'open_mode' | 'link' | 'position'>) {
  const path = resolveKingkongJump(item)
  if (!path) return
  if (/^https?:\/\//i.test(path)) {
    window.location.href = path
    return
  }
  router.push(path)
}

export function takeVideoChannel() {
  const v = sessionStorage.getItem(VIDEO_CHANNEL_KEY)
  if (v) sessionStorage.removeItem(VIDEO_CHANNEL_KEY)
  return v || ''
}
