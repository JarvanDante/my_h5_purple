<template>
  <Teleport to="body">
    <div v-if="drawer.open" class="drawer-root" @click.self="drawer.hide()">
      <aside class="drawer-panel" @click.stop>
        <header class="drawer-head">
          <div class="head-brand">
            <span class="head-mark">{{ mark }}</span>
            <strong>{{ appName }}</strong>
          </div>
          <button type="button" class="head-close" aria-label="关闭" @click="drawer.hide()">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </header>
        <nav class="drawer-nav">
          <button v-for="item in menus" :key="item.path" type="button" @click="go(item.path)">
            <span class="nav-ico" v-html="item.icon" />
            <span class="nav-label">{{ item.label }}</span>
          </button>
        </nav>
        <footer class="drawer-foot">
          <button type="button" @click="go(loggedIn ? '/me' : '/account/login')">
            <span class="nav-ico" v-html="iconUser" />
            <span class="nav-label">{{ loggedIn ? nickname : '登录 / 注册' }}</span>
          </button>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { useDrawerStore } from '@/stores/drawer'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const drawer = useDrawerStore()
const configStore = useConfigStore()
const userStore = useUserStore()

const appName = computed(() => configStore.appName || '漫隐')
const mark = computed(() => appName.value.replace(/\s+/g, '').slice(0, 1))
const loggedIn = computed(() => userStore.loggedIn)
const nickname = computed(() => userStore.user?.nickname || '我的')

const iconGift =
  '<svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10" width="15" height="10" rx="1.2" stroke="currentColor" stroke-width="1.6"/><path d="M4.5 10h15M12 10v10M12 10c0-3 3.2-4.6 5-2.6 1 1.1-1.2 2.6-5 2.6ZM12 10c0-3-3.2-4.6-5-2.6-1 1.1 1.2 2.6 5 2.6Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
const iconShare =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M14.5 7.5 19 4.8v6.4L14.5 8.6M19 8H9.2A4.2 4.2 0 0 0 5 12.2V19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconVip =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M4.5 16.5 6 8.5l6 5 6-5 1.5 8H4.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconWallet =
  '<svg viewBox="0 0 24 24" fill="none"><rect x="3.6" y="7" width="16.8" height="12.2" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M16 12.2h4.4V16H16a1.9 1.9 0 0 1 0-3.8Z" stroke="currentColor" stroke-width="1.6"/></svg>'
const iconStar =
  '<svg viewBox="0 0 24 24" fill="none"><path d="m12 4 2.2 5.4L20 10l-4 3.6.9 5.4L12 16.2 7.1 19l.9-5.4L4 10l5.8-.6L12 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconChat =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12.1 3.6c4.4 0 7.9 3.1 7.9 7 0 3.8-3.5 7-7.9 7-.9 0-1.8-.1-2.6-.4L5.2 19.4l1.4-3.3C5.2 14.8 4.2 13 4.2 10.6c0-3.9 3.5-7 7.9-7Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconCreate =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
const iconGear =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M12 4.2v1.8M12 18v1.8M4.2 12h1.8M18 12h1.8M6.4 6.4l1.3 1.3M16.3 16.3l1.3 1.3M17.6 6.4l-1.3 1.3M7.7 16.3l-1.3 1.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
const iconUser =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.2" r="3.4" stroke="currentColor" stroke-width="1.6"/><path d="M5.4 19c.7-3.2 3.2-4.8 6.6-4.8s5.9 1.6 6.6 4.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'

const menus = [
  { label: 'VIP充值', path: '/vip', icon: iconVip },
  { label: '邀请分享', path: '/invite', icon: iconShare },
  { label: '每日签到', path: '/checkin', icon: iconGift },
  { label: '我的收藏', path: '/favorite', icon: iconStar },
  { label: '金币钱包', path: '/wallet', icon: iconWallet },
  { label: '消息中心', path: '/message', icon: iconChat },
  { label: '创作中心', path: '/creator', icon: iconCreate },
  { label: '设置', path: '/settings', icon: iconGear },
]

watch(
  () => drawer.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : ''
  },
)

const go = (path: string) => {
  drawer.hide()
  if (path) router.push(path)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.48);
}

.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(58vw, 236px);
  height: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(140% 42% at 100% 0%, rgba(255, 92, 147, 0.2), transparent 52%),
    $background-page;
  border-left: 1px solid rgba(255, 92, 147, 0.16);
  border-radius: 18px 0 0 18px;
  box-shadow: -10px 0 28px rgba(0, 0, 0, 0.42);
  animation: drawer-in 0.22s ease-out;
}

.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: calc(10px + var(--app-header-top)) 12px 12px;
  border-bottom: 1px solid rgba(255, 92, 147, 0.16);
}

.head-brand {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: $text-color;
}

.head-mark {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(145deg, #ff8fb3 0%, $primary-color 58%, $primary-color-deep 100%);
  box-shadow: 0 0 10px rgba(255, 92, 147, 0.32);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  line-height: 28px;
  text-align: center;
}

.head-brand strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.head-close {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: $background-surface2;
  color: $text-color-secondary;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }
}

.drawer-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 8px 4px;
}

.drawer-nav button {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 10px;
  padding: 0 8px;
  background: transparent;
  color: $text-color;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;

  &:active {
    background: $primary-soft;
    color: $primary-color;
  }
}

.drawer-foot button {
  width: 100%;
  height: 42px;
  border: 1px solid rgba(255, 92, 147, 0.28);
  border-radius: $radius-pill;
  padding: 0 10px;
  background: $primary-soft;
  color: $primary-color;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
}

.nav-ico {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: $background-surface2;
  color: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 16px;
    height: 16px;
  }
}

.nav-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drawer-foot {
  padding: 8px 10px calc(14px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(255, 92, 147, 0.14);
}

@keyframes drawer-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (min-width: $desktop-preview-min) {
  .drawer-root {
    left: 50%;
    width: $phone-max-width;
    transform: translateX(-50%);
  }
}
</style>
