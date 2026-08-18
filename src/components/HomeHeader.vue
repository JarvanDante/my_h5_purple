<template>
  <header class="home-header">
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
        <span>🎁</span>
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
        <span>⌕</span>
        <span>搜索更多{{ channel }}</span>
      </div>
      <button type="button" class="round-action vip" @click="$emit('vip')">VIP</button>
      <button type="button" class="round-action fav" @click="$emit('favorite')">★</button>
    </div>
  </header>
</template>

<script setup lang="ts">
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

.home-header {
  background: #fff;
  padding: 8px 12px 12px;
  box-shadow: 0 1px 0 $line;
}

.channel-row,
.sub-row,
.search-row {
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
  gap: 8px;
  min-width: 0;
}

.channel-item,
.sub-item,
.checkin-btn,
.round-action {
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
  font-size: 15px;
  padding: 4px 10px;

  &.active {
    color: $primary-color-deep;
    background: $primary-soft;
    font-weight: 800;
  }
}

.checkin-btn {
  border: 0;
  background: transparent;
  color: $ink;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

.sub-row {
  margin-top: 8px;
  gap: 8px;
}

.sub-item {
  font-size: 13px;
  padding: 4px 10px;

  &.active {
    color: $primary-color-deep;
    background: $primary-soft;
    font-weight: 700;
  }
}

.search-row {
  margin-top: 10px;
  gap: 8px;
}

.search-pill {
  flex: 1;
  min-width: 0;
  height: 36px;
  border-radius: $radius-pill;
  background: $background-page;
  border: 1px solid $line;
  color: $text-color-muted;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}

.round-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 0;
  background: $primary-soft;
  color: $primary-color-deep;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &.vip {
    background: $primary-color;
    color: #fff;
  }

  &.fav {
    background: #fff4d4;
    color: #c48a12;
  }
}
</style>
