<template>
  <section v-if="ad" class="ad-banner">
    <AdImage :ad="ad" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'

const props = withDefaults(
  defineProps<{
    index?: number
  }>(),
  { index: 0 },
)

const adsStore = useAdsStore()
const ad = computed(() => {
  if (adsStore.hidden) return undefined
  const list = adsStore.listOf(AD_SLOT.banner)
  if (!list.length) return undefined
  return list[props.index % list.length]
})

onMounted(() => {
  adsStore.load(AD_SLOT.banner, 6)
})
</script>

<style scoped lang="scss">
.ad-banner {
  margin: 8px 12px 4px;
  border-radius: 10px;
  overflow: hidden;
  background: #1c1c22;

  :deep(.ad-image) {
    aspect-ratio: 16 / 5;
  }
}
</style>
