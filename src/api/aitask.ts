import { request } from '@/utils/request'

export const AI_BIZ_FACE_SWAP = 1
export const AI_BIZ_UNDRESS = 2

export type AiTask = {
  id: number
  task_no: string
  biz_type: number
  template_id: number
  params: Record<string, unknown>
  input_url: string
  cost_gold: number
  status: number
  result: Record<string, unknown>
  err_msg: string
  retry_count: number
  submitted_at: string
  finished_at: string
  created_at: string
}

export type AiTemplate = {
  id: number
  name: string
  biz_type: number
  cover: string
  preview: string
  params: Record<string, unknown>
  cost_gold: number
  sort: number
}

export function fetchAiTemplates(bizType = 0) {
  return request<{ list: AiTemplate[] }>(`/ai/templates?biz_type=${bizType}`)
}

export function submitAiTask(body: {
  biz_type: number
  template_id?: number
  params?: Record<string, unknown>
  input_url?: string
  client_token: string
}) {
  return request<{ task: AiTask; balance: number; repeated: boolean }>('/ai/submit', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchAiTask(id: number) {
  return request<{ task: AiTask }>(`/ai/task?id=${id}`)
}

export function fetchAiTasks(bizType = 0, page = 1, size = 20) {
  const q = new URLSearchParams({
    biz_type: String(bizType || ''),
    page: String(page),
    size: String(size),
  })
  return request<{ list: AiTask[]; total: number }>(`/ai/tasks?${q}`)
}

export function taskResultUrl(task?: AiTask | null) {
  const url = task?.result?.url
  return typeof url === 'string' ? url : ''
}

export function taskCoverUrl(task?: AiTask | null) {
  return taskResultUrl(task) || task?.input_url || ''
}

export function isTaskRunning(status: number) {
  return status === 1 || status === 2
}

export function templateTargetUrl(tpl?: AiTemplate | null) {
  if (!tpl) return ''
  const raw = tpl.params?.target_url || tpl.params?.target || tpl.cover || tpl.preview
  return typeof raw === 'string' ? raw : ''
}

export function templateCategories(tpl: AiTemplate) {
  const arr = tpl.params?.categories
  if (Array.isArray(arr)) {
    return arr.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim())
  }
  const raw = tpl.params?.category
  return typeof raw === 'string' && raw.trim() ? [raw.trim()] : ['精选推荐']
}

export function templateCategory(tpl: AiTemplate) {
  return templateCategories(tpl)[0] || '精选推荐'
}

export function taskStatusText(status: number) {
  switch (status) {
    case 1:
      return '排队中'
    case 2:
      return '处理中'
    case 3:
      return '已完成'
    case 4:
      return '失败'
    case 5:
      return '已退款'
    case 6:
      return '已取消'
    default:
      return '未知'
  }
}
