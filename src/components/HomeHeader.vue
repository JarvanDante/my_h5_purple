<template>
  <header
    class="home-header home-header--pack"
    :class="{ 'home-header--single': !subTabs.length, 'home-header--dark': dark }"
  >
    <AppTopbar>
      <div class="channel-tabs">
        <button
          v-for="item in channels"
          :key="item"
          type="button"
          class="channel-item"
          :class="{ active: channel === item }"
          @click="$emit('selectChannel', item)"
        >
          <span class="channel-text">{{ item }}</span>
        </button>
      </div>
    </AppTopbar>

    <div class="header-dock">
      <div v-if="!hideSearch" class="search-row">
        <div class="search-pill" @click="$emit('search')">
          <span class="search-ico"><LineIcon name="search" /></span>
          <span>{{ searchText || `搜索更多${channel}` }}</span>
        </div>
        <button type="button" class="util-btn vip" @click="$emit('vip')">
          <img v-if="dark" class="util-art" :src="vipArt" alt="VIP充值" />
          <template v-else>
            <LineIcon name="vip" />
            <span>VIP</span>
          </template>
        </button>
        <button v-if="dark" type="button" class="util-btn checkin" @click="$emit('checkin')">
          <img class="util-art" :src="checkinArt" alt="签到" />
        </button>
        <button v-else type="button" class="qbtn" @click="$emit('favorite')">收藏</button>
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
    </div>
  </header>
</template>

<script setup lang="ts">
import AppTopbar from '@/components/AppTopbar.vue'
import LineIcon from '@/components/LineIcon.vue'
import { checkinArt, vipArt } from '@/assets/theme'

withDefaults(
  defineProps<{
    channels: string[]
    channel: string
    subTabs?: string[]
    subTab?: string
    dark?: boolean
    searchText?: string
    hideSearch?: boolean
  }>(),
  { subTabs: () => [], subTab: '', dark: false, searchText: '', hideSearch: false },
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
  background-color: $background-page;
  background-image: $page-glow;
  background-repeat: no-repeat;
  padding: var(--app-header-top) 12px 8px;
}

.home-header--pack .channel-tabs {
  gap: 26px;
}

.home-header--pack .channel-item {
  padding: 0;
  line-height: 22px;
  letter-spacing: 0.02em;
}

.home-header--single {
  padding-bottom: 8px;

  .search-row {
    margin-top: 8px;
  }
}

.home-header--pack:not(.home-header--single) {
  padding-bottom: 4px;

  .search-row {
    margin-top: 8px;
  }

  &.home-header--dark .search-row {
    margin-top: 10px;
  }

  .sub-row {
    margin-top: 4px;
    padding: 0;
    height: 40px;
    gap: 22px;
  }

  .sub-item {
    font-size: 15px;
    line-height: 40px;
    padding: 0;
    letter-spacing: 0.02em;

    &.active {
      font-weight: 700;
    }
  }
}

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
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.channel-tabs {
  flex: 1;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 26px;
  min-width: 0;
}

.channel-item,
.sub-item,
.checkin-btn,
.qbtn,
.util-btn {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  flex-shrink: 0;
}

.channel-item {
  border: 0;
  background: transparent;
  color: $text-color-secondary;
  font-size: 17px;
  font-weight: 500;
  white-space: nowrap;
  padding: 0 0 3px;

  &.active {
    color: $primary-color;
    font-size: 19px;
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
  font-size: 15px;
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

.util-btn {
  height: 34px;
  border: 0;
  border-radius: 9px;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  color: #fff;
  font-size: 8px;
  font-weight: 600;
  line-height: 1;

  :deep(.line-icon) {
    width: 13px;
    height: 13px;
  }

  &.vip {
    background: $primary-color;
  }

  &.checkin {
    background: #ff8a3d;
  }
}

.home-header--dark {
  background-color: $background-page;
  background-image: $page-glow;
  background-repeat: no-repeat;
  padding: var(--app-header-top) 16px 6px;

  :deep(.app-topbar) {
    position: relative;
    overflow: visible;
    height: 40px;
    min-height: 40px;
    gap: 10px;
  }

  :deep(.top-center) {
    align-items: center;
    height: 40px;

    > * {
      width: auto;
      max-width: 100%;
    }
  }

  .channel-tabs {
    align-items: center;
    justify-content: center;
    height: 40px;
    gap: 22px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .channel-item {
    color: rgba(255, 255, 255, 0.55);
    font-size: 16px;
    font-weight: 500;
    padding: 0;
    line-height: 22px;

    &.active {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
    }
  }

  .search-row {
    margin-top: 10px;
    padding-top: 0;
    border-top: 0;
    align-items: flex-end;
    gap: 6px;
  }

  .search-pill {
    height: 32px;
    border-radius: 18px;
    background: $search-bg;
    border: 1px solid $search-border;
    color: $search-text;
    font-size: 14px;
  }

  .search-ico {
    width: 15px;
    height: 15px;
    color: #fff;
    opacity: 0.85;
  }

  .util-btn {
    flex-direction: column;
    width: 42px;
    min-width: 42px;
    height: auto;
    gap: 0;
    padding: 0;
    border-radius: 0;
    font-size: 8px;
    font-weight: 600;
    background: transparent;

    &.vip,
    &.checkin {
      background: transparent;
    }

    &.checkin {
      width: 36px;
      min-width: 36px;
    }
  }

  .util-art {
    display: block;
    width: 42px;
    height: 40px;
    object-fit: contain;
    object-position: center bottom;
  }

  .checkin .util-art {
    width: 36px;
  }

  .sub-row {
    margin-top: 6px;
    height: 40px;
    padding: 0;
    gap: 16px;
  }

  .sub-item {
    position: relative;
    color: #fff;
    font-size: 14px;
    font-weight: 400;
    line-height: 40px;
    padding: 0 4px;

    &.active {
      color: $primary-color;
      font-weight: 700;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 5px;
        width: 28px;
        height: 4px;
        border-radius: 2px;
        background: $primary-color;
        transform: translateX(-50%);
      }
    }
  }
}
</style>
