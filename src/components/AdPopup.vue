<template>
  <div v-if="visible && ad" class="ad-popup" @click.stop>
    <div class="box">
      <AdImage :key="ad.creative_id" :ad="ad" />
      <button type="button" class="x" aria-label="关闭" @click.stop="close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AD_SLOT, type AdItem } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'

const adsStore = useAdsStore()
const visible = ref(false)
const queue = ref<AdItem[]>([])
const ad = computed(() => queue.value[0])

const tryShow = () => {
  if (adsStore.splashOpen) return
  if (!queue.value.length) {
    visible.value = false
    adsStore.popupOpen = false
    return
  }
  visible.value = true
  adsStore.popupOpen = true
}

const close = () => {
  queue.value = queue.value.slice(1)
  tryShow()
}

onMounted(async () => {
  await adsStore.load(AD_SLOT.popup, 10)
  queue.value = [...adsStore.listOf(AD_SLOT.popup)]
  tryShow()
})

watch(
  () => adsStore.splashOpen,
  (open) => {
    if (!open) tryShow()
  },
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.ad-popup {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px 20px calc(48px + env(safe-area-inset-bottom, 0px));
}

.box {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 360px, calc((100dvh - 140px) * 600 / 800));
  max-height: 100%;
}

.box :deep(.ad-image) {
  width: fit-content;
  max-width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.box :deep(.ad-image img) {
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: calc(100dvh - 140px);
  object-fit: contain;
}

.x {
  display: block;
  flex-shrink: 0;
  margin: 14px auto 0;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  background: transparent;
  color: #fff;
  font-size: 20px;
  line-height: 1;
}

@media (min-width: $desktop-preview-min) {
  .ad-popup {
    left: 50%;
    right: auto;
    width: 100%;
    max-width: $phone-max-width;
    transform: translateX(-50%);
  }
}
</style>
