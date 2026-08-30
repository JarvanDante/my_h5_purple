import { request } from '@/utils/request'

export type NoticeItem = {
  id: number
  title: string
  content: string
}

export function fetchNoticeList() {
  return request<{ list: NoticeItem[] }>('/notice/list')
}
