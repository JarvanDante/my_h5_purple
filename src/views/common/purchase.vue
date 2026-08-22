<template>
  <div class="page-shell sub-page purchase-page">
    <PageHeader title="我的购买" />

    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="tab"
        :class="{ active: tab === item.key }"
        @click="select(item.key)"
      >
        {{ item.title }}
      </button>
    </div>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="pane">
          <p class="empty">当前页面暂无内容～</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useTabSlide } from '@/composables/useTabSlide'

const tabs = [
  { key: 'comic', title: '漫画' },
  { key: 'video', title: '视频' },
  { key: 'post', title: '帖子' },
  { key: 'ai', title: 'AI定制' },
  { key: 'novel', title: '小说' },
]
const slide = useTabSlide(tabs.map((t) => t.key))
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const select = (item: string) => slide.select(item)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.purchase-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 0;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #22222b;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 10px 12px;
  position: relative;

  &.active {
    color: #f5f5f8;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 22px;
      height: 3px;
      border-radius: 2px;
      background: #ff3d7f;
      transform: translateX(-50%);
    }
  }
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.pane {
  min-height: 50vh;
}

.empty {
  padding: 80px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}
</style>
