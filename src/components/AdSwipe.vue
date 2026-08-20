<template>
  <div
    ref="rail"
    class="ad-rail"
    @touchstart.passive="pause"
    @touchend.passive="resume"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div
      class="ad-track"
      :class="{ moving: animating }"
      :style="{ transform: `translate3d(${-offset}px, 0, 0)` }"
    >
      <button
        v-for="(item, i) in loopItems"
        :key="`${item.id}-${i}`"
        type="button"
        class="ad-card"
        :style="{ width: cardWidth ? `${cardWidth}px` : undefined }"
        @click.stop
      >
        <div class="ad-cover" :style="{ background: slotColor(i) }">
          <span class="ad-tag">广告</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { CoverItem } from '@/data/mock'

const props = withDefaults(
  defineProps<{
    items?: CoverItem[]
  }>(),
  { items: () => [] },
)

const rail = ref<HTMLElement>()
const index = ref(0)
const animating = ref(true)
const cardWidth = ref(0)
const gap = 9
const visible = 3.35
const paused = ref(false)
let timer = 0

const palette = ['#ffd0e0', '#cde4ff', '#ffe3b8', '#c8f0d4', '#e3d4ff', '#fff0a8']

const slotColor = (i: number) => palette[i % palette.length]

const sourceItems = computed(() =>
  props.items.length
    ? props.items
    : [1, 2, 3, 4].map((n) => ({ id: `ad-${n}`, title: '', tone: n })),
)

const canLoop = computed(() => sourceItems.value.length > 3)
const loopItems = computed(() => {
  if (!canLoop.value) return sourceItems.value
  return [...sourceItems.value, ...sourceItems.value.slice(0, 4)]
})
const step = computed(() => (cardWidth.value ? cardWidth.value + gap : 0))
const offset = computed(() => index.value * step.value)

const measure = () => {
  const w = rail.value?.clientWidth || 0
  if (!w) return
  cardWidth.value = (w - gap * 2) / visible
}

const snapHome = () => {
  animating.value = false
  index.value = 0
}

const tick = () => {
  if (paused.value || !canLoop.value || !step.value) return
  animating.value = true
  index.value += 1
  if (index.value >= sourceItems.value.length) {
    window.setTimeout(() => {
      snapHome()
    }, 420)
  }
}

const start = () => {
  window.clearInterval(timer)
  if (!canLoop.value) return
  timer = window.setInterval(tick, 2800)
}

const pause = () => {
  paused.value = true
}

const resume = () => {
  paused.value = false
}

const onHide = () => {
  paused.value = document.hidden
}

onMounted(() => {
  measure()
  nextTick(measure)
  start()
  window.addEventListener('resize', measure)
  document.addEventListener('visibilitychange', onHide)
})

onUnmounted(() => {
  window.clearInterval(timer)
  window.removeEventListener('resize', measure)
  document.removeEventListener('visibilitychange', onHide)
})

watch(
  () => props.items.length,
  () => {
    snapHome()
    nextTick(() => {
      measure()
      start()
    })
  },
)
</script>

<style scoped lang="scss">
.ad-rail {
  overflow: hidden;
  container-type: inline-size;
}

.ad-track {
  display: flex;
  gap: 9px;
  will-change: transform;

  &.moving {
    transition: transform 0.42s cubic-bezier(0.32, 0.72, 0, 1);
  }
}

.ad-card {
  flex: 0 0 auto;
  width: calc((100cqi - 18px) / 3.35);
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.ad-cover {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
}

.ad-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 1;
  background: rgba(26, 26, 31, 0.45);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  border-radius: 4px;
  padding: 3px 5px;
}
</style>
