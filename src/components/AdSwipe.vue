<template>
  <div
    v-if="items.length"
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
        @click="$emit('select', item)"
      >
        <div class="ad-cover" :class="`tone-${item.tone}`">
          <img v-if="item.cover" :src="item.cover" alt="" />
          <span class="ad-tag">广告</span>
        </div>
        <p class="ad-title">{{ item.title }}</p>
        <span class="ad-label">广告</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { CoverItem } from '@/data/mock'

const props = defineProps<{
  items: CoverItem[]
}>()

defineEmits<{
  select: [item: CoverItem]
}>()

const rail = ref<HTMLElement>()
const index = ref(0)
const animating = ref(true)
const cardWidth = ref(0)
const gap = 9
const visible = 3.35
const paused = ref(false)
let timer = 0

const canLoop = computed(() => props.items.length > 3)
const loopItems = computed(() => {
  if (!canLoop.value) return props.items
  return [...props.items, ...props.items.slice(0, 4)]
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
  if (index.value >= props.items.length) {
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
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.ad-title {
  margin: 6px 0 0;
  color: $ink;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad-label {
  display: inline-block;
  margin-top: 2px;
  color: $text-color-secondary;
  font-size: 9.5px;
  background: $background-surface2;
  padding: 1px 6px;
  border-radius: 4px;
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

@include media-tones;
</style>
