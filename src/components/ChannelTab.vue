<template>
  <button type="button" class="channel-tab" :class="{ active, art: !!src }" @click="$emit('select')">
    <img v-if="src" class="channel-img" :src="src" :alt="label" />
    <template v-else>
      <span class="channel-text">{{ label }}</span>
      <i v-if="active" class="spark spark-a" aria-hidden="true" />
      <i v-if="active" class="spark spark-b" aria-hidden="true" />
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { channelArtSrc } from '@/assets/theme'

const props = defineProps<{
  label: string
  active?: boolean
}>()

defineEmits<{
  select: []
}>()

const src = computed(() => channelArtSrc(props.label, props.active))
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.channel-tab {
  appearance: none;
  position: relative;
  margin: 0;
  flex-shrink: 0;
  box-sizing: border-box;
  height: 48px;
  border: 0;
  background: transparent;
  color: #ffb5d0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1;
  padding: 0 6px 10px;
  display: inline-flex;
  align-items: flex-end;
  white-space: nowrap;
}

.channel-tab.art {
  height: 40px;
  padding: 0;
  align-items: center;
}

.channel-img {
  display: block;
  width: 56px;
  height: 38px;
  object-fit: contain;
}

.channel-tab.art.active .channel-img {
  width: 62px;
  height: 40px;
}

.channel-text {
  display: inline-block;
  transform: skewX(-8deg);
  transform-origin: center bottom;
}

.spark {
  position: absolute;
  background: $primary-color;
  clip-path: polygon(50% 0, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0 50%, 36% 36%);
  filter: drop-shadow(0 0 3px rgba(255, 50, 180, 0.85));
  pointer-events: none;
}

.spark-a {
  top: 8px;
  right: -1px;
  width: 8px;
  height: 8px;
}

.spark-b {
  bottom: 12px;
  left: 0;
  width: 5px;
  height: 5px;
  opacity: 0.75;
}

.channel-tab.active:not(.art) {
  color: $primary-color;
  font-size: 20px;
  font-weight: 800;

  .channel-text {
    text-shadow: 0 0 12px rgba(255, 50, 180, 0.55);
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 4px;
    width: 16px;
    height: 3px;
    border-radius: 2px;
    background: $primary-color;
    box-shadow: 0 0 8px rgba(255, 50, 180, 0.55);
    transform: translateX(-50%);
  }
}
</style>
