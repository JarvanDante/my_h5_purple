import { request } from '@/utils/request'

export type OfficialGroup = {
  id: number
  name: string
  intro: string
  avatar: string
  link: string
  platform: string
}

export type WelfareApp = {
  id: number
  name: string
  tag: number
  desc: string
  avatar: string
  download_url: string
  iosUrl: string
  androidUrl: string
}

export function fetchOfficialGroups() {
  return request<{ list: OfficialGroup[] }>('/group/list')
}

export function fetchWelfareApps() {
  return request<{ list: WelfareApp[] }>('/application/list')
}

export function reportAppClick(id: number) {
  return request<Record<string, never>>('/application/click', {
    method: 'POST',
    body: JSON.stringify({ id }),
  })
}
