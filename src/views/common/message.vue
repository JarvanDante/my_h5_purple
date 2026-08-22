<template>
  <div class="page-shell sub-page msg-page">
    <PageHeader title="站内消息" fallback="/me">
      <button v-if="unread" type="button" class="read-btn" @click="readAll">全部已读</button>
    </PageHeader>

    <p v-if="!list.length" class="empty">暂无消息</p>
    <button
      v-for="m in list"
      :key="m.id"
      type="button"
      class="row"
      :class="{ unread: !m.is_read }"
      @click="open(m)"
    >
      <i v-if="!m.is_read" class="dot" />
      <div class="meta">
        <b>{{ m.title }}</b>
        <p>{{ m.content }}</p>
        <span>{{ m.created_at }}</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { fetchMessages, fetchUnreadCount, readMessage, type MessageItem } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const list = ref<MessageItem[]>([])
const unread = ref(0)

const load = async () => {
  const [a, b] = await Promise.all([fetchMessages(), fetchUnreadCount()])
  list.value = a.list || []
  unread.value = b.count || 0
}

const open = async (m: MessageItem) => {
  if (!m.is_read) {
    await readMessage(m.id)
    m.is_read = true
    unread.value = Math.max(0, unread.value - 1)
  }
  showToast(m.content || m.title)
}

const readAll = async () => {
  await readMessage(0, true)
  await load()
}

onMounted(async () => {
  try {
    await userStore.ensureLogin()
    await load()
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.msg-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding: 8px 16px 24px;
}

.read-btn {
  border: 0;
  background: transparent;
  color: #ff3d7f;
  font-size: 13px;
  font-weight: 700;
  padding: 0 8px;
}

.empty {
  padding: 64px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  text-align: left;
  border: 0;
  background: #191920;
  border-radius: 14px;
  padding: 14px 12px;
  margin-bottom: 10px;
  color: inherit;
}

.dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #ff3d7f;
  flex-shrink: 0;
}

.meta {
  min-width: 0;
  flex: 1;

  b {
    display: block;
    font-size: 14px;
    font-weight: 700;
  }

  p {
    margin: 6px 0 4px;
    font-size: 13px;
    line-height: 1.5;
    color: #c8c8d0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  span {
    font-size: 11px;
    color: #8c8c9c;
  }
}

.unread b {
  color: #ff6699;
}
</style>
