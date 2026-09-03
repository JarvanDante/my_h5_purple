<template>
  <section v-if="list.length" class="ad-icons">
    <AdImage v-for="item in list" :key="item.creative_id" :ad="item" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'

const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 15 })
const adsStore = useAdsStore()
const list = computed(() =>
  adsStore.listOf(AD_SLOT.icon).slice(0, props.limit),
)

onMounted(() => {
  adsStore.load(AD_SLOT.icon, props.limit)
})
</script>

<style scoped lang="scss">
.ad-icons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 8px 12px 4px;

  :deep(.ad-image) {
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    background: #1c1c22;
  }
}
</style>
