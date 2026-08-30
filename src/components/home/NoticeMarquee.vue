<template>
  <section v-if="text" class="notice-bar">
    <span class="notice-horn" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 10v4h3l5 3V7L7 10H4z"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
        <path
          d="M16.2 8.4a5 5 0 0 1 0 7.2M18.6 6.2a8.2 8.2 0 0 1 0 11.6"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </span>
    <div class="notice-track">
      <div class="notice-run" :style="{ animationDuration: duration }">
        {{ text }}
      </div>
    </div>
    <button type="button" class="notice-close" aria-label="关闭" @click="dismiss">×</button>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchNoticeList } from '@/api/notice'

const STORAGE_KEY = 'h5_home_notice_off'

const text = ref('')
const hidden = ref(false)

const duration = computed(() => {
  const n = Math.max(text.value.length, 12)
  return `${Math.min(48, Math.max(14, n * 0.28))}s`
})

const dismiss = () => {
  hidden.value = true
  text.value = ''
  sessionStorage.setItem(STORAGE_KEY, '1')
}

onMounted(async () => {
  if (sessionStorage.getItem(STORAGE_KEY) === '1') {
    hidden.value = true
    return
  }
  try {
    const data = await fetchNoticeList()
    const parts = (data.list || [])
      .map((n) => {
        const title = (n.title || '').trim()
        const body = (n.content || '').trim()
        if (title && body) return `【${title}】${body}`
        return title || body
      })
      .filter(Boolean)
    if (!hidden.value) text.value = parts.join('　　')
  } catch {
    text.value = ''
  }
})
</script>

<style scoped lang="scss">
.notice-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  background: #111116;
  color: #f2f2f5;
}

.notice-horn {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #c59bff;
}

.notice-horn svg {
  display: block;
  width: 100%;
  height: 100%;
}

.notice-track {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.notice-run {
  display: inline-block;
  padding-left: 100%;
  white-space: nowrap;
  font-size: 12px;
  line-height: 36px;
  color: #f5f5f8;
  animation: notice-marquee linear infinite;
}

.notice-close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #8d8d96;
  font-size: 16px;
  line-height: 1;
}

@keyframes notice-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
</style>
