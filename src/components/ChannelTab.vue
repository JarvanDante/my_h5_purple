<template>
  <button type="button" class="channel-tab" :class="{ active }" @click="$emit('select')">
    <span class="channel-text">{{ label }}</span>
    <svg class="channel-ring" viewBox="0 0 96 44" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-orbit`" gradientUnits="userSpaceOnUse" x1="48" y1="22" x2="48" y2="40">
          <stop offset="0%" stop-color="#ff8fb3" />
          <stop offset="100%" stop-color="#fff5f8" />
        </linearGradient>
        <filter :id="`${uid}-glow`" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath :id="`${uid}-bottom`">
          <rect x="0" y="22" width="96" height="22" />
        </clipPath>
      </defs>
      <g :filter="`url(#${uid}-glow)`" :clip-path="`url(#${uid}-bottom)`">
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
      <path class="spark" d="M76 29.6l1.15 2.55 2.55 1.15-2.55 1.15L76 37l-1.15-2.55-2.55-1.15 2.55-1.15z" />
      <path class="spark" d="M20 28.8l0.85 1.9 1.9 0.85-1.9 0.85L20 34.3l-0.85-1.9-1.9-0.85 1.9-0.85z" />
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
  box-sizing: border-box;
  height: 44px;
  border: 0;
  background: transparent;
  color: #d5d5dc;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1;
  padding: 0 6px 10px;
  display: inline-flex;
  align-items: flex-end;
  white-space: nowrap;
}

.channel-ring {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 86px;
  height: 40px;
  transform: translateX(-50%);
  overflow: visible;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
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

  .channel-ring {
    opacity: 1;
  }

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 2px;
    width: 56px;
    height: 22px;
    transform: translateX(-50%);
    border-radius: 50%;
    background: radial-gradient(ellipse at center, rgba(255, 92, 147, 0.32) 0%, rgba(255, 92, 147, 0.1) 50%, transparent 72%);
    pointer-events: none;
    z-index: 0;
  }
}
</style>
