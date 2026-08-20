<template>
  <header class="home-header home-header--pack">
    <div class="pack-glow" aria-hidden="true" />

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
        <span class="search-ico">⌕</span>
        <span>搜索更多{{ channel }}</span>
      </div>
      <button type="button" class="pack-action vip" @click="$emit('vip')">
        <img class="pack-img" :src="iconVip" alt="" />
        <span>VIP充值</span>
      </button>
      <button type="button" class="pack-action fav" @click="$emit('favorite')">
        <img class="pack-img" :src="iconFav" alt="" />
        <span>收藏</span>
      </button>
    </div>

    <div v-if="$slots.banner" class="pack-banner">
      <slot name="banner" />
    </div>
  </header>
</template>

<script setup lang="ts">
import iconFav from '@/assets/icons/sc.png'
import iconVip from '@/assets/icons/vip.png'

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
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #fff7fa 58%, #ffe8f0 100%);
  padding: calc(10px + env(safe-area-inset-top, 0px)) 14px 16px;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 16px 32px rgba(232, 106, 150, 0.12);
}

.pack-glow {
  position: absolute;
  top: -48px;
  right: -36px;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 106, 150, 0.2), transparent 68%);
  pointer-events: none;
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
    color: $primary-color-deep;
    background: $primary-soft;
    font-weight: 800;
  }
}

.checkin-btn {
  margin-left: 8px;
  border: 0;
  background: linear-gradient(180deg, #fff 0%, $primary-soft 100%);
  color: $primary-color-deep;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
  border-radius: $radius-pill;
  padding: 5px 10px;
  box-shadow: inset 0 0 0 1px rgba(232, 106, 150, 0.16);
}

.sub-row {
  margin-top: 8px;
  gap: 6px;
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
  margin-top: 8px;
  align-items: center;
  gap: 6px;
}

.search-pill {
  flex: 1;
  min-width: 0;
  height: 34px;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(232, 106, 150, 0.14);
  color: $text-color-muted;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}

.search-ico {
  font-size: 15px;
  color: $primary-color;
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
  color: $ink;
  font-size: 9px;
  font-weight: 700;
  line-height: 1.1;
}

.pack-img {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(212, 77, 126, 0.18));
}

.pack-banner {
  position: relative;
  margin-top: 6px;
}
</style>
