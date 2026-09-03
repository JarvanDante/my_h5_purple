<template>
  <div v-if="visible && ad" class="ad-splash">
    <AdImage :ad="ad" :mark="false" />
    <button type="button" class="skip" @click="close">
      {{ left > 0 ? `${left}s` : '跳过' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'

const adsStore = useAdsStore()
const visible = ref(false)
const left = ref(3)
const ad = ref(adsStore.firstOf(AD_SLOT.splash))
let timer = 0

const close = () => {
  visible.value = false
  adsStore.splashOpen = false
}

onMounted(async () => {
  await adsStore.load(AD_SLOT.splash, 3)
  const hit = adsStore.firstOf(AD_SLOT.splash)
  if (!hit) return
  ad.value = hit
  visible.value = true
  adsStore.splashOpen = true
  timer = window.setInterval(() => {
    left.value -= 1
    if (left.value <= 0) {
      left.value = 0
      window.clearInterval(timer)
      close()
    }
  }, 1000)
})

onUnmounted(() => {
  window.clearInterval(timer)
  adsStore.splashOpen = false
})
</script>

<style scoped lang="scss">
.ad-splash {
  position: absolute;
  inset: 0;
  z-index: 80;
  background: #0b0b0d;

  :deep(.ad-image) {
    width: 100%;
    height: 100%;
  }
}

.skip {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 2;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  padding: 6px 12px;
}
</style>
