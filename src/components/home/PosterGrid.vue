<template>
  <div class="poster-grid" :class="[`cols-${cols}`, { wide }]">
    <PosterCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      :wide="wide"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { CoverItem } from '@/data/mock'
import PosterCard from './PosterCard.vue'

withDefaults(defineProps<{
  items: CoverItem[]
  cols?: 2 | 3
  wide?: boolean
}>(), { cols: 3, wide: false })

defineEmits<{
  select: [item: CoverItem]
}>()
</script>

<style scoped lang="scss">
.poster-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 8px;
  padding: 0 12px;

  &.cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
