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

    <section class="history">
      <h3>我的反馈</h3>
      <p v-if="loading" class="empty">加载中…</p>
      <p v-else-if="!list.length" class="empty">还没有反馈记录</p>
      <article v-for="item in list" :key="item.id" class="item">
        <div class="top">
          <b>{{ typeLabel(item.problem_type) }}</b>
          <em :class="{ done: item.status === 2 }">{{ item.status === 2 ? '已处理' : '处理中' }}</em>
        </div>
        <p>{{ item.content }}</p>
        <div v-if="item.reply" class="reply">回复：{{ item.reply }}</div>
        <span>{{ item.created_at }}</span>
      </article>
    </section>

    <button type="button" class="submit" :disabled="busy || !content.trim()" @click="submit">
      {{ busy ? '提交中…' : '提交反馈' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { addFeedback, fetchMyFeedback, type FeedbackItem } from '@/api/ops'
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

const userStore = useUserStore()
const problemType = ref(1)
const content = ref('')
const busy = ref(false)
const loading = ref(false)
const list = ref<FeedbackItem[]>([])

const typeLabel = (id: number) => types.find((t) => t.id === id)?.title || '其他'

const load = async () => {
  loading.value = true
  try {
    await userStore.ensureLogin()
    const res = await fetchMyFeedback(1, 20)
    list.value = res.list || []
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

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
    content.value = ''
    showToast('已提交，处理结果会在本页和站内消息里显示')
    await load()
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

onMounted(load)
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

.history {
  margin: 18px 16px 0;
  padding-bottom: 8px;

  h3 {
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 10px;
  }
}

.empty {
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.item {
  padding: 14px;
  margin-bottom: 10px;
  border-radius: 14px;
  background: #191920;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  b {
    font-size: 13px;
    color: #ff6699;
  }

  em {
    font-style: normal;
    font-size: 11px;
    font-weight: 700;
    color: #ffc24d;

    &.done {
      color: #2ee59d;
    }
  }
}

.item p {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #f5f5f8;
  word-break: break-word;
}

.reply {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #331020;
  color: #ffb3cc;
  font-size: 13px;
  line-height: 1.45;
}

.item span {
  display: block;
  margin-top: 8px;
  font-size: 11px;
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
