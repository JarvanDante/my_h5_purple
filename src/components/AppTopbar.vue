<template>
  <div class="app-topbar">
    <button type="button" class="brand" aria-label="首页" @click="goHome">
      <img class="brand-img" :src="configStore.appLogo" alt="" />
    </button>
    <div class="top-center">
      <slot />
    </div>
    <strong v-if="title" class="bar-title">{{ title }}</strong>
    <button type="button" class="menu-btn" aria-label="菜单" @click="drawer.show()">
      <i /><i /><i />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { useDrawerStore } from '@/stores/drawer'

defineProps<{
  title?: string
}>()

const router = useRouter()
const configStore = useConfigStore()
const drawer = useDrawerStore()

const goHome = () => {
  router.replace('/comic')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-topbar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  min-height: 48px;
}

.brand {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: 0;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, #ff76cb 0%, #df008b 100%);
}

.brand-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.top-center {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 48px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  > :deep(*) {
    width: 100%;
  }
}

.bar-title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  max-width: calc(100% - 88px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.06em;
  pointer-events: none;
}

.menu-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 0;
  padding: 0;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 118, 203, 0.3), rgba(223, 0, 139, 0.3));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.menu-btn i {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 3px;
  background: $primary-color-deep;
}

.menu-btn i:nth-child(2) {
  width: 18px;
}
</style>
