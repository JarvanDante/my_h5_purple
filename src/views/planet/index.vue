<template>
  <div class="page-shell planet-page">
    <header class="planet-header">
      <div class="channel-row">
        <div class="channel-tabs">
          <ChannelTab
            v-for="item in tabs"
            :key="item"
            :label="item"
            :active="tab === item"
            @select="select(item)"
          />
        </div>
        <button type="button" class="search-btn" aria-label="搜索" @click="go('/search')">
          <LineIcon name="search" />
        </button>
      </div>
    </header>

    <section class="ad-strip">
      <article v-for="n in 4" :key="n" class="ad-card">
        <div class="ad-cover" />
        <p class="ad-title">广告位</p>
        <span class="ad-tag">广告</span>
      </article>
    </section>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="feed">
          <p v-if="hint" class="empty">{{ hint }}</p>
          <p v-else-if="!list.length" class="empty">暂无帖子，审核通过后显示</p>
          <PostCard
            v-for="(post, idx) in list"
            :key="post.id"
            :post="post"
            :topics="topicsOf(post)"
            :essence="idx === 0 && isRecommend"
            :top="idx === 0"
            :followed="followed.has(post.user_id)"
            :liked="liked.has(post.id)"
            :mine="post.user_id === myId"
            @open="goPost"
            @profile="goUser"
            @follow="onFollow"
            @like="onLike"
            @comment="goPost"
            @share="onShare"
          />
        </div>
      </transition>
    </div>

    <button type="button" class="fab" aria-label="发帖" @click="openCompose">+</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import ChannelTab from '@/components/ChannelTab.vue'
import PostCard from '@/components/PostCard.vue'
import LineIcon from '@/components/LineIcon.vue'
import { COLLECT_LIKE, MEDIA_POST, operateCollect } from '@/api/collect'
import { fetchPostCategories, fetchPostList, type PostItem } from '@/api/ops'
import { fetchFollows, toggleFollow } from '@/api/user'
import { slideByIndex } from '@/stores/nav'
import { useUserStore } from '@/stores/user'
import { getToken, toastError } from '@/utils/request'

defineOptions({ name: 'Planet' })

const FOLLOW_TAB = '关注'
const fallbackCats = ['推荐', '活动专区', '日常专区']

const router = useRouter()
const userStore = useUserStore()
const tabs = ref<string[]>([FOLLOW_TAB, ...fallbackCats])
const cateKind = ref<Record<string, number>>({})
const tab = ref(FOLLOW_TAB)
const name = ref('tab-left')
const list = ref<PostItem[]>([])
const followed = ref(new Set<number>())
const liked = ref(new Set<number>())
const myId = computed(() => userStore.user?.id || 0)
const isRecommend = computed(() => cateKind.value[tab.value] === 2 || tab.value === '推荐')

const hint = computed(() => {
  if (tab.value !== FOLLOW_TAB) return ''
  if (!getToken()) return '登录后查看关注的人发布的帖子'
  if (!list.value.length) return '关注的人发布后会显示在这里'
  return ''
})

const select = (item: string) => {
  if (item === tab.value) return
  name.value = slideByIndex(tabs.value.indexOf(tab.value), tabs.value.indexOf(item))
  tab.value = item
}
const go = (path: string) => router.push(path)
const goPost = (id: number) => router.push(`/planet/${id}`)
const goUser = (userId: number) => router.push(`/user/${userId}`)

const topicsOf = (post: PostItem) => post.topics?.length ? post.topics : []

const applyCategories = (rows: { name: string; kind: number }[]) => {
  const names = rows.map((r) => r.name.trim()).filter((n) => n && n !== FOLLOW_TAB)
  const kinds: Record<string, number> = {}
  rows.forEach((r) => {
    if (r.name) kinds[r.name] = r.kind
  })
  cateKind.value = kinds
  const next = [FOLLOW_TAB, ...(names.length ? names : fallbackCats)]
  if (next.join('\0') !== tabs.value.join('\0')) tabs.value = next
  if (!tabs.value.includes(tab.value)) tab.value = FOLLOW_TAB
}

const load = () => {
  if (tab.value === FOLLOW_TAB && !getToken()) {
    list.value = []
    return
  }
  const extra: { follow?: number; category?: string } = {}
  let sort = 'new'
  if (tab.value === FOLLOW_TAB) {
    extra.follow = 1
  } else {
    extra.category = tab.value
    if (cateKind.value[tab.value] === 2) sort = 'hot'
  }
  fetchPostList(sort, 1, 20, undefined, extra)
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
}

const loadCategories = () => {
  return fetchPostCategories()
    .then((data) => applyCategories(data.list || []))
    .catch(() => applyCategories([]))
    .finally(load)
}

const loadFollows = async () => {
  if (!getToken()) return
  try {
    const data = await fetchFollows(1, 80)
    followed.value = new Set((data.list || []).map((u) => u.id))
  } catch {
    followed.value = new Set()
  }
}

const onFollow = async (userId: number) => {
  try {
    await userStore.ensureLogin()
    const { followed: next } = await toggleFollow(userId)
    const nextSet = new Set(followed.value)
    if (next) nextSet.add(userId)
    else nextSet.delete(userId)
    followed.value = nextSet
    showToast(next ? '已关注' : '已取消关注')
    if (tab.value === FOLLOW_TAB) load()
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
  const url = `${location.origin}/planet/${id}`
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

const openCompose = async () => {
  try {
    await userStore.ensureLogin()
    router.push('/planet/compose')
  } catch (err) {
    toastError(err)
  }
}

watch(tab, load)
onMounted(() => {
  loadCategories()
  loadFollows()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.planet-page {
  background: #0b0b0d;
}

.planet-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #0b0b0d;
  padding: var(--app-header-top) 8px 0 12px;
  border-bottom: 1px solid rgba(255, 92, 147, 0.55);
}

.channel-row {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 44px;
}

.channel-tabs {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  height: 44px;
  gap: 22px;
  padding-left: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.search-btn {
  width: 40px;
  height: 44px;
  border: 0;
  background: transparent;
  color: #d5d5dc;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.line-icon) {
    width: 20px;
    height: 20px;
  }
}

.ad-strip {
  display: flex;
  gap: 10px;
  padding: 12px 12px 8px;
  overflow-x: auto;
  background: #0b0b0d;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.ad-card {
  width: 92px;
  flex-shrink: 0;
}

.ad-cover {
  width: 92px;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  background: #1c1c22;
}

.ad-title {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #c8c8c8;
}

.ad-tag {
  display: inline-block;
  margin-top: 3px;
  font-size: 10px;
  color: #9a9a9a;
  background: #1c1c22;
  border-radius: 3px;
  padding: 1px 5px;
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.feed {
  padding: 8px 0 72px;
  background: #0b0b0d;
}

.empty {
  padding: 48px 16px;
  color: #8d8d96;
  font-size: 13px;
  text-align: center;
  background: #1c1c22;
}

.fab {
  position: fixed;
  right: 16px;
  bottom: calc(#{$tabbar-height} + 20px);
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 50%;
  background: #ff3d7f;
  color: #1a0a12;
  font-size: 34px;
  line-height: 1;
  font-weight: 400;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
  z-index: 20;
}

@media (min-width: $desktop-preview-min) {
  .fab {
    right: calc(50% - #{$phone-max-width} / 2 + 16px);
  }
}
</style>
