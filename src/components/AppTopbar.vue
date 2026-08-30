<template>
  <div class="app-topbar">
    <button type="button" class="brand" aria-label="首页" @click="goHome">
      <img v-if="logoSrc" class="brand-img" :src="logoSrc" alt="" />
      <span v-else class="brand-mark">{{ mark }}</span>
    </button>
    <div class="top-center">
      <slot />
    </div>
    <button type="button" class="menu-btn" aria-label="菜单" @click="drawer.show()">
      <i /><i /><i />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { useDrawerStore } from '@/stores/drawer'
import { mediaUrl } from '@/utils/request'

const router = useRouter()
const configStore = useConfigStore()
const drawer = useDrawerStore()

const logoSrc = computed(() => {
  const raw = String(configStore.configs.app_logo || configStore.configs.logo || '')
  return raw ? mediaUrl(raw) : ''
})
const mark = computed(() => (configStore.appName || '漫').replace(/\s+/g, '').slice(0, 1))

const goHome = () => {
  router.replace('/comic')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  min-height: 48px;
}

.brand {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 0;
  padding: 0;
  border-radius: 10px;
  overflow: hidden;
  background: linear-gradient(145deg, #ff8fb3 0%, $primary-color 58%, $primary-color-deep 100%);
  box-shadow: 0 0 12px rgba(255, 92, 147, 0.35);
}

.brand-img,
.brand-mark {
  display: block;
  width: 100%;
  height: 100%;
}

.brand-img {
  object-fit: cover;
}

.brand-mark {
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  line-height: 32px;
  text-align: center;
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

.menu-btn {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border: 0;
  padding: 0;
  border-radius: 10px;
  background: $background-surface2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.menu-btn i {
  display: block;
  width: 16px;
  height: 1.8px;
  border-radius: 2px;
  background: $primary-color;
}

.menu-btn i:nth-child(2) {
  width: 12px;
}
</style>
