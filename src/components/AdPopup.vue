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
