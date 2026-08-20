<template>
  <header class="home-header home-header--pack" :class="{ 'home-header--single': !subTabs.length }">
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
      <button type="button" class="checkin-btn" @click="$emit('checkin')">🎁 签到</button>
    </div>

    <div v-if="subTabs.length" class="sub-row">
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
      <button type="button" class="qbtn" @click="$emit('vip')">VIP</button>
      <button type="button" class="qbtn" @click="$emit('favorite')">收藏</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import LineIcon from '@/components/LineIcon.vue'

withDefaults(
  defineProps<{
    channels: string[]
    channel: string
    subTabs?: string[]
    subTab?: string
  }>(),
  { subTabs: () => [], subTab: '' },
)

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
  position: sticky;
  top: 0;
  z-index: 50;
  background: $background-topbar;
  padding: calc(14px + env(safe-area-inset-top, 0px)) 14px 12px;
}

.home-header--single {
  padding-top: calc(8px + env(safe-area-inset-top, 0px));
  padding-bottom: 14px;

  .channel-row {
    min-height: 32px;
    padding-bottom: 12px;
  }

  .channel-item {
    padding: 2px 0 4px;
  }

  .search-row {
    margin-top: 4px;
  }
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
  gap: 16px;
  min-width: 0;
}

.channel-item,
.sub-item,
.checkin-btn,
.qbtn {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  flex-shrink: 0;
}

.channel-item {
  border: 0;
  background: transparent;
  color: $text-color-secondary;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  padding: 0 0 3px;

  &.active {
    color: $primary-color;
    font-size: 17px;
    font-weight: 700;
  }
}

.checkin-btn {
  margin-left: auto;
  border: 0;
  background: $primary-color;
  color: #fff;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: $radius-pill;
  padding: 5px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sub-row {
  margin-top: 6px;
  padding: 6px 0 10px;
  gap: 15px;
}

.sub-item {
  border: 0;
  background: transparent;
  color: $text-color-secondary;
  font-size: 13px;
  font-weight: 400;
  white-space: nowrap;
  padding: 0;

  &.active {
    color: $primary-color;
    font-weight: 650;
  }
}

.search-row {
  margin-top: 0;
  gap: 8px;
}

.search-pill {
  flex: 1;
  min-width: 0;
  height: 34px;
  border-radius: $radius-pill;
  background: transparent;
  border: 1px solid $search-border;
  color: $search-text;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
}

.search-ico {
  width: 14px;
  height: 14px;
  color: $search-text;
  display: flex;

  :deep(.line-icon) {
    width: 100%;
    height: 100%;
  }
}

.qbtn {
  width: 36px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: $primary-color;
  color: #fff;
  font-size: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
