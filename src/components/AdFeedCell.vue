<template>
  <div v-if="list.length" class="feed-cell">
    <div class="thumb">
      <div
        ref="track"
        class="hero-track"
        @scroll.passive="onScroll"
        @scrollend="settleClone"
      >
        <div v-for="(item, i) in slides" :key="`${item.creative_id}-${i}`" class="hero-slide">
          <AdImage :ad="item" :mark="false" />
        </div>
      </div>
      <span class="ad-mark">广告</span>
    </div>
    <p class="card-title ellipsis">{{ current?.title || '广告' }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdCarousel } from '@/composables/useAdCarousel'
import { useAdsStore } from '@/stores/ads'

const props = withDefaults(
  defineProps<{
    offset?: number
  }>(),
  { offset: 0 },
)

const adsStore = useAdsStore()
const track = ref<HTMLElement>()
const list = computed(() => {
  const raw = adsStore.listOf(AD_SLOT.feed)
  if (!raw.length) return raw
  const start = props.offset % raw.length
  return start ? [...raw.slice(start), ...raw.slice(0, start)] : raw
})
const enabled = computed(() => list.value.length > 0)
const { slides, current, onScroll, settleClone } = useAdCarousel(track, list, enabled, true)

onMounted(() => {
  adsStore.load(AD_SLOT.feed, 10)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.thumb {
  position: relative;
  width: 100%;
  border-radius: $radius-thumb;
  overflow: hidden;
}

.hero-track {
  display: flex;
  width: 100%;
  height: 100%;
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
  height: 100%;
  scroll-snap-align: start;

  :deep(.ad-image) {
    width: 100%;
    height: 100%;
  }
}

.ad-mark {
  position: absolute;
  right: 6px;
  bottom: 6px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  border-radius: 4px;
  padding: 3px 5px;
}

.card-title {
  margin-top: 7px;
  font-size: 12.5px;
  color: $ink;
  font-weight: 550;
}
</style>
