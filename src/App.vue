<template>
  <div id="app">
    <div class="app-container">
      <div class="page-view">
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
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useNavStore } from '@/stores/nav'
import AppTabbar from '@/components/AppTabbar.vue'

const route = useRoute()
const appStore = useAppStore()
const navStore = useNavStore()
const cacheViews = computed(() => appStore.cacheViews)
const transitionName = computed(() => navStore.transitionName)
const showTabbar = computed(() => route.meta.tabbar === true)
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
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  position: absolute;
  inset: 0;
  transition:
    transform 0.28s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.28s ease;
}

.slide-left-enter-from {
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

.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
