<template>
  <div class="media-grid" :class="[cols, { wide, poster, mosaic: mosaicMode }]">
    <article
      v-for="item in items"
      :key="`${item.isAd ? 'ad' : 'm'}-${item.id}`"
      class="card"
      @click="item.isAd ? undefined : $emit('select', item)"
    >
      <AdFeedCell v-if="item.isAd" :offset="adOffset(item)" />
      <div v-else class="thumb" :class="`tone-${item.tone}`">
        <CoverMosaic v-if="item.mosaic && item.cover" :src="item.cover" />
        <EncryptedImage v-else-if="item.cover" :src="item.cover" alt="" />
        <span v-if="item.tag" class="badge" :class="item.tag === 'VIP' ? 'vip' : 'free'">{{ item.tag }}</span>
        <p v-if="!wide && !poster && !item.mosaic" class="cover-title ellipsis">{{ item.title }}</p>
        <span v-if="item.duration" class="duration">{{ item.duration }}</span>
      </div>
      <p v-if="!item.isAd && (item.mosaic || poster)" class="card-title ellipsis">{{ item.title }}</p>
      <p v-if="item.badge && !item.isAd" class="foot-badge">{{ item.badge }}</p>
      <p v-else-if="item.labels?.length" class="labels">
        <span v-for="lb in item.labels" :key="lb">{{ lb }}</span>
      </p>
      <p v-if="wide && !item.isAd" class="card-title ellipsis">{{ item.title }}</p>
      <p v-if="!item.mosaic && (item.sub || item.views)" class="foot">
        <span v-if="item.sub" class="meta ellipsis">{{ item.sub }}</span>
        <span v-if="item.views" class="chip">{{ item.views }}</span>
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AdFeedCell from '@/components/AdFeedCell.vue'
import CoverMosaic from '@/components/CoverMosaic.vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import type { CoverItem } from '@/data/mock'

const props = defineProps<{
  items: CoverItem[]
  cols?: 'cols-2' | 'cols-3'
  wide?: boolean
  poster?: boolean
}>()

const mosaicMode = computed(() => props.items.some((item) => item.mosaic))

const adOffset = (item: CoverItem) => {
  let n = 0
  for (const row of props.items) {
    if (row === item) return n
    if (row.isAd) n += 1
  }
  return 0
}

defineEmits<{
  select: [item: CoverItem]
}>()
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.media-grid {
  display: grid;
  gap: 11px;
  padding-bottom: 12px;

  &.cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &.cols-3,
  &:not([class*='cols-']) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px 4px;
    justify-items: stretch;
  }
}

.card {
  min-width: 0;
  max-width: 100%;
}

.card :deep(.feed-cell .thumb) {
  height: 132px;
}

.cols-2 .card :deep(.feed-cell .thumb) {
  height: auto;
  aspect-ratio: 3 / 4;
}

.wide.cols-2 .card :deep(.feed-cell .thumb) {
  aspect-ratio: 16 / 9;
}

.poster.cols-2 .card :deep(.feed-cell .thumb) {
  aspect-ratio: 170 / 227;
}

.cols-3 .card :deep(.feed-cell .thumb) {
  height: 150px;
}

.thumb {
  position: relative;
  width: 100%;
  border-radius: $radius-thumb;
  overflow: hidden;
  height: 132px;
  border: 0;

  img,
  :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
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

.cols-3 .card {
  width: 100%;
  max-width: 100%;
}

.cols-3 .thumb {
  width: 100%;
  max-width: 100%;
  height: 150px;
}

.cols-3 .card-title {
  margin-top: 4px;
}

.cols-3 .foot-badge {
  margin-top: 1px;
}

.wide.cols-2 .thumb {
  aspect-ratio: 16 / 9;
}

.poster.cols-2 .thumb {
  height: auto;
  aspect-ratio: 170 / 227;
}

.card-title {
  margin-top: 7px;
  font-size: 12.5px;
  color: $ink;
  font-weight: 550;
}

@include media-tones;

.ad-mark {
  position: absolute;
  right: 6px;
  bottom: 6px;
  z-index: 2;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  border-radius: 4px;
  padding: 3px 5px;
}

.badge {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 2;
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  border-radius: 5px;
  padding: 2px 7px;
  background: $primary-color;
  border: 0;

  &.vip {
    background: $primary-color;
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
  background: $background-surface2;
  color: $text-color-secondary;
  font-size: 10px;
  border-radius: 8px;
  padding: 1px 6px;
}

.foot-badge {
  margin-top: 3px;
  display: block;
  max-width: 100%;
  font-size: 10.5px;
  line-height: 1.4;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: $text-color-secondary;
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
    background: $background-surface2;
    color: $text-color-secondary;
    border: 0;
  }
}
</style>
