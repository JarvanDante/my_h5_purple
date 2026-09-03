<template>
  <div v-if="visible && list.length" class="ad-float">
    <button type="button" class="x" aria-label="关闭" @click.stop="close">×</button>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdCarousel } from '@/composables/useAdCarousel'
import { useAdsStore } from '@/stores/ads'

const KEY = 'h5_ad_float_closed'
const adsStore = useAdsStore()
const closed = ref(sessionStorage.getItem(KEY) === '1')
const track = ref<HTMLElement>()
const list = computed(() => adsStore.listOf(AD_SLOT.float))
const visible = computed(
  () => !closed.value && !adsStore.splashOpen && !adsStore.popupOpen && list.value.length > 0,
)
const { slides, onScroll, settleClone } = useAdCarousel(track, list, visible)

const close = () => {
  closed.value = true
  sessionStorage.setItem(KEY, '1')
}

onMounted(() => {
  adsStore.load(AD_SLOT.float, 10)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.ad-float {
  position: absolute;
  right: 10px;
  bottom: calc(#{$tabbar-height} + 16px);
  z-index: 40;
  width: 96px;
}

.hero-track {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 10px;
  scroll-snap-type: x mandatory;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);

  &::-webkit-scrollbar {
    display: none;
  }
}

.hero-slide {
  flex: 0 0 100%;
  width: 100%;
  scroll-snap-align: start;

  :deep(.ad-image) {
    border-radius: 0;
    overflow: hidden;
    aspect-ratio: 1;
  }
}

.x {
  position: absolute;
  right: -6px;
  top: -6px;
  z-index: 2;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 14px;
  line-height: 1;
}
</style>
