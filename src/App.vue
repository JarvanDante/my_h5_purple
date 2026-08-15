<template>
  <div id="app">
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
      <AppTabbar v-if="showTabbar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import { TAB_PATHS, tabIndex, useNavStore } from '@/stores/nav'
import AppTabbar from '@/components/AppTabbar.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const navStore = useNavStore()
const cacheViews = computed(() => appStore.cacheViews)
const transitionName = computed(() => navStore.transitionName)
const showTabbar = computed(() => route.meta.tabbar === true)
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
  if (!showTabbar.value || inHScroll(e.target)) return
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
  background: $background-dark;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-container {
  width: 100%;
  max-width: $phone-max-width;
  height: 100%;
  background: $background-page;
  box-shadow: 0 0 50px rgba(58, 47, 53, 0.18);
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

@media (max-width: 414px) {
  #app {
    background: $background-page;
  }

  .app-container {
    max-width: 100%;
    box-shadow: none;
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
