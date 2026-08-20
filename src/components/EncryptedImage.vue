<template>
  <img v-if="displaySrc" :src="displaySrc" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { resolveMediaSrc } from '@/utils/aesbnc'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ src?: string }>()
const displaySrc = ref('')

watch(
  () => props.src,
  async (url) => {
    if (!url) {
      displaySrc.value = ''
      return
    }
    try {
      displaySrc.value = await resolveMediaSrc(url)
    } catch {
      displaySrc.value = ''
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  displaySrc.value = ''
})
</script>

<style scoped>
img {
  display: block;
  max-width: 100%;
}
</style>
