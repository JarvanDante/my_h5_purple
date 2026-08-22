<template>
  <div class="poster-grid">
    <PosterCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { CoverItem } from '@/data/mock'
import PosterCard from './PosterCard.vue'

defineProps<{
  items: CoverItem[]
}>()

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
}
</style>
