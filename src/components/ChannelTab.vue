<template>
  <button type="button" class="channel-tab" :class="{ active }" @click="$emit('select')">
    <svg v-if="active" class="channel-ring channel-ring--back" viewBox="0 0 96 44" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-orbit`" gradientUnits="userSpaceOnUse" x1="48" y1="4" x2="48" y2="40">
          <stop offset="0%" stop-color="#c2185b" />
          <stop offset="60%" stop-color="#ff9fbf" />
          <stop offset="100%" stop-color="#fff5f8" />
        </linearGradient>
        <filter :id="`${uid}-glow`" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath :id="`${uid}-back`">
          <rect x="0" y="0" width="96" height="22" />
        </clipPath>
      </defs>
      <g :filter="`url(#${uid}-glow)`" :clip-path="`url(#${uid}-back)`">
        <ellipse
          cx="48"
          cy="22"
          rx="36"
          ry="11"
          transform="rotate(-18 48 22)"
          fill="none"
          :stroke="`url(#${uid}-orbit)`"
          stroke-width="1.8"
        />
      </g>
      <path class="spark" d="M78 10.5l1.15 2.55 2.55 1.15-2.55 1.15L78 17.9l-1.15-2.55-2.55-1.15 2.55-1.15z" />
      <path class="spark" d="M18 11.2l0.85 1.9 1.9 0.85-1.9 0.85L18 16.7l-0.85-1.9-1.9-0.85 1.9-0.85z" />
    </svg>
    <span class="channel-text">{{ label }}</span>
    <svg v-if="active" class="channel-ring channel-ring--front" viewBox="0 0 96 44" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-orbit-f`" gradientUnits="userSpaceOnUse" x1="48" y1="4" x2="48" y2="40">
          <stop offset="0%" stop-color="#c2185b" />
          <stop offset="60%" stop-color="#ff9fbf" />
          <stop offset="100%" stop-color="#fff5f8" />
        </linearGradient>
        <filter :id="`${uid}-glow-f`" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath :id="`${uid}-front`">
          <rect x="0" y="22" width="96" height="22" />
        </clipPath>
      </defs>
      <g :filter="`url(#${uid}-glow-f)`" :clip-path="`url(#${uid}-front)`">
        <ellipse
          cx="48"
          cy="22"
          rx="36"
          ry="11"
          transform="rotate(-18 48 22)"
          fill="none"
          :stroke="`url(#${uid}-orbit-f)`"
          stroke-width="1.8"
        />
      </g>
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  active?: boolean
}>()

defineEmits<{
  select: []
}>()

const uid = useId().replace(/\W/g, '')
</script>

<style scoped lang="scss">
.channel-tab {
  appearance: none;
  position: relative;
  margin: 0;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #d5d5dc;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.04em;
  padding: 8px 6px;
  white-space: nowrap;
}

.channel-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 86px;
  height: 40px;
  transform: translate(-50%, -50%) rotate(180deg);
  overflow: visible;
  pointer-events: none;
}

.channel-ring--back {
  z-index: 2;
}

.channel-ring--front {
  z-index: 0;
}

.spark {
  fill: #fff6ea;
  filter: drop-shadow(0 0 2px rgba(255, 240, 220, 0.9));
}

.channel-tab.active {
  color: #fff;
  font-size: 18px;
  font-weight: 700;

  .channel-text {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 64px;
    height: 34px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(255, 92, 147, 0.42) 0%, rgba(255, 92, 147, 0.14) 46%, transparent 72%);
    pointer-events: none;
    z-index: 0;
  }
}
</style>
