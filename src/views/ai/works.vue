<template>
  <div class="page-shell sub-page works-page">
    <PageHeader title="我的作品" fallback="/ai">
      <button type="button" class="pill" @click="router.push('/ai/faceswap')">去创作</button>
    </PageHeader>

    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        :class="{ on: tab.key === active }"
        @click="pick(tab)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <section v-if="list.length" class="grid">
      <button
        v-for="item in list"
        :key="item.id"
        type="button"
        class="cell"
        :disabled="!taskResultUrl(item)"
        @click="preview(item)"
      >
        <EncryptedImage v-if="coverOf(item)" :src="coverOf(item)" alt="" />
        <div v-if="isTaskRunning(item.status)" class="mask">
          <strong>AI制作中</strong>
          <span>{{ taskStatusText(item.status) }}</span>
        </div>
        <div v-else-if="item.status !== 3" class="mask fail">
          <strong>{{ taskStatusText(item.status) }}</strong>
        </div>
      </button>
    </section>
    <p v-else class="empty">还没有作品，去换一张脸试试</p>
    <p v-if="list.length" class="end">没有更多了</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showImagePreview, showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import {
  AI_BIZ_FACE_SWAP,
  fetchAiTasks,
  isTaskRunning,
  taskResultUrl,
  taskStatusText,
  type AiTask,
} from '@/api/aitask'
import { useUserStore } from '@/stores/user'
import { resolveMediaSrc } from '@/utils/aesbnc'
import { toastError } from '@/utils/request'

defineOptions({ name: 'AiWorks' })

const tabs = [
  { key: 'i2v', label: '图生视频' },
  { key: 'face', label: '图片换脸' },
  { key: 'vface', label: '视频换脸' },
  { key: 'undress', label: '去衣' },
  { key: 'draw', label: '绘画' },
  { key: 'novel', label: '小说' },
]

const router = useRouter()
const userStore = useUserStore()
const active = ref('face')
const list = ref<AiTask[]>([])
let pollTimer = 0

const coverOf = (item: AiTask) => taskResultUrl(item) || item.input_url || ''

const pick = (tab: { key: string; label: string }) => {
  if (tab.key !== 'face') {
    showToast(`${tab.label} 稍后接入`)
    return
  }
  active.value = tab.key
}

const preview = async (item: AiTask) => {
  const url = taskResultUrl(item)
  if (!url) return
  const src = await resolveMediaSrc(url)
  if (src) showImagePreview({ images: [src] })
}

const load = async () => {
  const data = await fetchAiTasks(AI_BIZ_FACE_SWAP, 1, 40)
  list.value = data.list || []
  const running = list.value.some((item) => isTaskRunning(item.status))
  if (running && !pollTimer) {
    pollTimer = window.setInterval(() => {
      load().catch(() => undefined)
    }, 3000)
  }
  if (!running && pollTimer) {
    window.clearInterval(pollTimer)
    pollTimer = 0
  }
}

onMounted(async () => {
  try {
    if (!userStore.loggedIn) await userStore.ensureLogin()
    await load()
  } catch (err) {
    toastError(err)
  }
})

onBeforeUnmount(() => {
  if (pollTimer) window.clearInterval(pollTimer)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.pill {
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: $radius-pill;
  background: $primary-color;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.tabs {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 14px 6px;

  button {
    flex-shrink: 0;
    border: 0;
    background: transparent;
    color: $text-color-secondary;
    font-size: 14px;
    padding: 4px 0;
  }

  .on {
    color: $text-color;
    font-weight: 800;
    box-shadow: inset 0 -2px 0 $primary-color;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px 12px;
}

.cell {
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 10px;
  overflow: hidden;
  background: #16161c;
  min-height: 180px;

  &:disabled {
    opacity: 1;
  }

  :deep(img) {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }
}

.mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;

  strong {
    font-size: 14px;
  }
}

.fail {
  color: #ffb3c4;
}

.empty,
.end {
  padding: 28px 16px;
  text-align: center;
  color: $text-color-secondary;
  font-size: 13px;
}

.end {
  padding-top: 8px;
}
</style>
