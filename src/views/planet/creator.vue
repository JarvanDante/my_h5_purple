<template>
  <div class="page-shell sub-page creator-page">
    <PageHeader title="我的帖子" fallback="/me">
      <button type="button" class="post-btn" @click="goCompose">发帖</button>
    </PageHeader>

    <section class="earn">
      <div class="col">
        <p>当前余额</p>
        <strong>{{ wallet?.balance ?? userStore.user?.balance ?? 0 }}</strong>
        <button type="button" @click="goWallet">收益明细</button>
      </div>
      <div class="col">
        <p>累计收入</p>
        <strong>{{ wallet?.total_in ?? 0 }}</strong>
        <button type="button" @click="soon">立即提现</button>
      </div>
    </section>

    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="tab"
        :class="{ active: tab === item.key }"
        @click="select(item.key)"
      >
        {{ item.title }}
      </button>
    </div>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="pane">
          <p v-if="loading" class="empty">加载中…</p>
          <p v-else-if="!shown.length" class="empty">当前页面暂无内容～</p>
          <article v-for="post in shown" :key="post.id" class="post" @click="open(post)">
            <div class="cover">
              <EncryptedImage v-if="post.pics?.[0]" :src="post.pics[0]" alt="" />
            </div>
            <div class="meta">
              <h3>{{ post.title || '未命名帖子' }}</h3>
              <p class="excerpt">{{ post.content }}</p>
              <p v-if="tab === 'reject'" class="reason">
                失败原因：{{ post.reject_reason || '未填写' }}
              </p>
              <span>{{ formatTime(post.created_at) }}</span>
            </div>
          </article>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchMyPosts, type PostItem } from '@/api/ops'
import { fetchWalletBalance, type WalletBalance } from '@/api/wallet'
import { useTabSlide } from '@/composables/useTabSlide'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const tabs = [
  { key: 'pass', title: '已发布', status: 1 },
  { key: 'wait', title: '待审核', status: 0 },
  { key: 'reject', title: '审核失败', status: 2 },
] as const

const router = useRouter()
const userStore = useUserStore()
const slide = useTabSlide(tabs.map((t) => t.key), 'pass')
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const all = ref<PostItem[]>([])
const wallet = ref<WalletBalance | null>(null)
const loading = ref(false)
const shown = computed(() => {
  const status = tabs.find((t) => t.key === tab.value)?.status
  return all.value.filter((p) => (p.status ?? 1) === status)
})

const select = (item: string) => slide.select(item)
const goCompose = () => router.push({ path: '/planet/compose', query: { from: 'creator' } })
const goWallet = () => router.push('/wallet/waters')
const soon = () => showToast('提现稍后接入')
const formatTime = (raw: string) => (raw ? raw.replace(/^\d{4}-/, '').slice(0, 11) : '')

const open = (post: PostItem) => {
  router.push(`/planet/${post.id}`)
}

const load = async () => {
  loading.value = true
  try {
    await userStore.ensureLogin()
    const [posts, bal] = await Promise.all([fetchMyPosts(1, 100), fetchWalletBalance().catch(() => null)])
    all.value = posts.list || []
    wallet.value = bal
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.creator-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
}

.post-btn {
  border: 0;
  background: transparent;
  color: #ff3d7f;
  font-size: 14px;
  font-weight: 700;
  padding: 0 4px;
}

.earn {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 12px 16px 0;
  padding: 16px 12px;
  border-radius: 14px;
  background: linear-gradient(90deg, #d91259, #ff3d7f 52%, #ff8fb3);
  color: #fff;
}

.col {
  text-align: center;

  p {
    font-size: 12px;
    opacity: 0.85;
  }

  strong {
    display: block;
    margin: 6px 0 10px;
    font-size: 26px;
    font-weight: 800;
  }

  button {
    height: 26px;
    padding: 0 12px;
    border: 0;
    border-radius: 13px;
    background: #fff;
    color: #ff3d7f;
    font-size: 11px;
    font-weight: 700;
  }
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 8px;
  padding: 4px 8px 0;
  border-bottom: 1px solid #22222b;
}

.tab {
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 8px 12px;
  position: relative;

  &.active {
    color: #f5f5f8;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 22px;
      height: 3px;
      border-radius: 2px;
      background: #ff3d7f;
      transform: translateX(-50%);
    }
  }
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.pane {
  padding: 8px 0 24px;
}

.post {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #22222b;
}

.cover {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: #191920;
  flex-shrink: 0;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.meta {
  min-width: 0;
  flex: 1;

  h3 {
    font-size: 15px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.excerpt {
  margin-top: 6px;
  font-size: 12px;
  color: #8c8c9c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reason {
  margin-top: 6px;
  font-size: 12px;
  color: #ff5a5a;
  line-height: 1.4;
}

.meta span {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: #8c8c9c;
}

.empty {
  padding: 64px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}
</style>
