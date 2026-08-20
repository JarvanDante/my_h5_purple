<template>
  <div class="cover-mosaic">
    <div v-if="displaySrc" class="tile" :style="{ backgroundImage: `url(${displaySrc})` }" />
    <EncryptedImage v-if="src" :src="src" alt="" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import EncryptedImage from '@/components/EncryptedImage.vue'
import { useEncryptedSrc } from '@/composables/useEncryptedSrc'

const props = defineProps<{ src?: string }>()
const displaySrc = useEncryptedSrc(() => props.src)
</script>

<style scoped lang="scss">
.cover-mosaic {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: #ece4e8;
}

.tile {
  position: absolute;
  inset: -8%;
  background-repeat: repeat;
  background-size: 46px auto;
  opacity: 0.42;
  filter: saturate(0.85);
}

img,
:deep(img) {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.92;
}
</style>
