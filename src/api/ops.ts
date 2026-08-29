import { request } from '@/utils/request'

export type RedeemResult = { type?: string; add_num?: number; name?: string; desc?: string }
export type RedeemLog = { id?: number; code: string; name?: string; desc?: string; add_num?: number; created_at?: string; actived_at?: string }

export function redeemCode(code: string) {
  return request<RedeemResult>('/user/code/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function fetchRedeemLogs(page = 1, size = 20) {
  return request<{ list: RedeemLog[]; total?: number }>(`/user/code/logs?page=${page}&size=${size}`)
}

export type CheckinReward = {
  day_num: number
  label?: string
  gold: number
  points?: number
  vip_days: number
  is_milestone?: number
}
export type CheckinRecord = {
  date: string
  continuously_days: number
  reward_gold: number
  reward_points?: number
  reward_vip_days?: number
}
export type CheckinInfo = {
  today_checked: boolean
  continuously_days: number
  rewards: CheckinReward[]
  records: CheckinRecord[]
}

export function fetchCheckinInfo() {
  return request<CheckinInfo>('/checkin/prize', { method: 'POST', body: '{}' })
}

export function doCheckin() {
  return request<{
    message: string
    today_checked: boolean
    continuously_days: number
    rewards: { gold: number; points?: number; vip_days: number }[]
  }>('/checkin/click', { method: 'POST', body: '{}' })
}

export type CouponTpl = {
  id: number
  name: string
  type: number
  scene: number
  face_value: number
  discount: number
  threshold: number
  received: boolean
}

export type MyCoupon = {
  id: number
  name: string
  type: number
  status: number
  status_text: string
  face_value: number
  discount: number
  expire_at: string
}

export function fetchCouponTpls() {
  return request<{ list: CouponTpl[] }>('/coupon/tpls')
}

export function receiveCoupon(tplId: number) {
  return request<{ id: number }>('/coupon/receive', {
    method: 'POST',
    body: JSON.stringify({ tpl_id: tplId }),
  })
}

export function fetchMyCoupons(page = 1, size = 20) {
  return request<{ list: MyCoupon[]; total: number }>(`/coupon/my?page=${page}&size=${size}`)
}

export type LotteryInfo = {
  activity_id: number
  name: string
  lottery_type: number
  pay_type: number
  cost_gold: number
  notice: string
  prizes: { id: number; name: string; cover: string; type: number; amount: number }[]
  free_left: number
  draw_left: number
  balance: number
  logged_in: boolean
  marquee: { nickname: string; prize_name: string }[]
}

export function fetchLotteryInfo(lotteryType = 1) {
  return request<LotteryInfo>(`/lottery/info?lottery_type=${lotteryType}`)
}

export function drawLottery(lotteryType = 1, payType = 1) {
  return request<{ prize_name: string; prize_amount: number; free_left: number; draw_left: number; balance: number }>(
    '/lottery/draw',
    { method: 'POST', body: JSON.stringify({ lottery_type: lotteryType, pay_type: payType }) },
  )
}

export type PostItem = {
  id: number
  user_id: number
  nickname?: string
  img?: string
  sex?: number
  title: string
  content: string
  pics: string[]
  topics?: string[]
  video_url?: string
  like_count: number
  comment_count: number
  view_count?: number
  status?: number
  reject_reason?: string
  created_at: string
}

export type CommentItem = {
  id: number
  user_id: number
  nickname?: string
  img?: string
  is_vip?: boolean
  parent_id?: number
  root_id?: number
  reply_user_id?: number
  reply_nickname?: string
  content: string
  pics?: string[]
  like_count: number
  reply_count?: number
  liked?: boolean
  created_at: string
  replies?: CommentItem[]
}

export function fetchComments(contentId: number, page = 1, size = 20, sort = 0) {
  return request<{ list: CommentItem[]; total: number }>('/comment/list', {
    method: 'POST',
    body: JSON.stringify({ media_type: 2, content_id: contentId, page, size, sort }),
  })
}

export function addComment(contentId: number, content: string, parentId = 0, pics: string[] = []) {
  return request<{ id: number; status: number }>('/comment/add', {
    method: 'POST',
    body: JSON.stringify({ media_type: 2, content_id: contentId, parent_id: parentId, content, pics }),
  })
}

export function likeComment(id: number, flag: boolean) {
  return request<{ liked: boolean; like_count: number }>('/comment/like', {
    method: 'POST',
    body: JSON.stringify({ id, flag }),
  })
}

export type PostCategory = { id: number; name: string; kind: number }

export function fetchPostCategories() {
  return request<{ list: PostCategory[] }>('/post/categories')
}

export function fetchPostList(
  sort = 'new',
  page = 1,
  size = 20,
  userId?: number,
  extra?: { follow?: number; category?: string },
) {
  const q = new URLSearchParams({ sort, page: String(page), size: String(size) })
  if (userId) q.set('user_id', String(userId))
  if (extra?.follow) q.set('follow', String(extra.follow))
  if (extra?.category) q.set('category', extra.category)
  return request<{ list: PostItem[]; total: number }>(`/post/list?${q}`)
}

export function fetchPostDetail(id: number) {
  return request<{ post: PostItem }>(`/post/detail?id=${id}`)
}

export function fetchMyPosts(page = 1, size = 50) {
  return request<{ list: PostItem[]; total: number }>(`/post/my?page=${page}&size=${size}`)
}

export function createPost(body: {
  title: string
  content: string
  pics: string[]
  topics: string[]
  video_url?: string
}) {
  return request<{ id: number }>('/post/create', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type RepoTag = { id: number; name: string }

export function fetchRepoTags(type: number, size = 40) {
  return request<{ list: RepoTag[] }>('/tag/repo/list', {
    method: 'POST',
    body: JSON.stringify({ type, page: 1, size }),
  })
}

export function fetchPostTopics() {
  return fetchRepoTags(6, 50)
}

export type MessageItem = {
  id: number
  type: number
  title: string
  content: string
  is_read: boolean
  created_at: string
}

export function fetchMessages(page = 1, size = 20) {
  return request<{ list: MessageItem[]; total: number }>(`/message/list?page=${page}&size=${size}`)
}

export function fetchUnreadCount() {
  return request<{ count: number; sys?: number; comment?: number; like?: number }>('/message/unread')
}

export type InteractItem = {
  id: number
  channel: string
  sub_type: string
  is_read: boolean
  created_at: string
  actor_id: number
  actor_name: string
  actor_avatar: string
  actor_sex?: number
  actor_count: number
  media_type: number
  content_id: number
  object_title: string
  target_type: string
  comment_id: number
  root_comment_id: number
  snippet: string
  page?: number
  page_size?: number
  deleted?: boolean
}

export function fetchInteractMessages(channel: 'comment' | 'like', page = 1, size = 20) {
  return request<{ list: InteractItem[]; total: number }>(
    `/message/interact?channel=${channel}&page=${page}&size=${size}`,
  )
}

export function readInteractMessage(id = 0, all = false, channel = '') {
  return request<Record<string, never>>('/message/interact/read', {
    method: 'POST',
    body: JSON.stringify({ id, all, channel }),
  })
}

export type FeedbackItem = {
  id: number
  problem_type: number
  content: string
  status: number
  reply?: string
  created_at: string
}

export function addFeedback(body: {
  type?: number
  problem_type: number
  content: string
  sys_info?: string
}) {
  return request<{ id: number }>('/feedback/add', {
    method: 'POST',
    body: JSON.stringify({ type: 1, pics: [], ...body }),
  })
}

export function fetchMyFeedback(page = 1, size = 20) {
  return request<{ list: FeedbackItem[]; total: number }>(`/feedback/my?page=${page}&size=${size}`)
}

export function readMessage(id = 0, all = false) {
  return request<Record<string, never>>('/message/read', {
    method: 'POST',
    body: JSON.stringify({ id, all }),
  })
}
