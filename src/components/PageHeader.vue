<template>
  <header class="page-header">
    <button type="button" class="back" aria-label="返回" @click="back">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <h1>{{ title }}</h1>
    <div class="extra">
      <slot />
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ title: string }>()
const router = useRouter()

const back = () => {
  if (window.history.state?.back) {
    router.back()
    return
  }
  router.replace('/comic')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 46px;
  background: $primary-color;
  color: $ink;
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1.6px solid $ink;
}

.back {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: $ink;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

h1 {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
}

.extra {
  min-width: 36px;
  display: flex;
  justify-content: flex-end;
}
</style>
