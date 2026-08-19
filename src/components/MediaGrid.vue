<template>
  <div class="media-grid" :class="[cols, { wide, mosaic: mosaicMode }]">
    <article v-for="item in items" :key="item.id" class="card" @click="$emit('select', item)">
      <div class="thumb" :class="`tone-${item.tone}`">
        <CoverMosaic v-if="item.mosaic" :src="item.cover" />
        <img v-else-if="item.cover" :src="item.cover" alt="" />
        <span v-if="item.tag" class="badge" :class="item.tag === 'VIP' ? 'vip' : 'free'">{{ item.tag }}</span>
        <p v-if="!wide && !item.mosaic" class="cover-title ellipsis">{{ item.title }}</p>
        <span v-if="item.duration" class="duration">{{ item.duration }}</span>
      </div>
      <p v-if="item.mosaic" class="card-title ellipsis">{{ item.title }}</p>
      <p v-if="item.badge" class="foot-badge">{{ item.badge }}</p>
      <p v-else-if="item.labels?.length" class="labels">
        <span v-for="lb in item.labels" :key="lb">{{ lb }}</span>
      </p>
      <p v-if="wide" class="card-title ellipsis">{{ item.title }}</p>
      <p v-if="!item.mosaic && (item.sub || item.views)" class="foot">
        <span v-if="item.sub" class="meta ellipsis">{{ item.sub }}</span>
        <span v-if="item.views" class="chip">{{ item.views }}</span>
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CoverMosaic from '@/components/CoverMosaic.vue'
import type { CoverItem } from '@/data/mock'

const props = defineProps<{
  items: CoverItem[]
  cols?: 'cols-2' | 'cols-3'
  wide?: boolean
}>()

const mosaicMode = computed(() => props.items.some((item) => item.mosaic))

defineEmits<{
  select: [item: CoverItem]
}>()
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.media-grid {
  display: grid;
  gap: 12px 8px;

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
  border-radius: $radius-thumb;
  overflow: hidden;
  height: 132px;
  border: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :deep(.cover-mosaic) {
    position: absolute;
    inset: 0;
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 46%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.58));
  }
}

.cols-2 .thumb {
  height: auto;
  aspect-ratio: 3 / 4;
}

.wide.cols-2 .thumb {
  aspect-ratio: 16 / 9;
}

.card-title {
  margin-top: 6px;
  font-size: 13px;
  color: $ink;
  font-weight: 600;
}

@include media-tones;

.badge {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  color: #fff;
  font-size: 10px;
  border-radius: 6px;
  padding: 1px 6px;
  background: $primary-color;
  border: 0;

  &.vip {
    background: $primary-color-deep;
  }
}

.cover-title {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 22px;
  z-index: 1;
  margin: 0;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  z-index: 1;
  color: #fff;
  font-size: 10px;
}

.wide .duration {
  left: 6px;
  right: auto;
}

.foot {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  min-width: 0;
}

.meta {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: $text-color-secondary;
}

.chip {
  flex-shrink: 0;
  background: $primary-color;
  color: #fff;
  font-size: 10px;
  border-radius: 8px;
  padding: 1px 6px;
}

.foot-badge {
  margin-top: 4px;
  display: inline-block;
  max-width: 100%;
  font-size: 10px;
  line-height: 1.4;
  padding: 2px 6px;
  border-radius: 8px;
  background: #fde8d8;
  color: #c56a2d;
}

.mosaic .thumb::after {
  display: none;
}

.labels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;

  span {
    font-size: 10px;
    line-height: 1.4;
    padding: 1px 6px;
    border-radius: 8px;
    background: $primary-soft;
    color: $ink;
    border: 1px solid rgba($ink, 0.12);
  }
}
</style>
