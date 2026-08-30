<template>
  <section v-if="items.length" class="home-hero">
    <div
      ref="track"
      class="hero-track"
      @scroll.passive="onScroll"
      @touchstart.passive="pause"
      @touchend.passive="resumeLater"
      @mouseenter="pause"
      @mouseleave="resumeLater"
    >
      <button
        v-for="item in items"
        :key="item.id"
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
      <i v-for="(_, i) in items" :key="i" :class="{ on: i === index }" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
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
let timer = 0
let resumeTimer = 0

const onScroll = () => {
  const el = track.value
  if (!el?.clientWidth) return
  index.value = Math.round(el.scrollLeft / el.clientWidth)
}

const goTo = (i: number) => {
  const el = track.value
  const n = props.items.length
  if (!el?.clientWidth || n <= 1) return
  const next = ((i % n) + n) % n
  index.value = next
  el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
}

const stop = () => {
  window.clearInterval(timer)
  timer = 0
}

const start = () => {
  stop()
  if (props.items.length <= 1) return
  timer = window.setInterval(() => goTo(index.value + 1), 3000)
}

const pause = () => {
  stop()
  window.clearTimeout(resumeTimer)
}

const resumeLater = () => {
  window.clearTimeout(resumeTimer)
  resumeTimer = window.setTimeout(start, 3000)
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
  scroll-behavior: smooth;
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
