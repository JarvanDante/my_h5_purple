<template>
  <section v-if="text" class="notice-bar">
    <img class="notice-horn" :src="noticeArt" alt="公告" />
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
import { noticeArt } from '@/assets/theme'
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
  gap: 6px;
  height: 36px;
  margin: 6px 16px 4px;
  padding: 0 10px 0 4px;
  border-radius: 12px;
  background: rgba(217, 217, 217, 0.15);
  color: #fff;
}

.notice-horn {
  flex-shrink: 0;
  width: 42px;
  height: 35px;
  object-fit: contain;
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
  color: rgba(255, 255, 255, 0.7);
  animation: notice-marquee linear infinite;
}

.notice-close {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #8d8d96;
  font-size: 20px;
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
