<template>
  <section v-if="items.length" class="home-hero">
    <div ref="track" class="hero-track" @scroll.passive="onScroll">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="hero-slide"
        @click="$emit('select', item)"
      >
        <EncryptedImage v-if="item.cover" :src="item.cover" alt="" />
        <span v-else class="hero-fallback" />
        <span class="hero-mask" />
        <span v-if="item.title" class="hero-title">{{ item.title }}</span>
      </button>
    </div>
    <div v-if="items.length > 1" class="hero-dots">
      <i v-for="(_, i) in items" :key="i" :class="{ on: i === index }" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import type { CoverItem } from '@/data/mock'

defineProps<{
  items: CoverItem[]
}>()

defineEmits<{
  select: [item: CoverItem]
}>()

const track = ref<HTMLElement>()
const index = ref(0)

const onScroll = () => {
  const el = track.value
  if (!el?.clientWidth) return
  index.value = Math.round(el.scrollLeft / el.clientWidth)
}
</script>

<style scoped lang="scss">
.home-hero {
  position: relative;
  margin: 0 12px 14px;
}

.hero-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  border-radius: 14px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.hero-slide {
  position: relative;
  flex: 0 0 100%;
  width: 100%;
  height: 160px;
  border: 0;
  padding: 0;
  background: #1a1a20;
  overflow: hidden;
  scroll-snap-align: start;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.hero-fallback,
.hero-mask {
  position: absolute;
  inset: 0;
}

.hero-fallback {
  background: #2a1a24;
}

.hero-mask {
  background: linear-gradient(180deg, transparent 48%, rgba(0, 0, 0, 0.72));
}

.hero-title {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 1;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-dots {
  position: absolute;
  right: 12px;
  bottom: 10px;
  z-index: 2;
  display: flex;
  gap: 4px;
}

.hero-dots i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);

  &.on {
    width: 12px;
    border-radius: 999px;
    background: #ff5c93;
  }
}
</style>
