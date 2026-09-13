<template>
  <div id="app">
    <div v-if="showGlobalLoading" class="global-loading-overlay">
      <div class="global-loading-dots">
        <span v-for="i in 5" :key="i"></span>
      </div>
    </div>
    <div class="app-container">
      <div v-if="maintenance" class="maintain-bar">站点维护中 · {{ appName }}</div>
      <div class="page-view" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
        <router-view v-slot="{ Component, route }">
          <transition :name="transitionName">
            <keep-alive :include="cacheViews">
              <component :is="Component" :key="route.meta.tabbar ? String(route.name) : route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
      <AppDrawer />
      <AppTabbar v-if="showTabbar" />
      <AdPopup />
      <AdSplash />
      <AdFloat v-if="showFloatAd" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalLoading } from '@/composables/useGlobalLoading'
import { useAppStore } from '@/stores/app'
import { useDrawerStore } from '@/stores/drawer'
import { useConfigStore } from '@/stores/config'
import { TAB_PATHS, tabIndex, useNavStore } from '@/stores/nav'
import AdFloat from '@/components/AdFloat.vue'
import AdPopup from '@/components/AdPopup.vue'
import AdSplash from '@/components/AdSplash.vue'
import AppDrawer from '@/components/AppDrawer.vue'
import AppTabbar from '@/components/AppTabbar.vue'

const route = useRoute()
const router = useRouter()
const { showGlobalLoading } = useGlobalLoading()
const appStore = useAppStore()
const navStore = useNavStore()
const cacheViews = computed(() => appStore.cacheViews)
const transitionName = computed(() => navStore.transitionName)
const drawerStore = useDrawerStore()
const showTabbar = computed(() => route.meta.tabbar === true)
const showFloatAd = computed(() => route.name !== 'ComicRead')
const configStore = useConfigStore()
const maintenance = computed(() => configStore.maintenance)
const appName = computed(() => configStore.appName)

let startX = 0
let startY = 0

const inHScroll = (el: EventTarget | null) => {
  let node = el as HTMLElement | null
  while (node && node !== document.body) {
    const { overflowX } = getComputedStyle(node)
    if (overflowX === 'auto' || overflowX === 'scroll') return true
    node = node.parentElement
  }
  return false
}

const onTouchStart = (e: TouchEvent) => {
  startX = e.changedTouches[0].clientX
  startY = e.changedTouches[0].clientY
}

const onTouchEnd = (e: TouchEvent) => {
  if (!showTabbar.value || drawerStore.open || inHScroll(e.target)) return
  const dx = e.changedTouches[0].clientX - startX
  const dy = e.changedTouches[0].clientY - startY
  if (Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy)) return
  const i = tabIndex(route.path)
  if (i < 0) return
  if (dx < 0 && i < TAB_PATHS.length - 1) {
    router.replace(TAB_PATHS[i + 1])
    return
  }
  if (dx > 0 && i > 0) {
    router.replace(TAB_PATHS[i - 1])
  }
}
</script>

<style lang="scss">
@use '@/styles/variables.scss' as *;

#app {
  width: 100%;
  height: 100%;
  background-color: $background-page;
  background-image: $page-glow;
  background-repeat: no-repeat;
}

.global-loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-loading-dots {
  display: flex;
  gap: 8px;
}

.global-loading-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: bounce 1.2s infinite ease-in-out;
}

.global-loading-dots span:nth-child(1) {
  animation-delay: 0s;
  background: #f472b6;
}

.global-loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
  background: #c084fc;
}

.global-loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
  background: #818cf8;
}

.global-loading-dots span:nth-child(4) {
  animation-delay: 0.45s;
  background: #22d3ee;
}

.global-loading-dots span:nth-child(5) {
  animation-delay: 0.6s;
  background: #34d399;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.app-container {
  width: 100%;
  height: 100%;
  background-color: $background-page;
  background-image: $page-glow;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
}

.maintain-bar {
  position: relative;
  z-index: 20;
  background: $background-surface2;
  color: $primary-color-deep;
  text-align: center;
  font-size: 12px;
  padding: 6px 8px;
}

.page-view {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.page-view > * {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

@media (min-width: $desktop-preview-min) {
  html,
  body,
  #app {
    background: $background-dark;
  }

  #app {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .app-container {
    max-width: $phone-max-width;
    box-shadow: 0 0 50px rgba(151, 0, 95, 0.28);
  }
}

.tab-left-enter-active,
.tab-left-leave-active,
.tab-right-enter-active,
.tab-right-leave-active,
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  position: absolute;
  inset: 0;
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.tab-left-enter-from,
.slide-left-enter-from {
  transform: translateX(100%);
}

.tab-left-leave-to {
  transform: translateX(-100%);
}

.tab-right-enter-from {
  transform: translateX(-100%);
}

.tab-right-leave-to,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-24%);
  opacity: 0.55;
}

.slide-right-enter-from {
  transform: translateX(-24%);
  opacity: 0.55;
}
</style>
