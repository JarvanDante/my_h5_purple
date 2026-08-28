<template>
  <div class="poster-rail">
    <PosterCard
      v-for="item in items"
      :key="item.id"
      class="rail-item"
      :class="{ wide }"
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
  wide?: boolean
}>(), { wide: false })

defineEmits<{
  select: [item: CoverItem]
}>()
</script>

<style scoped lang="scss">
.poster-rail {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 0 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.rail-item {
  flex: 0 0 118px;
  width: 118px;

  &.wide {
    flex-basis: 210px;
    width: 210px;
  }
}
</style>
