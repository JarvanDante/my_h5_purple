<template>
  <div class="dy-grid">
    <p v-if="loading && !items.length" class="dy-empty">加载中…</p>
    <p v-else-if="!items.length" class="dy-empty">{{ empty }}</p>
    <div v-else class="cards">
      <article v-for="item in items" :key="item.id" class="card" @click="$emit('select', item)">
        <div class="thumb">
          <EncryptedImage v-if="item.cover_url" :src="mediaUrl(item.cover_url)" alt="" />
          <div class="meta">
            <span>{{ formatDuration(item.duration) }}</span>
          </div>
        </div>
        <h3 class="title">{{ item.title }}</h3>
        <p v-if="tagsOf(item).length" class="tags">
          <span v-for="tag in tagsOf(item)" :key="tag">#{{ tag }}</span>
        </p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import EncryptedImage from '@/components/EncryptedImage.vue'
import type { DouyinItem } from '@/api/douyin'
import { formatDuration } from '@/utils/format'
import { mediaUrl } from '@/utils/request'

defineProps<{
  items: DouyinItem[]
  loading?: boolean
  empty?: string
}>()

defineEmits<{
  select: [item: DouyinItem]
}>()

const tagsOf = (item: DouyinItem) => {
  const raw = item.categories?.length ? item.categories : (item.category || '').split(/[,，]/)
  return raw.map((s) => s.trim()).filter(Boolean).slice(0, 3)
}
</script>

<style scoped lang="scss">
.dy-grid {
  padding: 4px 10px 16px;
}

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 8px;
}

.card {
  min-width: 0;
}

.thumb {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 12px;
  background: #16161c;

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
    height: 48%;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.62));
    pointer-events: none;
  }
}

.meta {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 7px;
  z-index: 1;
  display: flex;
  justify-content: flex-end;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.title {
  margin: 7px 2px 0;
  color: #f3f3f6;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tags {
  margin: 4px 2px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  color: #8a8a94;
  font-size: 11px;
}

.dy-empty {
  padding: 48px 16px;
  text-align: center;
  color: #6f6f78;
  font-size: 13px;
}
</style>
