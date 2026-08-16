<template>
  <video
    ref="el"
    class="media"
    controls
    playsinline
    :poster="poster || undefined"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{ src: string; poster?: string }>()
const el = ref<HTMLVideoElement | null>(null)
let hls: { destroy: () => void } | null = null

const attach = async (url: string) => {
  const video = el.value
  if (!video || !url) return
  hls?.destroy()
  hls = null
  const isHls = /\.m3u8(\?|$)/i.test(url)
  if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    return
  }
  if (isHls) {
    const { default: Hls } = await import('hls.js')
    if (Hls.isSupported()) {
      const inst = new Hls({ enableWorker: true })
      inst.loadSource(url)
      inst.attachMedia(video)
      hls = inst
      return
    }
  }
  video.src = url
}

onMounted(() => attach(props.src))
watch(() => props.src, (url) => attach(url))
onBeforeUnmount(() => {
  hls?.destroy()
  hls = null
})
</script>

<style scoped>
.media {
  width: 100%;
  max-height: 240px;
  background: #000;
}
</style>
