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
        <span class="pack-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="2.2" y="5.2" width="19.6" height="15.2" rx="3.2" />
            <rect x="4.2" y="3.2" width="15.6" height="4.2" rx="1.6" />
          </svg>
          <em>会员</em>
        </span>
        <span>VIP充值</span>
      </button>
      <button type="button" class="pack-action fav" @click="$emit('favorite')">
        <span class="pack-ico" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="3.4" />
            <path d="M15.2 3H21v8.2l-2.9-2.1-2.9 2.1V3Z" />
          </svg>
        </span>
        <span>收藏</span>
      </button>
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

.pack-ico {
  position: relative;
  width: 22px;
  height: 22px;
  display: block;
}

.pack-ico svg {
  display: block;
  width: 100%;
  height: 100%;
}

.pack-action.vip .pack-ico svg {
  fill: #f58220;
}

.pack-action.vip .pack-ico svg rect:last-child {
  fill: #ff9a3c;
}

.pack-action.vip .pack-ico em {
  position: absolute;
  inset: 7px 0 0;
  font-style: normal;
  font-size: 7px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.04em;
  line-height: 1;
}

.pack-action.fav .pack-ico svg {
  fill: #f58220;
}

.pack-action.fav .pack-ico path {
  fill: #fff;
}

.pack-banner {
  position: relative;
  margin-top: 6px;
}
</style>
