<template>
  <div class="page-shell sub-page logs-page">
    <PageHeader title="我的分享" fallback="/invite" />

    <section class="hero">
      <div class="hero-copy">
        <p>已邀请好友</p>
        <strong>{{ total }}<i>人</i></strong>
      </div>
      <p class="hero-tip">好友注册成功后会出现在这里</p>
    </section>

    <p v-if="loading" class="empty">加载中…</p>
    <p v-else-if="!list.length" class="empty">当前页面暂无内容～</p>
    <div v-else class="list">
      <article v-for="(item, i) in list" :key="`${item.invite_code}-${i}`" class="row">
        <i class="avatar">{{ initial(item.nickname) }}</i>
        <div class="meta">
          <b>{{ item.nickname || '未设置昵称' }}</b>
          <span>{{ formatDate(item.created_at) }}</span>
        </div>
        <em>{{ item.invite_code }}</em>
      </article>
      <p class="end">没有更多了</p>
    </div>
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
const total = ref(0)
const loading = ref(false)

const formatDate = (raw: string) => (raw ? raw.slice(0, 10) : '')
const initial = (name: string) => (name || '友').trim().slice(0, 1)

onMounted(async () => {
  loading.value = true
  try {
    await userStore.ensureLogin()
    const res = await fetchInvitees(1, 50)
    list.value = res.list || []
    total.value = res.total ?? list.value.length
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
  padding-bottom: 24px;
}

.hero {
  margin: 12px 16px 0;
  padding: 18px 16px;
  border-radius: 14px;
  background: linear-gradient(90deg, #d91259, #ff3d7f 52%, #ff8fb3);
  color: #fff;
}

.hero-copy p {
  font-size: 13px;
  opacity: 0.8;
}

.hero-copy strong {
  display: block;
  margin-top: 6px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;

  i {
    margin-left: 4px;
    font-style: normal;
    font-size: 14px;
    font-weight: 600;
  }
}

.hero-tip {
  margin-top: 10px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.88;
}

.list {
  padding: 8px 16px 8px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  margin-top: 10px;
  border-radius: 12px;
  background: #191920;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: rgba(255, 61, 127, 0.18);
  color: #ff3d7f;
  font-size: 15px;
  font-weight: 800;
  font-style: normal;
}

.meta {
  min-width: 0;
  flex: 1;

  b {
    display: block;
    font-size: 14px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #8c8c9c;
  }
}

.row em {
  flex-shrink: 0;
  max-width: 42%;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(255, 61, 127, 0.12);
  color: #ff3d7f;
  font-style: normal;
  font-size: 12px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty,
.end {
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.empty {
  padding: 80px 16px;
}

.end {
  padding: 18px 0 8px;
  font-size: 12px;
}
</style>
