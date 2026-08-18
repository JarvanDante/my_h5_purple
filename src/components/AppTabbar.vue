<template>
  <nav class="app-tabbar">
    <button
      v-for="item in tabs"
      :key="item.path"
      type="button"
      class="tab-item"
      :class="{ active: isActive(item.path) }"
      @click="go(item.path)"
    >
      <span class="tab-icon" aria-hidden="true">
        <svg v-if="item.key === 'comic'" viewBox="0 0 24 24">
          <path
            class="shape"
            d="M5 7.5C5 5.6 6.6 4 8.5 4H15c2.2 0 4 1.8 4 4v8.2c0 1.3-1.5 2-2.5 1.2L14 15.2H8.5C6.6 15.2 5 13.6 5 11.7V7.5Z"
          />
          <text class="mark" x="8.1" y="12.3" font-size="6.4" font-weight="800">hi</text>
        </svg>
        <svg v-else-if="item.key === 'video'" viewBox="0 0 24 24">
          <rect class="shape" x="4.2" y="4.2" width="15.6" height="15.6" rx="4" />
          <path class="mark-fill" d="M10.2 8.6 16.2 12l-6 3.4V8.6Z" />
        </svg>
        <svg v-else-if="item.key === 'planet'" viewBox="0 0 24 24">
          <circle class="shape" cx="12" cy="12" r="5.6" />
          <ellipse class="ring" cx="12" cy="12" rx="9" ry="3.2" transform="rotate(-28 12 12)" />
        </svg>
        <svg v-else-if="item.key === 'ai'" viewBox="0 0 24 24">
          <rect class="shape" x="4.4" y="4.4" width="15.2" height="15.2" rx="4" />
          <text class="mark" x="6.6" y="15.6" font-size="8.2" font-weight="800">AI</text>
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <circle class="shape" cx="12" cy="8.6" r="3.4" />
          <path class="shape" d="M5.6 19.8c.8-3.2 3.2-5.1 6.4-5.1s5.6 1.9 6.4 5.1H5.6Z" />
        </svg>
      </span>
      <span class="tab-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'comic', path: '/comic', label: '二次元' },
  { key: 'video', path: '/video', label: '视频' },
  { key: 'planet', path: '/planet', label: '星球' },
  { key: 'ai', path: '/ai', label: 'AI' },
  { key: 'me', path: '/me', label: '我的' },
] as const

const isActive = (path: string) => route.path === path || (path === '/comic' && route.path === '/')

const go = (path: string) => {
  if (route.path !== path) {
    router.replace(path)
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(#{$tabbar-height} + env(safe-area-inset-bottom, 0px));
  padding: 2px 4px env(safe-area-inset-bottom, 0px);
  background: #fff;
  border-top: 1px solid $line;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  z-index: 1000;
}

.tab-item {
  flex: 1;
  height: 50px;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 1px;
  padding-bottom: 4px;
  color: $ink;
  cursor: pointer;

  &.active {
    .tab-icon {
      width: 30px;
      height: 30px;
      transform: translateY(-2px);
    }

    .tab-label {
      font-weight: 800;
    }

    .shape {
      fill: $accent-yellow;
    }
  }

  &:active {
    transform: scale(0.92);
  }
}

.tab-icon {
  width: 22px;
  height: 22px;
  display: flex;
  color: $ink;
  transition: width 0.16s ease, height 0.16s ease, transform 0.16s ease;

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}

.shape,
.ring {
  fill: none;
  stroke: $ink;
  stroke-width: 1.7;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.mark {
  fill: $ink;
  stroke: none;
}

.mark-fill {
  fill: $ink;
  stroke: none;
}

.tab-label {
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
}

@media (min-width: $desktop-preview-min) {
  .app-tabbar {
    left: 50%;
    transform: translateX(-50%);
    max-width: $phone-max-width;
  }
}
</style>
