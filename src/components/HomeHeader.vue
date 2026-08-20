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
      <div class="action-stack">
        <button type="button" class="pack-action vip" @click="$emit('vip')">
          <span class="pack-ico">👑</span>
          <span>VIP充值</span>
        </button>
        <button type="button" class="pack-action fav" @click="$emit('favorite')">
          <span class="pack-ico">★</span>
          <span>收藏</span>
        </button>
      </div>
    </div>

    <div v-if="$slots.banner" class="pack-banner">
      <slot name="banner" />
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
  margin-top: 12px;
  align-items: stretch;
  gap: 8px;
}

.search-pill {
  flex: 1;
  min-width: 0;
  min-height: 52px;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(232, 106, 150, 0.14);
  color: $text-color-muted;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.search-ico {
  font-size: 16px;
  color: $primary-color;
}

.action-stack {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
}

.pack-action {
  border: 0;
  background: transparent;
  padding: 0;
  min-width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  color: $ink;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.1;
}

.pack-ico {
  width: 22px;
  height: 22px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.pack-action.vip .pack-ico {
  background: linear-gradient(180deg, #ffe08a, #f2c14b);
  color: #8a5a00;
}

.pack-action.fav .pack-ico {
  background: linear-gradient(180deg, #ffd0e0, #e86a96);
  color: #fff;
}

.pack-banner {
  position: relative;
  margin-top: 12px;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(44, 27, 34, 0.1);
}

.pack-banner :deep(.hero-banner) {
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

.pack-banner :deep(.hero-cover) {
  height: 148px;
}
</style>
