import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchAds, reportAdEvent, type AdItem } from '@/api/ads'
import { useUserStore } from '@/stores/user'

const seenImp = new Set<string>()

export const useAdsStore = defineStore('ads', () => {
  const cache = ref<Record<string, AdItem[]>>({})
  const splashOpen = ref(false)
  const popupOpen = ref(false)
  const userStore = useUserStore()
  const hidePlayer = computed(() => userStore.isVip)

  const load = async (slot: string, limit = 10) => {
    if (cache.value[slot]) return cache.value[slot]
    try {
      const data = await fetchAds(slot, limit)
      cache.value[slot] = data.list || []
    } catch {
      cache.value[slot] = []
    }
    return cache.value[slot]
  }

  const listOf = (slot: string) => cache.value[slot] || []
  const firstOf = (slot: string) => listOf(slot)[0]

  const impression = (ad?: AdItem) => {
    if (!ad?.campaign_id) return
    const key = `${ad.slot_code}:${ad.campaign_id}:${ad.creative_id}`
    if (seenImp.has(key)) return
    seenImp.add(key)
    reportAdEvent({
      event_type: 'impression',
      campaign_id: ad.campaign_id,
      creative_id: ad.creative_id,
      slot_code: ad.slot_code,
    }).catch(() => {})
  }

  const click = (ad?: AdItem) => {
    if (!ad) return
    reportAdEvent({
      event_type: 'click',
      campaign_id: ad.campaign_id,
      creative_id: ad.creative_id,
      slot_code: ad.slot_code,
    }).catch(() => {})
  }

  return { cache, splashOpen, popupOpen, hidePlayer, load, listOf, firstOf, impression, click }
})
