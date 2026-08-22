<template>
  <div class="page-shell sub-page community-page">
    <PageHeader title="官方社群" fallback="/me" />

    <section class="hero">
      <p>加入官方频道</p>
      <strong>第一时间拿到福利和公告</strong>
    </section>

    <p v-if="loading" class="empty">加载中…</p>
    <p v-else-if="!list.length" class="empty">当前页面暂无内容～</p>
    <article v-for="item in list" :key="item.id" class="card" @click="open(item)">
      <div class="icon">
        <EncryptedImage v-if="item.avatar" :src="mediaUrl(item.avatar)" alt="" />
        <span v-else>{{ (item.name || '群').slice(0, 1) }}</span>
      </div>
      <div class="meta">
        <div class="title">
          <b>{{ item.name }}</b>
          <em v-if="item.platform">{{ platformLabel(item.platform) }}</em>
        </div>
        <p>{{ item.intro || '点击加入官方社群' }}</p>
      </div>
      <button type="button">加入</button>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchOfficialGroups, type OfficialGroup } from '@/api/welfare'
import { mediaUrl, toastError } from '@/utils/request'

const list = ref<OfficialGroup[]>([])
const loading = ref(false)

const platformLabel = (v: string) =>
  ({ telegram: 'Telegram', qq: 'QQ', wechat: '微信', discord: 'Discord', other: '社群' }[v] || v)

const open = (item: OfficialGroup) => {
  if (!item.link) {
    showToast('暂未配置链接')
    return
  }
  window.open(item.link, '_blank', 'noopener')
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetchOfficialGroups()
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

.community-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: 28px;
}

.hero {
  margin: 12px 16px 8px;
  padding: 20px 16px;
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
    font-size: 20px;
    font-weight: 800;
  }
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 16px 0;
  padding: 14px 12px;
  border-radius: 12px;
  background: #191920;
}

.icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 61, 127, 0.16);
  color: #ff3d7f;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 800;
  flex-shrink: 0;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.meta {
  min-width: 0;
  flex: 1;

  .title {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  b {
    font-size: 15px;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    flex-shrink: 0;
    padding: 1px 6px;
    border-radius: 6px;
    background: rgba(255, 61, 127, 0.14);
    color: #ff3d7f;
    font-style: normal;
    font-size: 10px;
    font-weight: 700;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: #8c8c9c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.card button {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 16px;
  background: #ff3d7f;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
}

.empty {
  padding: 80px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}
</style>
