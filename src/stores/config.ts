import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchConfig, type ConfigMap } from '@/api/config'

export const useConfigStore = defineStore('config', () => {
  const configs = ref<ConfigMap>({})
  const loaded = ref(false)

  const appName = computed(() => String(configs.value.app_name || 'Purple'))
  const maintenance = computed(() => Boolean(configs.value.maintenance))
  const shareUrl = computed(() => String(configs.value.share_url || ''))
  const commentOpen = computed(() => configs.value.is_open_comment !== false)

  const load = async () => {
    const data = await fetchConfig()
    configs.value = data.configs || {}
    loaded.value = true
  }

  return { configs, loaded, appName, maintenance, shareUrl, commentOpen, load }
})
