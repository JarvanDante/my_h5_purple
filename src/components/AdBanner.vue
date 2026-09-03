<template>
  <section v-if="list.length" class="ad-banner">
    <div
      ref="track"
      class="hero-track"
      @scroll.passive="onScroll"
      @scrollend="settleClone"
    >
      <div v-for="(item, i) in slides" :key="`${item.creative_id}-${i}`" class="hero-slide">
        <AdImage :ad="item" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdCarousel } from '@/composables/useAdCarousel'
import { useAdsStore } from '@/stores/ads'

const props = withDefaults(
  defineProps<{
    index?: number
  }>(),
  { index: 0 },
)

const adsStore = useAdsStore()
const track = ref<HTMLElement>()
const list = computed(() => {
  const raw = adsStore.listOf(AD_SLOT.banner)
  if (!raw.length) return raw
  const start = props.index % raw.length
  return start ? [...raw.slice(start), ...raw.slice(0, start)] : raw
})
const enabled = computed(() => list.value.length > 0)
const { slides, onScroll, settleClone } = useAdCarousel(track, list, enabled)

onMounted(() => {
  adsStore.load(AD_SLOT.banner, 10)
})
</script>

<style scoped lang="scss">
.ad-banner {
  margin: 8px 12px 4px;
  border-radius: 10px;
  overflow: hidden;
  background: #1c1c22;
}

.hero-track {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.hero-slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: start;

  :deep(.ad-image) {
    aspect-ratio: 16 / 5;
  }
}
</style>
