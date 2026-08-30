<template>
  <button type="button" class="channel-tab" :class="{ active }" @click="$emit('select')">
    <span class="channel-text">{{ label }}</span>
    <i v-if="active" class="spark spark-a" aria-hidden="true" />
    <i v-if="active" class="spark spark-b" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  active?: boolean
}>()

defineEmits<{
  select: []
}>()
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
  color: #8a8a94;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1;
  padding: 0 6px 10px;
  display: inline-flex;
  align-items: flex-end;
  white-space: nowrap;
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
  filter: drop-shadow(0 0 3px rgba(255, 92, 147, 0.85));
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

.channel-tab.active {
  color: $primary-color;
  font-size: 20px;
  font-weight: 800;

  .channel-text {
    text-shadow: 0 0 12px rgba(255, 92, 147, 0.45);
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
    box-shadow: 0 0 8px rgba(255, 92, 147, 0.55);
    transform: translateX(-50%);
  }
}
</style>
