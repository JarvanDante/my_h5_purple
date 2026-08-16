<template>
  <div class="page-shell sub-page">
    <PageHeader title="站内消息" />
    <section class="box">
      <div class="head">
        <span>未读 {{ unread }}</span>
        <button v-if="unread" type="button" @click="readAll">全部已读</button>
      </div>
      <p v-if="!list.length" class="empty">暂无消息，子后台「用户管理 → 站内消息」可发送</p>
      <button v-for="m in list" :key="m.id" type="button" class="row" :class="{ unread: !m.is_read }" @click="open(m)">
        <div>
          <b>{{ m.title }}</b>
          <p>{{ m.content }}</p>
          <span>{{ m.created_at }}</span>
        </div>
      </button>
    </section>
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

.box {
  background: #fff;
  padding: 12px 16px;
}

.head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;

  button {
    border: 0;
    background: none;
    color: $primary-color;
  }
}

.empty {
  color: #999;
  font-size: 13px;
}

.row {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: #fafafa;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;

  &.unread b {
    color: $primary-color;
  }

  p {
    margin: 4px 0;
    color: #666;
    font-size: 13px;
  }

  span {
    font-size: 11px;
    color: #999;
  }
}
</style>
