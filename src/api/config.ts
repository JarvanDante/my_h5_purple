import { request } from '@/utils/request'

export type ConfigMap = Record<string, unknown>

export function fetchConfig(grp = '') {
  const q = grp ? `?grp=${encodeURIComponent(grp)}` : ''
  return request<{ configs: ConfigMap }>(`/config/info${q}`)
}
