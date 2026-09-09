import channelAnimeOff from './channel-anime-off.png'
import channelAnimeOn from './channel-anime-on.png'
import channelComicOff from './channel-comic-off.png'
import channelComicOn from './channel-comic-on.png'
import channelNovelOff from './channel-novel-off.png'
import channelNovelOn from './channel-novel-on.png'
import notice from './notice.png'
import quickDaily from './quick-daily.png'
import quickDone from './quick-done.png'
import quickPick from './quick-pick.png'
import quickTopic from './quick-topic.png'

export const noticeArt = notice

const channelArt: Record<string, { on: string; off: string }> = {
  漫画: { on: channelComicOn, off: channelComicOff },
  动漫: { on: channelAnimeOn, off: channelAnimeOff },
  小说: { on: channelNovelOn, off: channelNovelOff },
}

export function channelArtSrc(label: string, active?: boolean) {
  const item = channelArt[label]
  if (!item) return ''
  return active ? item.on : item.off
}

const quickByName: Record<string, string> = {
  专题: quickTopic,
  精选: quickPick,
  每日: quickDaily,
  完结: quickDone,
}

const quickByIndex = [quickTopic, quickPick, quickDaily, quickDone]

export function quickArtSrc(name: string, index: number) {
  return quickByName[name] || quickByIndex[index] || ''
}
