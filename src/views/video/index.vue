<template>
  <div class="page-shell">
    <header class="head">
      <h1>视频</h1>
      <button type="button" class="search" @click="go('/search')">⌕ 搜索视频</button>
    </header>
    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item"
        type="button"
        :class="{ active: tab === item }"
        @click="select(item)"
      >
        {{ item }}
      </button>
    </div>
    <div class="inner-slide">
      <transition :name="name">
        <section :key="tab" class="body">
          <MediaGrid :items="videos" cols="cols-2" @select="open" />
        </section>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MediaGrid from '@/components/MediaGrid.vue'
import { useTabSlide } from '@/composables/useTabSlide'
import { videos, type CoverItem } from '@/data/mock'

defineOptions({ name: 'Video' })

const router = useRouter()
const tabs = ['推荐', '最新', '热播', '短视频', '长视频']
const slide = useTabSlide(tabs)
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const select = (item: string) => slide.select(item)

const go = (path: string) => router.push(path)
const open = (item: CoverItem) => router.push(`/video/${item.id}`)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.head {
  background: $primary-color;
  color: #fff;
  padding: 10px 12px 12px;

  h1 {
    font-size: 20px;
  }
}

.search {
  width: 100%;
  height: 34px;
  margin-top: 10px;
  border: 0;
  border-radius: 17px;
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.75);
  text-align: left;
  padding: 0 12px;
  font-size: 13px;
}

.tabs {
  display: flex;
  gap: 16px;
  padding: 0 12px;
  background: $primary-color;
  overflow-x: auto;

  button {
    flex-shrink: 0;
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    height: 40px;
    position: relative;

    &.active {
      color: #fff;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 2px;
        right: 2px;
        bottom: 0;
        height: 2px;
        background: #fff;
      }
    }
  }
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
}

.body {
  padding: 12px;
  background: #fff;
}
</style>
