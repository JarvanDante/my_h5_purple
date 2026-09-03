<template>
  <div v-if="visible && list.length" class="ad-splash" @click.stop>
    <div class="viewport">
      <div
        class="track"
        :class="{ anim: sliding }"
        :style="{ transform: `translate3d(${-index * 100}%, 0, 0)` }"
        @transitionend="onSlideEnd"
      >
        <div v-for="(item, i) in slides" :key="`${item.creative_id}-${i}`" class="slide">
          <AdImage :ad="item" :mark="false" />
        </div>
      </div>
    </div>
    <button
      type="button"
      class="enter"
      :disabled="left > 0"
      @click.stop="onEnter"
    >
      {{ left > 0 ? `${left}s` : '进入' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { AD_SLOT, type AdItem } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'

const adsStore = useAdsStore()
const visible = ref(false)
const left = ref(5)
const list = ref<AdItem[]>([])
const index = ref(0)
const sliding = ref(true)
let countTimer = 0
let slideTimer = 0

const slides = computed(() => {
  if (list.value.length <= 1) return list.value
  return [...list.value, list.value[0]]
})

const close = () => {
  visible.value = false
  adsStore.splashOpen = false
  window.clearInterval(countTimer)
  window.clearInterval(slideTimer)
}

const onEnter = () => {
  if (left.value > 0) return
  close()
}

const onSlideEnd = () => {
  if (list.value.length <= 1 || index.value < list.value.length) return
  sliding.value = false
  index.value = 0
  requestAnimationFrame(() => {
    sliding.value = true
  })
}

const startSlide = () => {
  if (list.value.length <= 1) return
  slideTimer = window.setInterval(() => {
    if (index.value >= list.value.length) return
    sliding.value = true
    index.value += 1
    const cur = list.value[index.value % list.value.length]
    adsStore.impression(cur)
  }, 500)
}

onMounted(async () => {
  await adsStore.load(AD_SLOT.splash, 10)
  const hits = adsStore.listOf(AD_SLOT.splash)
  if (!hits.length) return
  list.value = hits
  visible.value = true
  adsStore.splashOpen = true
  adsStore.impression(hits[0])
  countTimer = window.setInterval(() => {
    if (left.value <= 1) {
      left.value = 0
      window.clearInterval(countTimer)
      return
    }
    left.value -= 1
  }, 1000)
  startSlide()
})

onUnmounted(() => {
  window.clearInterval(countTimer)
  window.clearInterval(slideTimer)
  adsStore.splashOpen = false
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.ad-splash {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: #0b0b0d;
  overflow: hidden;
}

.viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.track {
  display: flex;
  height: 100%;
  will-change: transform;

  &.anim {
    transition: transform 0.35s ease-out;
  }
}

.slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;

  :deep(.ad-image) {
    width: 100%;
    height: 100%;
  }
}

.enter {
  position: absolute;
  right: 12px;
  top: calc(12px + env(safe-area-inset-top, 0px));
  z-index: 2;
  min-width: 52px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  padding: 6px 12px;

  &:disabled {
    opacity: 0.85;
  }
}

@media (min-width: $desktop-preview-min) {
  .ad-splash {
    left: 50%;
    right: auto;
    width: 100%;
    max-width: $phone-max-width;
    transform: translateX(-50%);
  }
}
</style>
