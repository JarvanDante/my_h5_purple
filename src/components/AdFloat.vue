<template>
  <div v-if="visible && ad" class="ad-float">
    <button type="button" class="x" aria-label="关闭" @click="close">×</button>
    <AdImage :ad="ad" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { AD_SLOT } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'

const KEY = 'h5_ad_float_closed'
const adsStore = useAdsStore()
const closed = ref(sessionStorage.getItem(KEY) === '1')
const ad = computed(() => (adsStore.hidden ? undefined : adsStore.firstOf(AD_SLOT.float)))
const visible = computed(
  () => !closed.value && !adsStore.hidden && !adsStore.splashOpen && !adsStore.popupOpen && !!ad.value,
)

const close = () => {
  closed.value = true
  sessionStorage.setItem(KEY, '1')
}

onMounted(() => {
  adsStore.load(AD_SLOT.float, 3)
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

.ad-float :deep(.ad-image) {
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
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
