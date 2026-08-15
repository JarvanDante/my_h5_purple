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
          <path
            d="M5 7.5C5 5.6 6.6 4 8.5 4H15c2.2 0 4 1.8 4 4v8.2c0 1.3-1.5 2-2.5 1.2L14 15.2H8.5C6.6 15.2 5 13.6 5 11.7V7.5Z"
            stroke="currentColor"
            stroke-width="1.7"
          />
          <text x="8.2" y="12.2" fill="currentColor" font-size="6.2" font-weight="700">hi</text>
        </svg>
        <svg v-else-if="item.key === 'video'" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.7" />
          <path d="M10.2 9.2 16 12l-5.8 2.8V9.2Z" fill="currentColor" />
        </svg>
        <svg v-else-if="item.key === 'planet'" viewBox="0 0 24 24" fill="none">
          <ellipse cx="12" cy="12" rx="8.2" ry="3.2" transform="rotate(-24 12 12)" stroke="currentColor" stroke-width="1.5" />
          <circle cx="12" cy="12" r="5.4" stroke="currentColor" stroke-width="1.7" />
        </svg>
        <svg v-else-if="item.key === 'ai'" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="5" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.7" />
          <text x="7.3" y="15.4" fill="currentColor" font-size="8" font-weight="700">AI</text>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="3.2" stroke="currentColor" stroke-width="1.7" />
          <path
            d="M6.2 18.4c.8-2.6 3-4 5.8-4s5 1.4 5.8 4"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
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
    router.push(path)
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-tabbar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $phone-max-width;
  height: calc(#{$tabbar-height} + env(safe-area-inset-bottom, 0px));
  padding: 4px 4px env(safe-area-inset-bottom, 0px);
  background: #fff;
  border-top: 1px solid $border-color;
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  z-index: 1000;
}

.tab-item {
  flex: 1;
  height: 46px;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #333;
  cursor: pointer;

  &.active {
    color: $secondary-color;
  }

  &:active {
    transform: scale(0.96);
  }
}

.tab-icon {
  width: 22px;
  height: 22px;
  display: flex;

  svg {
    width: 22px;
    height: 22px;
  }
}

.tab-label {
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
}

@media (max-width: 414px) {
  .app-tabbar {
    left: 0;
    transform: none;
    max-width: 100%;
  }
}
</style>
