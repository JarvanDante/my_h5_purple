<template>
  <header
    class="home-header home-header--pack"
    :class="{ 'home-header--single': !subTabs.length, 'home-header--dark': dark }"
  >
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
          <span class="channel-text">{{ item }}</span>
        </button>
      </div>
      <button v-if="!dark" type="button" class="checkin-btn" @click="$emit('checkin')">🎁 签到</button>
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
        <span>{{ searchText || `搜索更多${channel}` }}</span>
      </div>
      <button type="button" class="util-btn vip" @click="$emit('vip')">
        <img v-if="dark" class="util-ico" :src="vipIcon" alt="" />
        <LineIcon v-else name="vip" />
        <span>{{ dark ? 'VIP充值' : 'VIP' }}</span>
      </button>
      <button v-if="dark" type="button" class="util-btn checkin" @click="$emit('checkin')">
        <img class="util-ico" :src="signIcon" alt="" />
        <span>签到</span>
      </button>
      <button v-else type="button" class="qbtn" @click="$emit('favorite')">收藏</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import LineIcon from '@/components/LineIcon.vue'
import signIcon from '@/assets/icons/sign.png'
import vipIcon from '@/assets/icons/vip.png'

withDefaults(
  defineProps<{
    channels: string[]
    channel: string
    subTabs?: string[]
    subTab?: string
    dark?: boolean
    searchText?: string
  }>(),
  { subTabs: () => [], subTab: '', dark: false, searchText: '' },
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
  padding: env(safe-area-inset-top, 0px) 12px 12px;
}

.home-header--pack .channel-row {
  height: 48px;
  min-height: 48px;
}

.home-header--pack .channel-tabs {
  gap: 20px;
}

.home-header--pack .channel-item {
  padding: 0;
  line-height: 22px;
  letter-spacing: 0.02em;
}

.home-header--single {
  padding-bottom: 8px;

  .search-row {
    margin-top: 6px;
  }
}

.home-header--pack:not(.home-header--single) {
  padding-bottom: 8px;

  .sub-row {
    margin-top: 0;
    padding: 0;
    height: 32px;
    gap: 20px;
  }

  .sub-item {
    font-size: 13px;
    line-height: 32px;
    padding: 0;
    letter-spacing: 0.02em;

    &.active {
      font-weight: 700;
    }
  }

  .search-row {
    margin-top: 6px;
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
  gap: 16px;
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
  background: #0b0b0d;
  padding: calc(env(safe-area-inset-top, 0px) + 12px) 12px 12px;

  .channel-row {
    height: 54px;
    min-height: 54px;
    overflow: visible;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      pointer-events: none;
      background: rgba(255, 92, 147, 0.55);
      box-shadow: 0 0 10px rgba(255, 92, 147, 0.28);
    }
  }

  .channel-tabs {
    gap: 26px;
    padding-left: 22px;
    overflow: visible;
  }

  .channel-item {
    position: relative;
    color: #9a9aa6;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 8px 4px;
    border-radius: 0;
    background: transparent;

    &.active {
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.08em;
      background: transparent;
      text-shadow:
        0 0 8px rgba(255, 92, 147, 0.5),
        0 0 18px rgba(255, 92, 147, 0.22);

      .channel-text {
        position: relative;
        z-index: 1;
      }

      &::before {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 3.15em;
        height: 1.35em;
        transform: translate(-50%, -52%) rotate(-16deg);
        border-radius: 50%;
        background: radial-gradient(ellipse at center, rgba(255, 92, 147, 0.28) 0%, rgba(255, 92, 147, 0.08) 52%, transparent 72%);
        pointer-events: none;
      }

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 3.2em;
        height: 1.38em;
        transform: translate(-50%, -52%) rotate(-16deg);
        border-radius: 50%;
        border: 1.5px solid transparent;
        border-top-color: rgba(255, 255, 255, 0.75);
        border-right-color: rgba(255, 92, 147, 0.85);
        border-bottom-color: rgba(255, 92, 147, 0.15);
        border-left-color: rgba(255, 92, 147, 0.35);
        box-shadow: 0 0 10px rgba(255, 92, 147, 0.2);
        pointer-events: none;
      }

      .channel-text::before,
      .channel-text::after {
        content: '';
        position: absolute;
        background: #fff;
        clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
        filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
        pointer-events: none;
      }

      .channel-text::before {
        top: -7px;
        right: -8px;
        width: 5px;
        height: 5px;
      }

      .channel-text::after {
        bottom: -5px;
        left: -9px;
        width: 3px;
        height: 3px;
        opacity: 0.7;
      }
    }
  }

  .search-row {
    margin-top: 0;
    padding-top: 10px;
    border-top: 0;
  }

  .search-pill {
    height: 36px;
    background: #4a353c;
    border-color: transparent;
    color: #c4b4b8;
  }

  .search-ico {
    color: #d0c4c8;
  }

  .util-btn {
    flex-direction: row;
    min-width: 0;
    height: 36px;
    gap: 4px;
    padding: 0 10px;
    border-radius: $radius-pill;
    font-size: 11px;
    font-weight: 600;

    &.vip {
      background: #53405a;
    }

    &.checkin {
      background: #4e3a32;
    }
  }

  .util-ico {
    width: 16px;
    height: 16px;
    object-fit: contain;
    mix-blend-mode: lighten;
  }
}
</style>
