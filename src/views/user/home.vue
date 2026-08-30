<template>
  <div class="page-shell user-home">
    <PageHeader :title="name || '用户主页'" fallback="/planet" />

    <section v-if="user" class="head">
      <UserAvatar :src="avatarSrc" :sex="user.sex" :size="52" :fallback="name" />
      <div class="meta">
        <div class="name-row">
          <strong>{{ name }}</strong>
          <VipBadge :vip="user.is_vip" size="md" />
        </div>
        <p>粉丝 {{ user.fans ?? 0 }}　关注 {{ user.follow ?? 0 }}</p>
      </div>
      <button
        v-if="!mine"
        type="button"
        class="follow"
        :class="{ on: followed }"
        @click="onFollow"
      >
        {{ followed ? '已关注' : '+关注' }}
      </button>
    </section>

    <nav class="tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="tab"
        :class="{ on: tab === item.key }"
        @click="tab = item.key"
      >
        {{ item.label }}
      </button>
    </nav>

    <div v-show="tab === 'douyin'" class="pane">
      <DouyinGrid
        :items="douyinList"
        :loading="loadingDouyin"
        empty="暂无抖音"
        @select="openDouyin"
      />
      <p v-if="douyinList.length && !loadingDouyin" class="end">没有更多了</p>
    </div>

    <div v-show="tab === 'post'" class="feed">
      <p v-if="!list.length" class="empty">暂无帖子</p>
      <PostCard
        v-for="post in list"
        :key="post.id"
        :post="post"
        hide-user
        :liked="liked.has(post.id)"
        mine
        @open="goPost"
        @like="onLike"
        @comment="goPost"
        @share="onShare"
      />
      <p v-if="list.length" class="end">没有更多了</p>
    </div>

    <DouyinFeed
      v-if="overlay"
      overlay
      :items="douyinList"
      :start="overlayIndex"
      empty="暂无抖音"
      @close="overlay = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import UserAvatar from '@/components/UserAvatar.vue'
import VipBadge from '@/components/VipBadge.vue'
import PageHeader from '@/components/PageHeader.vue'
import PostCard from '@/components/PostCard.vue'
import DouyinFeed from '@/components/douyin/DouyinFeed.vue'
import DouyinGrid from '@/components/douyin/DouyinGrid.vue'
import { COLLECT_LIKE, MEDIA_POST, operateCollect } from '@/api/collect'
import { fetchDouyinList, type DouyinItem } from '@/api/douyin'
import { fetchPostList, type PostItem } from '@/api/ops'
import { fetchUserHome, toggleFollow, type PublicUser } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { encodeId, postPath, routeId } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

const tabs = [
  { key: 'douyin', label: '抖音' },
  { key: 'post', label: '帖子' },
] as const

type TabKey = (typeof tabs)[number]['key']

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const user = ref<PublicUser | null>(null)
const followed = ref(false)
const list = ref<PostItem[]>([])
const liked = ref(new Set<number>())
const douyinList = ref<DouyinItem[]>([])
const loadingDouyin = ref(false)
const overlay = ref(false)
const overlayIndex = ref(0)
const tab = ref<TabKey>('douyin')
const uid = computed(() => routeId(route.params.id))
const mine = computed(() => uid.value > 0 && uid.value === (userStore.user?.id || 0))
const name = computed(() => user.value?.nickname?.trim() || (uid.value ? `用户${encodeId(uid.value)}` : ''))
const avatarSrc = computed(() => mediaUrl(user.value?.img))

const goPost = (id: number) => router.push(postPath(id))

const openDouyin = (item: DouyinItem) => {
  overlayIndex.value = Math.max(0, douyinList.value.findIndex((x) => x.id === item.id))
  overlay.value = true
}

const load = async () => {
  if (!uid.value) return
  overlay.value = false
  try {
    await userStore.ensureLogin()
    const home = await fetchUserHome(uid.value)
    user.value = home.user
    followed.value = home.is_followed
    loadingDouyin.value = true
    const [posts, douyin] = await Promise.all([
      fetchPostList('new', 1, 20, uid.value),
      fetchDouyinList(1, 24, '', 1, '', '', 0, uid.value),
    ])
    list.value = posts.list || []
    douyinList.value = douyin.list || []
  } catch (err) {
    toastError(err)
  } finally {
    loadingDouyin.value = false
  }
}

const onFollow = async () => {
  if (!uid.value) return
  try {
    await userStore.ensureLogin()
    const { followed: next } = await toggleFollow(uid.value)
    followed.value = next
    if (user.value) {
      user.value.fans = Math.max(0, (user.value.fans || 0) + (next ? 1 : -1))
    }
    showToast(next ? '已关注' : '已取消关注')
  } catch (err) {
    toastError(err)
  }
}

const onLike = async (id: number) => {
  try {
    await userStore.ensureLogin()
    const next = !liked.value.has(id)
    await operateCollect(id, MEDIA_POST, next, COLLECT_LIKE)
    const nextSet = new Set(liked.value)
    if (next) nextSet.add(id)
    else nextSet.delete(id)
    liked.value = nextSet
    const row = list.value.find((p) => p.id === id)
    if (row) row.like_count = Math.max(0, row.like_count + (next ? 1 : -1))
  } catch (err) {
    toastError(err)
  }
}

const onShare = async (id: number) => {
  const url = `${location.origin}${postPath(id)}`
  try {
    if (navigator.share) {
      await navigator.share({ url })
      return
    }
    await navigator.clipboard.writeText(url)
    showToast('链接已复制')
  } catch {
    showToast('分享取消')
  }
}

watch(uid, load)
onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.user-home {
  background: #0d0d12;
  color: #f5f5f8;
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 16px 0;
  padding: 14px;
  background: #191920;
  border-radius: 13px;
}

.avatar {
  flex-shrink: 0;
}

.meta {
  flex: 1;
  min-width: 0;

  .name-row {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  strong {
    min-width: 0;
    font-size: 16px;
    font-weight: 700;
    color: #f5f5f8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: #8c8c9c;
  }
}

.follow {
  border: 0;
  background: #ff3d7f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 14px;
  padding: 6px 14px;
  flex-shrink: 0;

  &.on {
    background: #331020;
    color: #ff6699;
  }
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
  margin-top: 4px;
  padding: 6px 16px 0;
}

.tab {
  appearance: none;
  position: relative;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.38);
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  padding: 12px 4px 14px;

  &.on {
    color: #fff;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 4px;
      width: 18px;
      height: 3px;
      border-radius: 99px;
      background: #fff;
      transform: translateX(-50%);
    }
  }
}

.pane,
.feed {
  margin-top: 4px;
  background: #0d0d12;
  padding-bottom: 24px;
}

.empty,
.end {
  padding: 28px 16px;
  text-align: center;
  color: #8c8c9c;
  font-size: 13px;
}
</style>
