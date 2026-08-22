<template>
  <div class="page-shell sub-page feedback-page">
    <PageHeader title="意见反馈" fallback="/me" />

    <section class="card">
      <p class="label">问题类型</p>
      <div class="chips">
        <button
          v-for="item in types"
          :key="item.id"
          type="button"
          class="chip"
          :class="{ on: problemType === item.id }"
          @click="problemType = item.id"
        >
          {{ item.title }}
        </button>
      </div>
    </section>

    <section class="card">
      <p class="label">反馈内容</p>
      <textarea
        v-model="content"
        maxlength="500"
        rows="8"
        placeholder="请描述你遇到的问题或建议，我们会尽快处理"
      />
      <span class="count">{{ content.trim().length }}/500</span>
    </section>

    <p class="hint">暂不支持上传图片，文字说明即可。</p>

    <button type="button" class="submit" :disabled="busy || !content.trim()" @click="submit">
      {{ busy ? '提交中…' : '提交反馈' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { addFeedback } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const types = [
  { id: 1, title: '功能建议' },
  { id: 2, title: '内容问题' },
  { id: 3, title: '支付问题' },
  { id: 4, title: '账号问题' },
  { id: 5, title: '播放卡顿' },
  { id: 6, title: '其他' },
]

const router = useRouter()
const userStore = useUserStore()
const problemType = ref(1)
const content = ref('')
const busy = ref(false)

const submit = async () => {
  const text = content.value.trim()
  if (!text) {
    showToast('请填写反馈内容')
    return
  }
  busy.value = true
  try {
    await userStore.ensureLogin()
    await addFeedback({
      problem_type: problemType.value,
      content: text,
      sys_info: `h5 ${navigator.userAgent}`,
    })
    showToast('已提交，感谢反馈')
    router.replace('/me')
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.feedback-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));
}

.card {
  margin: 12px 16px 0;
  padding: 14px;
  border-radius: 14px;
  background: #191920;
}

.label {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 15px;
  background: #2a2a34;
  color: #c8c8d0;
  font-size: 13px;
  font-weight: 600;

  &.on {
    background: #ff3d7f;
    color: #fff;
  }
}

textarea {
  width: 100%;
  border: 0;
  outline: none;
  resize: none;
  background: #121218;
  color: #f5f5f8;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;

  &::placeholder {
    color: #8c8c9c;
  }
}

.count {
  display: block;
  margin-top: 8px;
  text-align: right;
  font-size: 11px;
  color: #8c8c9c;
}

.hint {
  margin: 12px 20px 0;
  font-size: 12px;
  color: #8c8c9c;
}

.submit {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  height: 46px;
  border: 0;
  border-radius: 23px;
  background: #ff3d7f;
  color: #fff;
  font-size: 16px;
  font-weight: 800;

  &:disabled {
    opacity: 0.45;
  }
}

@media (min-width: $desktop-preview-min) {
  .submit {
    left: 50%;
    right: auto;
    width: calc(#{$phone-max-width} - 32px);
    transform: translateX(-50%);
  }
}
</style>
