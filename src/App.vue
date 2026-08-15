<template>
  <div id="app">
    <div class="app-container">
      <router-view v-slot="{ Component }">
        <keep-alive :include="cacheViews">
          <component :is="Component" />
        </keep-alive>
      </router-view>
      <AppTabbar v-if="showTabbar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import AppTabbar from '@/components/AppTabbar.vue'

const route = useRoute()
const appStore = useAppStore()
const cacheViews = computed(() => appStore.cacheViews)
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
  overflow-y: auto;
  overflow-x: hidden;
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
</style>
