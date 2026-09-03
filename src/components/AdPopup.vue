<template>
  <div v-if="visible && ad" class="ad-popup" @click.self="close">
    <div class="box">
      <AdImage :ad="ad" />
      <button type="button" class="x" aria-label="关闭" @click="close">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'

const adsStore = useAdsStore()
const visible = ref(false)
const ad = ref(adsStore.firstOf(AD_SLOT.popup))

const tryShow = () => {
  if (adsStore.splashOpen || visible.value) return
  const hit = adsStore.firstOf(AD_SLOT.popup)
  if (!hit) return
  ad.value = hit
  visible.value = true
  adsStore.popupOpen = true
}

const close = () => {
  visible.value = false
  adsStore.popupOpen = false
}

onMounted(async () => {
  await adsStore.load(AD_SLOT.popup, 3)
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
.ad-popup {
  position: absolute;
  inset: 0;
  z-index: 70;
  background: rgba(0, 0, 0, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 28px 72px;
}

.box {
  position: relative;
  width: min(78vw, 320px);
}

.box :deep(.ad-image) {
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
}

.x {
  display: block;
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
</style>
