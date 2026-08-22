<template>
  <div class="page-shell sub-page logs-page">
    <PageHeader title="我的分享" fallback="/invite" />

    <div class="head">
      <span>昵称</span>
      <span>邀请码</span>
      <span>日期</span>
    </div>

    <p v-if="loading" class="empty">加载中…</p>
    <p v-else-if="!list.length" class="empty">当前页面暂无内容～</p>
    <article v-for="(item, i) in list" :key="`${item.invite_code}-${i}`" class="row">
      <span class="name">{{ item.nickname }}</span>
      <span class="code">{{ item.invite_code }}</span>
      <span class="date">{{ formatDate(item.created_at) }}</span>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchInvitees, type Invitee } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const list = ref<Invitee[]>([])
const loading = ref(false)

const formatDate = (raw: string) => (raw ? raw.slice(0, 10) : '')

onMounted(async () => {
  loading.value = true
  try {
    await userStore.ensureLogin()
    const res = await fetchInvitees(1, 50)
    list.value = res.list || []
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.logs-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
}

.head,
.row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

.head {
  background: #191920;
  color: #8c8c9c;
  font-size: 13px;
  font-weight: 700;
}

.row {
  border-bottom: 1px solid #22222b;
  font-size: 13px;
}

.name,
.code,
.date {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code {
  color: #ff6699;
}

.date {
  color: #8c8c9c;
  text-align: right;
}

.empty {
  padding: 80px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}
</style>
