<template>
  <i v-if="show" class="vip-badge" :class="size" aria-label="VIP">VIP</i>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    vip?: boolean | number | null
    size?: 'sm' | 'md'
  }>(),
  { vip: false, size: 'sm' },
)

const show = computed(() => Boolean(props.vip))
</script>

<style scoped lang="scss">
.vip-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #2a1604;
  background: linear-gradient(180deg, #ffe7a3 0%, #f5c14a 55%, #d9a227 100%);
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(255, 210, 110, 0.35);

  &.sm {
    height: 14px;
    padding: 0 4px;
    font-size: 9px;
  }

  &.md {
    height: 16px;
    padding: 0 5px;
    font-size: 10px;
  }
}
</style>
