<template>
  <article class="poster-card" @click="$emit('select', item)">
    <div class="poster-thumb" :class="{ wide }">
      <EncryptedImage v-if="item.cover" :src="item.cover" alt="" />
      <span v-if="item.mark" class="poster-mark" :class="item.mark">{{ item.mark }}</span>
      <div class="poster-meta">
        <span v-if="item.views" class="meta-views">
          <LineIcon name="eye" />
          {{ item.views }}
        </span>
        <span v-if="item.duration">{{ item.duration }}</span>
      </div>
    </div>
    <p class="poster-title ellipsis">{{ item.title }}</p>
    <p v-if="item.badge" class="poster-status" :class="item.statusTone || 'chapter'">{{ item.badge }}</p>
  </article>
</template>

<script setup lang="ts">
import EncryptedImage from '@/components/EncryptedImage.vue'
import LineIcon from '@/components/LineIcon.vue'
import type { CoverItem } from '@/data/mock'

withDefaults(defineProps<{
  item: CoverItem
  wide?: boolean
}>(), { wide: false })

defineEmits<{
  select: [item: CoverItem]
}>()
</script>

<style scoped lang="scss">
.poster-card {
  min-width: 0;
}

.poster-thumb {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 10px;

  &.wide {
    aspect-ratio: 16 / 9;
  }
  overflow: hidden;
  background: #1a1a20;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 42%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  }
}

.poster-mark {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  border-radius: 4px;
  padding: 3px 6px;
  text-transform: lowercase;

  &.new {
    background: #ff5c93;
  }

  &.hot {
    background: #ff3b5c;
  }
}

.poster-meta {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 6px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-size: 10px;
}

.meta-views {
  display: inline-flex;
  align-items: center;
  gap: 3px;

  :deep(.line-icon) {
    width: 11px;
    height: 11px;
  }
}

.poster-title {
  margin: 6px 0 0;
  color: #f2f2f5;
  font-size: 12.5px;
  font-weight: 600;
}

.poster-status {
  margin: 3px 0 0;
  font-size: 11px;
  line-height: 1.3;

  &.chapter {
    color: #6ea8ff;
  }

  &.end {
    color: #e8c36a;
  }
}
</style>
