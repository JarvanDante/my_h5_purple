export type CoverItem = {
  id: string
  title: string
  sub?: string
  tag?: string
  duration?: string
  views?: string
  cover?: string
  labels?: string[]
  tone: number
}

export const comics: CoverItem[] = [
  { id: 'c1', title: '星河旅人', sub: '更新至 36 话', tag: 'Free', views: '128万', tone: 0 },
  { id: 'c2', title: '夜色书店', sub: '更新至 18 话', tag: 'VIP', views: '86万', tone: 1 },
  { id: 'c3', title: '校园日记', sub: '已完结', tag: 'Free', views: '210万', tone: 2 },
  { id: 'c4', title: '深海回声', sub: '更新至 9 话', tag: 'VIP', views: '54万', tone: 3 },
  { id: 'c5', title: '都市传说', sub: '更新至 42 话', tag: 'Free', views: '97万', tone: 4 },
  { id: 'c6', title: '拾光旅社', sub: '更新至 21 话', tag: 'Free', views: '63万', tone: 5 },
  { id: 'c7', title: '雾隐山庄', sub: '更新至 12 话', tag: 'VIP', views: '41万', tone: 0 },
  { id: 'c8', title: '白夜骑士', sub: '更新至 27 话', tag: 'Free', views: '155万', tone: 1 },
  { id: 'c9', title: '花与剑', sub: '已完结', tag: 'VIP', views: '72万', tone: 2 },
]

export const videos: CoverItem[] = [
  { id: 'v1', title: '午夜列车', duration: '42:16', views: '32万', tag: '热播', tone: 1 },
  { id: 'v2', title: '雨夜回廊', duration: '18:40', views: '19万', tag: 'Free', tone: 3 },
  { id: 'v3', title: '旧巷灯火', duration: '56:02', views: '48万', tag: 'VIP', tone: 2 },
  { id: 'v4', title: '南风过境', duration: '12:08', views: '11万', tag: '短视频', tone: 4 },
  { id: 'v5', title: '雾城往事', duration: '38:51', views: '27万', tag: '热播', tone: 0 },
  { id: 'v6', title: '海边旅馆', duration: '24:33', views: '15万', tag: 'Free', tone: 5 },
]

export const posts = [
  { id: 'p1', user: '星河君', text: '今日上新这本也太好看了，封面先码住。', likes: 328, comments: 46, tone: 0 },
  { id: 'p2', user: '夜读人', text: '有没有人一起追《深海回声》？第三话反转绝了。', likes: 196, comments: 31, tone: 2 },
  { id: 'p3', user: '拾光', text: '签到第七天金币到账，冲一波月卡。', likes: 87, comments: 12, tone: 4 },
  { id: 'p4', user: '白夜', text: '求推荐完结短篇，周末想一口气看完。', likes: 154, comments: 58, tone: 1 },
]

export const aiTools = [
  { key: 'draw', title: 'AI 绘画', desc: '一句话出图，风格自选' },
  { key: 'face', title: 'AI 换脸', desc: '上传照片快速生成' },
  { key: 'chat', title: 'AI 对话', desc: '角色陪聊 / 剧情续写' },
  { key: 'novel', title: 'AI 小说', desc: '按设定生成章节' },
]

export const hotWords = ['星河旅人', '夜色书店', '今日上新', '韩漫', '完结推荐']

export const listTitles: Record<string, string> = {
  topic: '专题',
  hot: '热门',
  daily: '今日上新',
  rank: '漫画榜',
  recommend: '精选推荐',
  category: '分类',
  ad: '精选推荐',
}

export function findComic(id: string) {
  return comics.find((x) => x.id === id) ?? comics[0]
}

export function findVideo(id: string) {
  return videos.find((x) => x.id === id) ?? videos[0]
}
