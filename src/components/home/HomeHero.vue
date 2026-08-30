<template>
  <section v-if="items.length" class="home-hero">
    <div
      ref="track"
      class="hero-track"
      @scroll.passive="onScroll"
      @scrollend="settleClone"
      @touchstart.passive="pause"
      @touchend.passive="resumeLater"
      @mouseenter="pause"
      @mouseleave="resumeLater"
    >
      <button
        v-for="(item, i) in slides"
        :key="`${item.id}-${i}`"
        type="button"
        class="hero-slide"
        @click="$emit('select', item)"
      >
        <EncryptedImage v-if="item.cover" :src="item.cover" alt="" />
        <span v-else class="hero-fallback" />
        <span class="hero-mask" />
        <span v-if="item.title" class="hero-title">{{ item.title }}</span>
      </button>
    </div>
    <div v-if="items.length > 1" class="hero-dots">
      <i v-for="(_, i) in items" :key="i" :class="{ on: i === dotIndex }" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import type { CoverItem } from '@/data/mock'

const props = defineProps<{
  items: CoverItem[]
}>()

defineEmits<{
  select: [item: CoverItem]
}>()

const track = ref<HTMLElement>()
const index = ref(0)
const slides = computed(() =>
  props.items.length > 1 ? [...props.items, props.items[0]] : props.items,
)
const dotIndex = computed(() => {
  const n = props.items.length
  if (!n) return 0
  return index.value >= n ? 0 : index.value
})

const INTERVAL_MS = 5000
const SLIDE_MS = 1000

let timer = 0
let resumeTimer = 0
let anim = 0
let jumping = false

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const onScroll = () => {
  const el = track.value
  if (jumping || !el?.clientWidth) return
  index.value = Math.round(el.scrollLeft / el.clientWidth)
}

const snapHome = () => {
  const el = track.value
  if (!el) return
  jumping = true
  el.style.scrollSnapType = 'none'
  el.style.scrollBehavior = 'auto'
  el.scrollTo({ left: 0, behavior: 'auto' })
  index.value = 0
  requestAnimationFrame(() => {
    el.style.scrollSnapType = ''
    el.style.scrollBehavior = ''
    jumping = false
  })
}

const settleClone = () => {
  if (props.items.length > 1 && index.value >= props.items.length) snapHome()
}

const scrollToIndex = (next: number) => {
  const el = track.value
  if (!el?.clientWidth) return
  window.cancelAnimationFrame(anim)
  const from = el.scrollLeft
  const to = next * el.clientWidth
  const started = performance.now()
  el.style.scrollSnapType = 'none'
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / SLIDE_MS)
    el.scrollLeft = from + (to - from) * easeInOut(t)
    if (t < 1) {
      anim = requestAnimationFrame(step)
      return
    }
    el.style.scrollSnapType = ''
    if (next >= props.items.length) settleClone()
  }
  anim = requestAnimationFrame(step)
}

const goNext = () => {
  const el = track.value
  const n = props.items.length
  if (jumping || !el?.clientWidth || n <= 1) return
  const next = index.value >= n ? 1 : index.value + 1
  index.value = next
  scrollToIndex(next)
}

const stop = () => {
  window.clearInterval(timer)
  timer = 0
}

const start = () => {
  stop()
  if (props.items.length <= 1) return
  timer = window.setInterval(goNext, INTERVAL_MS)
}

const pause = () => {
  stop()
  window.cancelAnimationFrame(anim)
  window.clearTimeout(resumeTimer)
}

const resumeLater = () => {
  window.clearTimeout(resumeTimer)
  resumeTimer = window.setTimeout(() => {
    settleClone()
    start()
  }, INTERVAL_MS)
}

const onHide = () => {
  if (document.hidden) pause()
  else start()
}

onMounted(() => {
  start()
  document.addEventListener('visibilitychange', onHide)
})

onUnmounted(() => {
  pause()
  window.cancelAnimationFrame(anim)
  document.removeEventListener('visibilitychange', onHide)
})

watch(
  () => props.items.map((item) => item.id).join(','),
  () => {
    index.value = 0
    track.value?.scrollTo({ left: 0, behavior: 'auto' })
    start()
  },
)
</script>

<style scoped lang="scss">
.home-hero {
  position: relative;
  margin: 0;
}

.hero-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: auto;
  border-radius: 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.hero-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  aspect-ratio: 16 / 7;
  min-height: 148px;
  border: 0;
  padding: 0;
  background: #141418;
  overflow: hidden;
  scroll-snap-align: start;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.hero-fallback,
.hero-mask {
  position: absolute;
  inset: 0;
}

.hero-fallback {
  background: #2a1a24;
}

.hero-mask {
  background: linear-gradient(180deg, transparent 56%, rgba(0, 0, 0, 0.55));
}

.hero-title {
  position: absolute;
  left: 14px;
  right: 56px;
  bottom: 12px;
  z-index: 1;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-dots {
  position: absolute;
  left: 50%;
  bottom: 8px;
  z-index: 2;
  display: flex;
  gap: 5px;
  transform: translateX(-50%);
}

.hero-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);

  &.on {
    width: 14px;
    border-radius: 999px;
    background: #fff;
  }
}
</style>
