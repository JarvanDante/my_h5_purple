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
        <svg v-if="item.key === 'comic'" viewBox="0 0 24 24" fill="none">
          <path class="body" d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" />
          <circle class="dot" cx="8.5" cy="9.5" r="1.05" />
          <circle class="dot" cx="15.5" cy="9.5" r="1.05" />
          <path class="cut-line" d="M8.5 15c1 1.2 5 1.2 7 0" />
        </svg>
        <svg v-else-if="item.key === 'video'" viewBox="0 0 24 24" fill="none">
          <rect class="body" x="3" y="5.5" width="18" height="13" rx="2.5" />
          <path class="cut" d="M10.5 9.8l4.5 2.7-4.5 2.7z" />
        </svg>
        <svg v-else-if="item.key === 'planet'" viewBox="0 0 24 24" fill="none">
          <circle class="body" cx="12" cy="12" r="4.2" />
          <ellipse class="ring" cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-22 12 12)" />
        </svg>
        <svg v-else-if="item.key === 'ai'" viewBox="0 0 24 24" fill="none">
          <path class="body" d="M12 3.5l2.2 5 5 .5-3.8 3.4 1.1 5.1L12 15l-4.5 2.5 1.1-5.1L4.8 9l5-.5z" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none">
          <circle class="body" cx="12" cy="8.2" r="3.7" />
          <path class="body" d="M5.2 20c.8-3.5 3.5-5.3 6.8-5.3s6 1.8 6.8 5.3H5.2z" />
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
  background: #101014;
  border-top: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  z-index: 1000;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 22px;
    pointer-events: none;
    background: linear-gradient(180deg, rgba(255, 92, 147, 0.1) 0%, rgba(255, 92, 147, 0.03) 55%, transparent 100%);
  }

  &::after {
    content: '';
    position: absolute;
    left: 16%;
    right: 16%;
    top: 0;
    height: 1px;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, rgba(255, 92, 147, 0.35), transparent);
  }
}

.tab-item {
  position: relative;
  z-index: 1;
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
  color: #8a8a94;
  cursor: pointer;

  &.active {
    color: $primary-color;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle, rgba(255, 92, 147, 0.5) 0%, rgba(255, 92, 147, 0.16) 46%, transparent 72%);
    }

    .tab-icon {
      color: $primary-color;
      width: 24px;
      height: 24px;
      filter: drop-shadow(0 0 8px rgba(255, 92, 147, 0.55));
    }

    .tab-label {
      font-weight: 600;
    }

    .body {
      fill: currentColor;
      stroke: currentColor;
    }

    .cut,
    .dot {
      fill: #101014;
      stroke: none;
    }

    .cut-line {
      stroke: #101014;
    }

    .ring {
      stroke: $primary-color;
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
  color: #8a8a94;

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }
}

.body,
.ring,
.cut-line {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.cut {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linejoin: round;
}

.dot {
  fill: currentColor;
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
