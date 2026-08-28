<template>
  <video
    ref="el"
    class="media"
    :class="{ 'is-bare': !controls }"
    :controls="controls"
    :muted="muted"
    playsinline
    webkit-playsinline
    controlslist="nodownload"
    disablepictureinpicture
    crossorigin="anonymous"
    :poster="poster || undefined"
    @play="onPlay"
    @pause="onPause"
    @timeupdate="onTime"
    @loadedmetadata="onTime"
    @click="onClick"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { showToast } from 'vant'

const props = withDefaults(
  defineProps<{ src: string; poster?: string; controls?: boolean; muted?: boolean }>(),
  { controls: true, muted: false },
)
const emit = defineEmits<{
  play: []
  'user-pause': []
  'native-fullscreen': []
  timeupdate: [current: number, duration: number]
  click: []
}>()
const el = ref<HTMLVideoElement | null>(null)
let hls: { destroy: () => void } | null = null
let ignorePause = false

const attach = async (url: string) => {
  const video = el.value
  if (!video || !url) return
  ignorePause = true
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
    } else {
      video.src = url
    }
  } else {
    video.src = url
  }
  video.muted = props.muted
  window.setTimeout(() => {
    ignorePause = false
  }, 0)
}

const onPause = () => {
  if (ignorePause) return
  const video = el.value
  if (!video || video.ended) return
  emit('user-pause')
}

const onPlay = () => {
  ignorePause = false
  emit('play')
}

const onTime = () => {
  const video = el.value
  if (!video) return
  emit('timeupdate', video.currentTime || 0, video.duration || 0)
}

const onClick = () => emit('click')

const toggle = () => {
  const video = el.value
  if (!video) return
  if (video.paused) video.play()
  else video.pause()
}

const seek = (sec: number) => {
  const video = el.value
  if (!video || !Number.isFinite(sec)) return
  video.currentTime = Math.max(0, sec)
}

watch(
  () => props.muted,
  (muted) => {
    if (el.value) el.value.muted = muted
  },
)

const stealNativeFullscreen = () => {
  const video = el.value as (HTMLVideoElement & { webkitExitFullscreen?: () => void }) | null
  if (!video) return
  if (document.fullscreenElement === video) {
    document.exitFullscreen?.().catch(() => undefined)
  }
  video.webkitExitFullscreen?.()
  emit('native-fullscreen')
}

const onDocFullscreen = () => {
  if (document.fullscreenElement === el.value) stealNativeFullscreen()
}

const play = () => el.value?.play()
const pause = () => el.value?.pause()

onMounted(() => {
  attach(props.src)
  const video = el.value
  video?.addEventListener('webkitbeginfullscreen', stealNativeFullscreen)
  document.addEventListener('fullscreenchange', onDocFullscreen)
})
watch(() => props.src, (url) => attach(url))
onBeforeUnmount(() => {
  el.value?.removeEventListener('webkitbeginfullscreen', stealNativeFullscreen)
  document.removeEventListener('fullscreenchange', onDocFullscreen)
  hls?.destroy()
  hls = null
})

defineExpose({ play, pause, toggle, seek })
</script>

<style scoped>
.media {
  width: 100%;
  max-height: 240px;
  background: #000;
}

.media.is-bare {
  max-height: none;
  height: 100%;
  object-fit: contain;
}
</style>
