<template>
  <van-swipe
    v-if="items.length"
    class="ad-swipe"
    :autoplay="items.length > 1 ? 3200 : 0"
    :duration="480"
    :loop="items.length > 1"
    lazy-render
    indicator-color="#e86a96"
  >
    <van-swipe-item v-for="item in items" :key="item.id">
      <button type="button" class="ad-slide" @click="$emit('select', item)">
        <div class="hero-cover" :class="`tone-${item.tone}`">
          <img v-if="item.cover" :src="item.cover" alt="" />
        </div>
        <span class="ad-tag">广告</span>
        <p v-if="item.title" class="ad-title">{{ item.title }}</p>
      </button>
    </van-swipe-item>
  </van-swipe>
</template>

<script setup lang="ts">
import type { CoverItem } from '@/data/mock'

defineProps<{
  items: CoverItem[]
}>()

defineEmits<{
  select: [item: CoverItem]
}>()
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.ad-swipe {
  height: 148px;
  background: #fff;
}

.ad-slide {
  position: relative;
  display: block;
  width: 100%;
  height: 148px;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: hidden;
}

.hero-cover {
  width: 100%;
  height: 100%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.ad-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  background: rgba(44, 27, 34, 0.45);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  border-radius: 6px;
  padding: 3px 6px;
}

.ad-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  margin: 0;
  padding: 22px 12px 10px;
  background: linear-gradient(transparent, rgba(44, 27, 34, 0.55));
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ad-swipe :deep(.van-swipe__indicators) {
  bottom: 8px;
}

.ad-swipe :deep(.van-swipe__indicator) {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.45);
  opacity: 1;
}

.ad-swipe :deep(.van-swipe__indicator--active) {
  width: 14px;
  border-radius: 6px;
  background: $primary-color;
}

@include media-tones;
</style>
