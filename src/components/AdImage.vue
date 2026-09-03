<template>
  <button v-if="ad?.media_url" type="button" class="ad-image" @click="onClick">
    <EncryptedImage :src="src" alt="" />
    <span v-if="mark" class="ad-mark">广告</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EncryptedImage from '@/components/EncryptedImage.vue'
import type { AdItem } from '@/api/ads'
import { useAdsStore } from '@/stores/ads'
import { openPromoLink } from '@/utils/promoLink'
import { mediaUrl } from '@/utils/request'

const props = withDefaults(
  defineProps<{
    ad?: AdItem | null
    mark?: boolean
  }>(),
  { mark: true },
)

const router = useRouter()
const adsStore = useAdsStore()
const src = computed(() => mediaUrl(props.ad?.media_url))

onMounted(() => {
  if (props.ad) adsStore.impression(props.ad)
})

const onClick = () => {
  if (!props.ad) return
  adsStore.click(props.ad)
  openPromoLink(router, props.ad.link_url)
}
</script>

<style scoped lang="scss">
.ad-image {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: hidden;

  :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.ad-mark {
  position: absolute;
  left: 6px;
  top: 6px;
  z-index: 1;
  font-size: 10px;
  line-height: 1;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 3px;
  padding: 3px 5px;
}
</style>
