<template>
  <span class="user-avatar" :style="wrapStyle">
    <span class="pic">
      <EncryptedImage v-if="src" :src="src" alt="" />
      <span v-else class="fallback">{{ fallbackText }}</span>
    </span>
    <i v-if="vip" class="vip-mark" aria-label="VIP">V</i>
    <i v-if="sex === 1 || sex === 2" class="badge" :class="sex === 1 ? 'male' : 'female'" aria-hidden="true">
      <svg v-if="sex === 1" viewBox="0 0 24 24">
        <circle cx="10.2" cy="13.8" r="5.1" fill="none" stroke="currentColor" stroke-width="2.2" />
        <path d="M13.8 10.2 20 4M15.2 4H20v4.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else viewBox="0 0 24 24">
        <circle cx="12" cy="9.2" r="5.1" fill="none" stroke="currentColor" stroke-width="2.2" />
        <path d="M12 14.3v6.2M8.8 17.8h6.4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
      </svg>
    </i>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EncryptedImage from '@/components/EncryptedImage.vue'

const props = withDefaults(
  defineProps<{
    src?: string
    sex?: number
    vip?: boolean | number | null
    size?: number
    fallback?: string
  }>(),
  { src: '', sex: 0, vip: false, size: 44, fallback: '' },
)

const wrapStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))
const fallbackText = computed(() => (props.fallback || '用').slice(0, 1))
</script>

<style scoped lang="scss">
.user-avatar {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  vertical-align: top;
  font-size: v-bind('props.size + "px"');
}

.pic {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #2a2a32;
}

.fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.38em;
}

:deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vip-mark {
  position: absolute;
  left: -2px;
  top: -2px;
  z-index: 2;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 4px;
  background: linear-gradient(180deg, #ffe7a3 0%, #f5c14a 55%, #d9a227 100%);
  color: #2a1604;
  font-size: 8px;
  font-weight: 800;
  font-style: normal;
  line-height: 14px;
  text-align: center;
  box-shadow: 0 0 0 1.4px #0b0b0d;
}

.badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  z-index: 1;
  width: 36%;
  height: 36%;
  min-width: 14px;
  min-height: 14px;
  border: 1.6px solid #0b0b0d;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;

  svg {
    width: 62%;
    height: 62%;
    display: block;
  }

  &.male {
    background: #3d8cff;
  }

  &.female {
    background: #ff3d7f;
  }
}
</style>
