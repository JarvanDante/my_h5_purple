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
  fans: number
  follow: number
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

export function fetchUserInfo() {
  return request<UserInfo>('/user/info')
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

export function fetchRechargePackages() {
  return request<{ list: RechargePackage[] }>('/user/recharge')
}
