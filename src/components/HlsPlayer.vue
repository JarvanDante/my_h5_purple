<template>
  <video
    ref="el"
    class="media"
    controls
    playsinline
    crossorigin="anonymous"
    :poster="poster || undefined"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { showToast } from 'vant'

const props = defineProps<{ src: string; poster?: string }>()
const el = ref<HTMLVideoElement | null>(null)
let hls: { destroy: () => void } | null = null

const attach = async (url: string) => {
  const video = el.value
  if (!video || !url) return
  hls?.destroy()
  hls = null
  video.removeAttribute('src')
  video.load()

  const isHls = /\.m3u8(\?|$)/i.test(url)
  if (isHls) {
    const { default: Hls } = await import('hls.js')
    // MSE 可用时优先 hls.js, 避免 Safari 原生 HLS 跟 302 预签名失败。
    if (Hls.isSupported()) {
      const inst = new Hls({ enableWorker: true, xhrSetup: (xhr) => {
        xhr.withCredentials = false
      } })
      inst.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          showToast('视频加载失败')
        }
      })
      inst.loadSource(url)
      inst.attachMedia(video)
      hls = inst
      return
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
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
