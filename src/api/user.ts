import { request } from '@/utils/request'

export type UserInfo = {
  id: number
  username: string
  nickname: string
  phone: string
  img: string
  signature: string
  sex: number
  level: number
  balance: number
  credit: number
  group_name: string
  group_end_time?: number
  fans: number
  follow: number
  has_password?: boolean
  has_parent?: boolean
  is_vip?: boolean
  ext?: Record<string, unknown>
}

export type VipPackage = {
  id: number
  name: string
  days: number
  price: number
}

export type RechargePackage = {
  id: number
  name: string
  amount: number
  coin: number
  bonus: number
}

export function login(body: { device_id: string; device_type: string; device_version: string }) {
  return request<{ token: string; user: UserInfo }>('/user/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function loginByAccount(body: {
  username: string
  password: string
  device_id: string
  device_type: string
  device_version: string
}) {
  return request<{ token: string; user: UserInfo }>('/user/account-login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function setPassword(body: { password: string; old_password?: string }) {
  return request<Record<string, never>>('/user/password', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchUserInfo() {
  return request<UserInfo>('/user/info')
}

export function logout() {
  return request<Record<string, never>>('/user/logout', { method: 'POST', body: '{}' })
}

export function updateProfile(body: { nickname?: string; img?: string; sex?: number }) {
  return request<Record<string, never>>('/user/update', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchAvatars() {
  return request<{ list: string[] }>('/user/avatars')
}

export function fetchVipPackages() {
  return request<{ list: VipPackage[] }>('/user/vip')
}

export function buyVip(packageId: number) {
  return request<Record<string, never>>('/user/vip/do', {
    method: 'POST',
    body: JSON.stringify({ package_id: packageId }),
  })
}

export function bindInviteCode(code: string) {
  return request<Record<string, never>>('/user/bind-code', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function fetchRechargePackages() {
  return request<{ list: RechargePackage[] }>('/user/recharge')
}

export function createRecharge(packageId: number) {
  return request<{ order_no: string; amount: number; coin: number }>('/user/recharge/do', {
    method: 'POST',
    body: JSON.stringify({ package_id: packageId }),
  })
}

export function mockPayRecharge(orderNo: string) {
  return request<Record<string, never>>('/user/recharge/mock-pay', {
    method: 'POST',
    body: JSON.stringify({ order_no: orderNo }),
  })
}

export type PublicUser = {
  id: number
  nickname: string
  img: string
  sex?: number
  fans?: number
  follow?: number
  signature?: string
  is_vip?: boolean
}

export function fetchUserHome(id: number) {
  return request<{ user: PublicUser; is_followed: boolean }>(`/user/home/${id}`)
}

export function toggleFollow(homeId: number) {
  return request<{ followed: boolean }>('/user/follow', {
    method: 'POST',
    body: JSON.stringify({ home_id: homeId }),
  })
}

export function fetchFollows(page = 1, size = 50) {
  return request<{ list: PublicUser[]; total: number }>(`/user/follows?page=${page}&size=${size}`)
}

export function fetchFans(page = 1, size = 50) {
  return request<{ list: PublicUser[]; total: number }>(`/user/fans?page=${page}&size=${size}`)
}

export type ShareInfo = {
  share_code: string
  share_url: string
  share_num: number
}

export type ShareLog = {
  id: number
  type: string
  target_id?: number
  channel?: string
  created_at: string
}

export function fetchShareInfo() {
  return request<ShareInfo>('/user/share')
}

export function reportShare(type = 'link', channel = 'h5') {
  return request<Record<string, never>>('/user/share/report', {
    method: 'POST',
    body: JSON.stringify({ type, channel }),
  })
}

export function fetchShareLogs(page = 1, size = 20) {
  return request<{ list: ShareLog[]; total: number }>(`/user/share/logs?page=${page}&size=${size}`)
}

export type Invitee = {
  nickname: string
  invite_code: string
  created_at: string
}

export function fetchInvitees(page = 1, size = 50) {
  return request<{ list: Invitee[]; total: number }>(`/user/share/invitees?page=${page}&size=${size}`)
}

export function fetchCustomerUrl() {
  return request<{ url: string }>('/user/customer-url')
}

export type UserTask = {
  id: number
  name: string
  type: string
  description: string
  max_num: number
  done_today: number
  reward?: number
}

export function fetchUserTasks() {
  return request<{ list: UserTask[] }>('/user/tasks')
}

export function doUserTask(taskId: number) {
  return request<{ done_today: number; max_num: number; reward: number }>('/user/task/do', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  })
}
