<template>
  <header class="home-header home-header--pack">
    <div class="channel-row">
      <div class="channel-tabs">
        <button
          v-for="item in channels"
          :key="item"
          type="button"
          class="channel-item"
          :class="{ active: channel === item }"
          @click="$emit('selectChannel', item)"
        >
          {{ item }}
        </button>
      </div>
      <button type="button" class="checkin-btn" @click="$emit('checkin')">
        <LineIcon name="gift" />
        签到
      </button>
    </div>

    <div class="sub-row">
      <button
        v-for="item in subTabs"
        :key="item"
        type="button"
        class="sub-item"
        :class="{ active: subTab === item }"
        @click="$emit('selectSub', item)"
      >
        {{ item }}
      </button>
    </div>

    <div class="search-row">
      <div class="search-pill" @click="$emit('search')">
        <span class="search-ico"><LineIcon name="search" /></span>
        <span>搜索更多{{ channel }}</span>
      </div>
      <button type="button" class="pack-action vip" @click="$emit('vip')">
        <span class="cta-ico">会员</span>
        <span>VIP充值</span>
      </button>
      <button type="button" class="pack-action fav" @click="$emit('favorite')">
        <span class="pack-img"><LineIcon name="fav" /></span>
        <span>收藏</span>
      </button>
    </div>

    <div v-if="$slots.banner" class="pack-banner">
      <slot name="banner" />
    </div>
  </header>
</template>

<script setup lang="ts">
import LineIcon from '@/components/LineIcon.vue'

defineProps<{
  channels: string[]
  channel: string
  subTabs: string[]
  subTab: string
}>()

defineEmits<{
  selectChannel: [item: string]
  selectSub: [item: string]
  checkin: []
  search: []
  vip: []
  favorite: []
}>()
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.home-header--pack {
  position: relative;
  background: #fff;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 12px;
  border-radius: 0 0 16px 16px;
  box-shadow: $shadow-card;
}

.channel-row,
.sub-row,
.search-row {
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.channel-tabs,
.sub-row {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.channel-tabs {
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.channel-item,
.sub-item,
.checkin-btn,
.pack-action {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  flex-shrink: 0;
}

.channel-item,
.sub-item {
  border: 0;
  background: transparent;
  color: $text-color-secondary;
  font-weight: 600;
  white-space: nowrap;
  border-radius: $radius-pill;
}

.channel-item {
  font-size: 16px;
  padding: 5px 12px;

  &.active {
    color: $primary-color;
    background: $primary-soft;
    font-weight: 800;
  }
}

.checkin-btn {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: $text-color-secondary;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  padding: 4px 2px;

  :deep(.line-icon) {
    width: 16px;
    height: 16px;
  }
}

.sub-row {
  margin-top: 8px;
  gap: 6px;
}

.sub-item {
  font-size: 13px;
  padding: 4px 10px;

  &.active {
    color: $primary-color;
    background: $primary-soft;
    font-weight: 700;
  }
}

.search-row {
  margin-top: 8px;
  align-items: center;
  gap: 8px;
}

.search-pill {
  flex: 1;
  min-width: 0;
  height: 34px;
  border-radius: $radius-pill;
  background: $background-surface2;
  border: 1px solid $line;
  color: $text-color-secondary;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}

.search-ico {
  width: 16px;
  height: 16px;
  color: $text-color-secondary;
  display: flex;

  :deep(.line-icon) {
    width: 100%;
    height: 100%;
  }
}

.pack-action {
  border: 0;
  background: transparent;
  padding: 0;
  min-width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: $text-color-secondary;
  font-size: 9px;
  font-weight: 600;
  line-height: 1.1;
}

.pack-img {
  width: 22px;
  height: 22px;
  color: $text-color;
  display: flex;

  :deep(.line-icon) {
    width: 100%;
    height: 100%;
  }
}

.cta-ico {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: $primary-color;
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.04em;
}

.pack-action.vip {
  color: $primary-color;
}

.pack-banner {
  position: relative;
  margin-top: 8px;
}
</style>
