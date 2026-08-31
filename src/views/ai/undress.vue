<template>
  <div class="page-shell sub-page make-page">
    <header class="bar">
      <button type="button" class="back" aria-label="返回" @click="back">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1>AI一键去衣</h1>
      <button type="button" class="pill" @click="router.push('/ai/works?tab=undress')">我的作品</button>
    </header>

    <section class="stage">
      <EncryptedImage v-if="stageSrc" :src="stageSrc" alt="照片" />
      <label v-else class="stage-empty">
        <span>点击上传照片</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onPick" />
      </label>
      <label v-if="sourceUrl || sourcePreview" class="swap-target" aria-label="更换照片">
        <span>换</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden @change="onPick" />
      </label>
    </section>

    <section class="sheet">
      <h2>请上传1张清晰照片</h2>
      <p class="sub">图片大小不能超过 {{ formatFileSize(FACE_MAX) }}，需成人正脸</p>

      <ul class="tips">
        <li class="ok">五官清晰</li>
        <li>有遮挡</li>
        <li>非正面</li>
        <li>照片模糊</li>
      </ul>
      <p class="privacy">仅用于本次生成，不会公开展示。疑似未成年人会拒绝处理。</p>

      <button type="button" class="cta" :disabled="busy || uploading" @click="submit">
        {{ ctaText }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import {
  AI_BIZ_UNDRESS,
  fetchAiTask,
  fetchAiTemplates,
  isTaskRunning,
  submitAiTask,
  taskResultUrl,
  type AiTask,
} from '@/api/aitask'
import { useUserStore } from '@/stores/user'
import { formatFileSize } from '@/utils/fileSize'
import { toastError } from '@/utils/request'
import { uploadToStorage } from '@/utils/storage-upload'

defineOptions({ name: 'AiUndress' })

const FACE_MAX = 5 * 1024 * 1024
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const templateId = ref(0)
const sourceUrl = ref('')
const sourcePreview = ref('')
const busy = ref(false)
const uploading = ref(false)
const task = ref<AiTask | null>(null)
const cost = ref(20)
let pollTimer = 0

const resultUrl = computed(() => taskResultUrl(task.value))
const stageSrc = computed(() => resultUrl.value || sourcePreview.value || sourceUrl.value)
const ctaText = computed(() => {
  if (uploading.value) return '上传中…'
  if (busy.value) return 'AI制作中…'
  return cost.value > 0 ? `${cost.value}金币/份 开始制作` : '开始制作'
})

const clientToken = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

const revokePreview = (url: string) => {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url)
}

const back = () => {
  if (window.history.state?.back) router.back()
  else router.replace('/ai')
}

const onPick = async (ev: Event) => {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > FACE_MAX) {
    showToast(`图片不能超过 ${formatFileSize(FACE_MAX)}`)
    return
  }
  const preview = URL.createObjectURL(file)
  revokePreview(sourcePreview.value)
  sourcePreview.value = preview
  sourceUrl.value = ''
  task.value = null
  uploading.value = true
  try {
    await userStore.ensureLogin()
    const out = await uploadToStorage(file, 'image')
    sourceUrl.value = out.url
  } catch (err) {
    revokePreview(sourcePreview.value)
    sourcePreview.value = ''
    sourceUrl.value = ''
    toastError(err)
  } finally {
    uploading.value = false
  }
}

const stopPoll = () => {
  if (pollTimer) window.clearInterval(pollTimer)
  pollTimer = 0
}

const startPoll = (id: number) => {
  stopPoll()
  pollTimer = window.setInterval(async () => {
    try {
      const data = await fetchAiTask(id)
      task.value = data.task
      if (!isTaskRunning(data.task.status)) {
        stopPoll()
        busy.value = false
        if (data.task.status === 3) {
          showToast('制作完成')
          return
        }
        showToast(data.task.err_msg || '制作失败，金币已退回')
      }
    } catch {
      /* 下一轮再问 */
    }
  }, 2000)
}

const submit = async () => {
  if (uploading.value) {
    showToast('图片还在上传')
    return
  }
  if (!sourceUrl.value) {
    showToast('请先上传照片')
    return
  }
  busy.value = true
  try {
    await userStore.ensureLogin()
    const res = await submitAiTask({
      biz_type: AI_BIZ_UNDRESS,
      template_id: templateId.value || undefined,
      input_url: sourceUrl.value,
      params: { media_type: 'photo' },
      client_token: clientToken(),
    })
    task.value = res.task
    if (!isTaskRunning(res.task.status) && res.task.status !== 3) {
      busy.value = false
      showToast(res.task.err_msg || '提交失败')
      return
    }
    showToast(res.task.status === 3 ? '制作完成' : '已提交，制作中')
    await router.replace('/ai/works?tab=undress')
  } catch (err) {
    busy.value = false
    toastError(err)
  }
}

onMounted(async () => {
  try {
    const data = await fetchAiTemplates(AI_BIZ_UNDRESS)
    const tpl = data.list?.[0]
    if (tpl) {
      cost.value = tpl.cost_gold
      templateId.value = tpl.id
    }
  } catch {
    /* 用默认价 */
  }
  const id = Number(route.query.id || 0)
  if (!id) return
  try {
    await userStore.ensureLogin()
    const data = await fetchAiTask(id)
    task.value = data.task
    if (data.task.input_url) sourceUrl.value = data.task.input_url
    if (data.task.template_id) templateId.value = data.task.template_id
    if (data.task.cost_gold) cost.value = data.task.cost_gold
    if (isTaskRunning(data.task.status)) {
      busy.value = true
      startPoll(data.task.id)
    }
  } catch (err) {
    toastError(err)
  }
})

onBeforeUnmount(() => {
  stopPoll()
  revokePreview(sourcePreview.value)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.make-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding-bottom: 0;
  background: #000;
}

.bar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: calc(46px + var(--app-header-top));
  padding: var(--app-header-top) 8px 0;
  display: flex;
  align-items: center;
  background: $background-page;
  color: $text-color;

  h1 {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
  }
}

.back {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: $text-color;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

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

.stage {
  position: relative;
  flex: 1;
  min-height: 280px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(img) {
    max-width: 100%;
    max-height: 52vh;
    object-fit: contain;
  }
}

.stage-empty {
  color: #8a8a94;
  font-size: 14px;
}

.swap-target {
  position: absolute;
  left: 12px;
  bottom: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet {
  background: $background-page;
  border-radius: 16px 16px 0 0;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
}

h2 {
  margin: 0;
  text-align: center;
  font-size: 16px;
}

.sub,
.privacy {
  text-align: center;
  font-size: 12px;
  color: $text-color-secondary;
}

.sub {
  margin: 6px 0 14px;
}

.tips {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin: 0 0 10px;
  padding: 0;
  list-style: none;
  font-size: 11px;
  color: $text-color-secondary;
  text-align: center;

  li::before {
    content: '×';
    display: block;
    width: 18px;
    height: 18px;
    margin: 0 auto 4px;
    border-radius: 50%;
    background: #5a2a32;
    color: #ff8fa3;
    line-height: 18px;
  }

  .ok {
    color: #9ad7b5;
  }

  .ok::before {
    content: '✓';
    background: #244034;
    color: #7dcea0;
  }
}

.privacy {
  margin-bottom: 12px;
}

.cta {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: $radius-pill;
  background: $primary-color;
  color: #fff;
  font-size: 15px;
  font-weight: 800;

  &:disabled {
    opacity: 0.55;
  }
}
</style>
