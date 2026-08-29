<template>
  <div class="page-shell sub-page creator-page">
    <PageHeader :title="kind === 'douyin' ? '我的抖音' : '我的帖子'" fallback="/me">
      <button type="button" class="post-btn" @click="goCompose">
        {{ kind === 'douyin' ? '发布' : '发帖' }}
      </button>
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

    <div class="kinds">
      <button
        v-for="item in kinds"
        :key="item.key"
        type="button"
        class="kind"
        :class="{ on: kind === item.key }"
        @click="selectKind(item.key)"
      >
        {{ item.title }}
      </button>
    </div>

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
        <div :key="`${kind}-${tab}`" class="pane">
          <p v-if="loading" class="empty">加载中…</p>
          <p v-else-if="kind === 'post' && !shownPosts.length" class="empty">当前页面暂无内容～</p>
          <p v-else-if="kind === 'douyin' && !shownDouyin.length" class="empty">当前页面暂无内容～</p>
          <template v-if="kind === 'post'">
            <article v-for="post in shownPosts" :key="post.id" class="post" @click="open(post)">
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
          </template>
          <template v-else>
            <article v-for="item in shownDouyin" :key="item.id" class="post" @click="openDouyin(item)">
              <div class="cover">
                <EncryptedImage v-if="item.cover_url" :src="item.cover_url" alt="" />
              </div>
              <div class="meta">
                <h3>{{ item.title || '未命名抖音' }}</h3>
                <p v-if="item.status === 2" class="excerpt">已下架</p>
                <p v-if="tab === 'reject'" class="reason">
                  失败原因：{{ item.reject_reason || '未填写' }}
                </p>
                <span>{{ formatTime(item.created_at) }}</span>
              </div>
            </article>
          </template>
        </div>
      </transition>
    </div>

    <DouyinFeed
      v-if="overlay"
      overlay
      :items="playList"
      :start="overlayIndex"
      empty="暂无抖音"
      @close="overlay = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import DouyinFeed from '@/components/douyin/DouyinFeed.vue'
import { fetchMyDouyin, type DouyinMineItem } from '@/api/douyin'
import { fetchMyPosts, type PostItem } from '@/api/ops'
import { fetchWalletBalance, type WalletBalance } from '@/api/wallet'
import { useTabSlide } from '@/composables/useTabSlide'
import { useUserStore } from '@/stores/user'
import { postPath } from '@/utils/idcrypt'
import { toastError } from '@/utils/request'

const kinds = [
  { key: 'post', title: '帖子' },
  { key: 'douyin', title: '抖音' },
] as const
type KindKey = (typeof kinds)[number]['key']

const tabs = [
  { key: 'pass', title: '已发布' },
  { key: 'wait', title: '待审核' },
  { key: 'reject', title: '审核失败' },
] as const

const router = useRouter()
const userStore = useUserStore()
const slide = useTabSlide(tabs.map((t) => t.key), 'pass')
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const kind = ref<KindKey>((sessionStorage.getItem('h5_creator_kind') as KindKey) === 'douyin' ? 'douyin' : 'post')
const all = ref<PostItem[]>([])
const mine = ref<DouyinMineItem[]>([])
const wallet = ref<WalletBalance | null>(null)
const loading = ref(false)
const shownPosts = computed(() => {
  const status = tab.value === 'pass' ? 1 : tab.value === 'wait' ? 0 : 2
  return all.value.filter((p) => (p.status ?? 1) === status)
})
const shownDouyin = computed(() => {
  return mine.value.filter((item) => {
    if (tab.value === 'wait') return item.status === 3
    if (tab.value === 'reject') return item.status === 4
    return item.status === 1 || item.status === 2
  })
})

const select = (item: string) => slide.select(item)
const selectKind = (key: KindKey) => {
  kind.value = key
  sessionStorage.setItem('h5_creator_kind', key)
}
const goCompose = () => {
  if (kind.value === 'douyin') {
    router.push('/douyin/compose')
    return
  }
  router.push({ path: '/planet/compose', query: { from: 'creator' } })
}
const goWallet = () => router.push('/wallet/waters')
const soon = () => showToast('请联系客服提现')
const formatTime = (raw: string) => (raw ? raw.replace(/^\d{4}-/, '').slice(0, 14) : '')
const overlay = ref(false)
const overlayIndex = ref(0)
const playList = computed(() => shownDouyin.value.filter((x) => x.source_url))

const open = (post: PostItem) => {
  router.push(postPath(post.id))
}

const openDouyin = (item: DouyinMineItem) => {
  if (!item.source_url) {
    showToast(item.status === 2 ? '已下架' : '暂无可播资源')
    return
  }
  overlayIndex.value = Math.max(0, playList.value.findIndex((x) => x.id === item.id))
  overlay.value = true
}

const load = async () => {
  loading.value = true
  try {
    await userStore.ensureLogin()
    const [posts, douyin, bal] = await Promise.all([
      fetchMyPosts(1, 100),
      fetchMyDouyin(1, 100).catch(() => ({ list: [] as DouyinMineItem[] })),
      fetchWalletBalance().catch(() => null),
    ])
    all.value = posts.list || []
    mine.value = douyin.list || []
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
  height: 28px;
  margin-right: 8px;
  padding: 0 12px;
  border: 0;
  border-radius: 14px;
  background: #ff3d7f;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
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

.kinds {
  display: flex;
  align-items: stretch;
  margin-top: 10px;
  border-bottom: 1px solid #2a2a34;
}

.kind {
  flex: 1;
  height: 46px;
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 17px;
  font-weight: 600;
  position: relative;

  &.on {
    color: #f5f5f8;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 28px;
      height: 3px;
      border-radius: 2px;
      background: #ff3d7f;
      transform: translateX(-50%);
    }
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
  cursor: pointer;
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
