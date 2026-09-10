import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchConfig, type ConfigMap } from '@/api/config'
import { mediaUrl } from '@/utils/request'

/** 本站默认 logo，跟仓库走；后台配了 app_logo / logo 时再覆盖 */
const DEFAULT_APP_LOGO = '/logo.png'

export const useConfigStore = defineStore('config', () => {
  const configs = ref<ConfigMap>({})
  const loaded = ref(false)

  const appName = computed(() => String(configs.value.app_name || 'Purple'))
  const appLogo = computed(() => {
    const raw = String(configs.value.app_logo || configs.value.logo || '')
    return raw ? mediaUrl(raw) : DEFAULT_APP_LOGO
  })
  const maintenance = computed(() => Boolean(configs.value.maintenance))
  const shareUrl = computed(() => String(configs.value.share_url || ''))
  const commentOpen = computed(() => configs.value.is_open_comment !== false)

  const load = async () => {
    const data = await fetchConfig()
    configs.value = data.configs || {}
    loaded.value = true
  }

  return { configs, loaded, appName, appLogo, maintenance, shareUrl, commentOpen, load }
})
