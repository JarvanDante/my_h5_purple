import { request } from '@/utils/request'

export type WalletBalance = {
  balance: number
  frozen: number
  total_in: number
  total_out: number
  withdrawn: number
}

export type WaterItem = {
  id: number
  direction: number
  scene: string
  amount: number
  balance_before: number
  balance_after: number
  remark: string
  created_at: string
}

export function fetchWalletBalance() {
  return request<WalletBalance>('/wallet/balance')
}

export function fetchWalletWaters(page = 1, size = 20) {
  return request<{ list: WaterItem[]; total: number }>(`/wallet/waters?page=${page}&size=${size}`)
}
