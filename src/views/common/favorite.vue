<template>
  <div class="page-shell sub-page">
    <PageHeader title="我的收藏" />
    <div class="tabs">
      <button type="button" :class="{ active: tab === 'comic' }" @click="select('comic')">漫画</button>
      <button type="button" :class="{ active: tab === 'video' }" @click="select('video')">视频</button>
    </div>
    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="body">
          <MediaGrid
            :items="tab === 'comic' ? comics.slice(0, 6) : videos"
            :cols="tab === 'video' ? 'cols-2' : 'cols-3'"
            @select="open"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { useTabSlide } from '@/composables/useTabSlide'
import { comics, videos, type CoverItem } from '@/data/mock'

const router = useRouter()
const slide = useTabSlide(['comic', 'video'])
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const select = (item: string) => slide.select(item)

const open = (item: CoverItem) => {
  if (item.id.startsWith('v')) {
    router.push(`/video/${item.id}`)
    return
  }
  router.push(`/comic/${item.id}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;

  button {
    flex: 1;
    height: 42px;
    border: 0;
    background: transparent;
    color: #888;
    position: relative;

    &.active {
      color: $primary-color;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 28%;
        right: 28%;
        bottom: 0;
        height: 2px;
        background: $primary-color;
      }
    }
  }
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.body {
  padding: 12px;
  background: #fff;
}
</style>
