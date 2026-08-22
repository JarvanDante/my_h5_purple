<template>
  <div class="page-shell sub-page logs-page">
    <PageHeader title="我的分享" fallback="/invite" />

    <section class="hero">
      <p>累计分享</p>
      <strong>{{ total }}</strong>
    </section>

    <p v-if="loading" class="empty">加载中…</p>
    <p v-else-if="!list.length" class="empty">还没有分享记录</p>
    <article v-for="item in list" :key="item.id" class="row">
      <div>
        <b>{{ typeLabel(item.type) }}</b>
        <span>{{ item.created_at }}</span>
      </div>
      <em>{{ item.channel || 'h5' }}</em>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchShareInfo, fetchShareLogs, type ShareLog } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const list = ref<ShareLog[]>([])
const total = ref(0)
const loading = ref(false)

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    poster: '保存海报',
    link: '复制链接',
    invite: '邀请分享',
    app: '分享应用',
  }
  return map[type] || type || '分享'
}

onMounted(async () => {
  loading.value = true
  try {
    await userStore.ensureLogin()
    const [info, logs] = await Promise.all([fetchShareInfo(), fetchShareLogs(1, 50)])
    total.value = info.share_num || logs.total || 0
    list.value = logs.list || []
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
  padding: 0 16px 24px;
}

.hero {
  margin: 12px 0 16px;
  padding: 18px 16px;
  border-radius: 14px;
  background: linear-gradient(90deg, #d91259, #ff3d7f 52%, #ff8fb3);
  color: #fff;

  p {
    font-size: 13px;
    opacity: 0.8;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 32px;
    font-weight: 800;
  }
}

.empty {
  padding: 48px 0;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: #191920;

  b {
    display: block;
    font-size: 14px;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #8c8c9c;
  }

  em {
    font-style: normal;
    font-size: 12px;
    color: #ff6699;
  }
}
</style>
