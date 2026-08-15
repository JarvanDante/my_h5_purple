<template>
  <div class="media-grid" :class="cols">
    <article v-for="item in items" :key="item.id" class="card" @click="$emit('select', item)">
      <div class="thumb" :class="`tone-${item.tone}`">
        <span v-if="item.tag" class="badge" :class="item.tag === 'VIP' ? 'vip' : 'free'">{{ item.tag }}</span>
        <span v-if="item.duration" class="duration">{{ item.duration }}</span>
      </div>
      <p class="ellipsis">{{ item.title }}</p>
      <span v-if="item.sub || item.views" class="meta ellipsis">{{ item.sub || item.views }}</span>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { CoverItem } from '@/data/mock'

defineProps<{
  items: CoverItem[]
  cols?: 'cols-2' | 'cols-3'
}>()

defineEmits<{
  select: [item: CoverItem]
}>()
</script>

<style scoped lang="scss">
.media-grid {
  display: grid;
  gap: 10px 8px;

  &.cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  &.cols-3,
  &:not([class*='cols-']) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.thumb {
  position: relative;
  border-radius: 8px;
  height: 132px;
}

.cols-2 .thumb {
  height: 110px;
}

.tone-0 { background: linear-gradient(160deg, #d9c7ee, #8a6bb3); }
.tone-1 { background: linear-gradient(160deg, #c7d8ee, #6b8ab3); }
.tone-2 { background: linear-gradient(160deg, #eec7d4, #b36b86); }
.tone-3 { background: linear-gradient(160deg, #c7eee0, #6bb39a); }
.tone-4 { background: linear-gradient(160deg, #eee3c7, #b39a6b); }
.tone-5 { background: linear-gradient(160deg, #c7e4ee, #6ba0b3); }

.badge,
.duration {
  position: absolute;
  color: #fff;
  font-size: 10px;
  border-radius: 3px;
  padding: 1px 5px;
}

.badge {
  top: 6px;
  left: 6px;
  background: #3b82f6;

  &.vip {
    background: #f59e0b;
  }
}

.duration {
  right: 6px;
  bottom: 6px;
  background: rgba(0, 0, 0, 0.55);
}

p {
  margin-top: 6px;
  font-size: 12px;
  color: #333;
}

.meta {
  display: block;
  margin-top: 2px;
  font-size: 10px;
  color: #999;
}
</style>
