<template>
  <div class="page-shell sub-page comic-detail">
    <header class="hero">
      <div v-if="cover" class="hero-bg">
        <EncryptedImage class="hero-bg-img" :src="cover" alt="" />
      </div>
      <div class="hero-mask" />
      <div class="hero-visual">
        <div class="nav">
          <button type="button" class="nav-btn" aria-label="返回" @click="back">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button type="button" class="nav-btn" aria-label="分享" @click="share">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="2.2" stroke="currentColor" stroke-width="1.6" />
              <circle cx="6" cy="12" r="2.2" stroke="currentColor" stroke-width="1.6" />
              <circle cx="18" cy="19" r="2.2" stroke="currentColor" stroke-width="1.6" />
              <path d="M8 12.8 16 18.2M16 5.8 8 11.2" stroke="currentColor" stroke-width="1.6" />
            </svg>
          </button>
        </div>
        <div v-if="item" class="hero-main">
          <div class="poster">
            <EncryptedImage v-if="cover" :src="cover" alt="" />
          </div>
          <div class="meta">
            <h1>{{ item.title }}</h1>
            <p class="sub">
              <span v-for="name in categories" :key="name" class="cate">{{ name }}</span>
              <span class="chap-num">共{{ item.chapter_count || 0 }}话</span>
            </p>
            <p class="stats">
              <em>{{ formatCount(item.view_count) }}人气</em>
              <i />
              <em>{{ formatCount(favCount) }}人收藏</em>
            </p>
            <button type="button" class="fav-btn" :class="{ on: collected }" @click="onFav">
              {{ collected ? '已收藏' : '+收藏' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="hero-extra">
      <div v-if="tags.length" class="tag-row">
        <span v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <p v-if="item?.intro" class="intro"><b>故事：</b>{{ item.intro }}</p>
      <p v-if="item?.reason" class="reason">{{ item.reason }}</p>
    </div>

    <div class="panel">
      <div class="tab-row">
        <button type="button" class="tab" :class="{ active: tab === 'detail' }" @click="tab = 'detail'">
          漫画详情
        </button>
        <button type="button" class="tab" :class="{ active: tab === 'comment' }" @click="tab = 'comment'">
          评论({{ commentCount }})
        </button>
      </div>

      <div class="scroll-body">
        <template v-if="tab === 'detail'">
          <section class="catalog">
            <div class="catalog-head">
              <h3>目录</h3>
              <span>共{{ chapters.length }}话 ›</span>
            </div>
            <button
              v-for="ch in chapters"
              :key="ch.id"
              type="button"
              class="chapter"
              :class="{ lock: !ch.playable }"
              @click="openChapter(ch)"
            >
              <span class="ch-thumb">
                <EncryptedImage v-if="cover" :src="cover" alt="" />
              </span>
              <span class="ch-name">第{{ String(ch.seq).padStart(2, '0') }}话</span>
              <span v-if="ch.playable" class="watch">观看</span>
              <span v-else class="ch-lock">锁</span>
            </button>
          </section>
        </template>
        <div v-else class="comment-hold">评论即将开放</div>
      </div>
    </div>

    <div class="bottom-bar">
      <button v-if="item?.need_pay" type="button" class="read-btn" @click="buy">购买整部</button>
      <button v-else type="button" class="read-btn" @click="startFirst">开始阅读</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { fetchCollectList, MEDIA_COMICS, operateCollect } from '@/api/collect'
import {
  buyComics,
  fetchComicsChapters,
  fetchComicsDetail,
  comicCategories,
  type ChapterItem,
  type ComicsDetail,
} from '@/api/comics'
import { useUserStore } from '@/stores/user'
import EncryptedImage from '@/components/EncryptedImage.vue'
import { pushBrowse } from '@/utils/browseHistory'
import { comicReadPath, routeId } from '@/utils/idcrypt'
import { getToken, mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const item = ref<ComicsDetail | null>(null)
const chapters = ref<ChapterItem[]>([])
const collected = ref(false)
const tab = ref<'detail' | 'comment'>('detail')
const commentCount = computed(() => 0)

const cover = computed(() => mediaUrl(item.value?.cover))
const categories = computed(() => comicCategories(item.value || {}))
const tags = computed(() => (item.value?.tags || []).filter(Boolean))
const favCount = computed(() => Number(item.value?.like_count || 0))

const formatCount = (n?: number) => {
  const v = Number(n || 0)
  if (v >= 10000) return `${(v / 10000).toFixed(1).replace(/\.0$/, '')}w`
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(v)
}

const loadFav = async () => {
  if (!getToken() || !item.value) return
  try {
    const data = await fetchCollectList(1, MEDIA_COMICS, 1, 100)
    collected.value = (data.list || []).some((row) => row.content_id === item.value?.id)
  } catch {
    collected.value = false
  }
}

const load = async () => {
  const id = routeId(route.params.id)
  const [d, c] = await Promise.all([fetchComicsDetail(id), fetchComicsChapters(id)])
  item.value = d
  chapters.value = c.list || []
  pushBrowse({
    id: d.id,
    kind: 'comic',
    title: d.title,
    cover: d.cover,
    tag: d.is_vip ? 'VIP' : 'Free',
    sub: d.chapter_count ? `共${d.chapter_count}话` : '',
  })
  await loadFav()
}

const buy = async () => {
  if (!item.value) return
  try {
    const res = await buyComics(item.value.id)
    await userStore.refresh()
    showToast(`购买成功，余额 ${res.balance}`)
    await load()
  } catch (err) {
    toastError(err)
  }
}

const openChapter = (ch: ChapterItem) => {
  if (!ch.playable) {
    showToast(item.value?.need_vip ? '请先开通 VIP' : '请先购买')
    return
  }
  router.push(comicReadPath(item.value?.id || routeId(route.params.id), ch.id))
}

const startFirst = () => {
  const first = chapters.value.find((c) => c.playable) || chapters.value[0]
  if (first) openChapter(first)
}

const isStuckOnThisComic = (now: { fullPath: string; name?: string | symbol | null }) => {
  if (now.fullPath === route.fullPath) return true
  return now.name === 'ComicRead'
}

const back = async () => {
  for (let i = 0; i < 4; i++) {
    const prev = window.history.state?.back
    if (!prev) {
      await router.replace('/comic')
      return
    }
    await router.back()
    const now = router.currentRoute.value
    if (!isStuckOnThisComic(now)) return
  }
  await router.replace('/comic')
}

const share = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showToast('链接已复制')
  } catch {
    showToast('复制失败')
  }
}

const onFav = async () => {
  if (!item.value) return
  if (!getToken()) {
    try {
      await userStore.ensureLogin()
    } catch {
      showToast('请先登录')
      return
    }
  }
  const next = !collected.value
  try {
    await operateCollect(item.value.id, MEDIA_COMICS, next)
    collected.value = next
    item.value.like_count = Math.max(0, Number(item.value.like_count || 0) + (next ? 1 : -1))
    showToast(next ? '已收藏' : '已取消收藏')
  } catch (err) {
    toastError(err)
  }
}

onMounted(() => {
  load().catch(toastError)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.comic-detail {
  padding-bottom: 0;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0d0d12;
  color: #f5f5f8;
}

.hero {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 198px;
  box-sizing: border-box;
  overflow: hidden;
  color: #fff;
  background: #0d0d12;
}

.hero-visual {
  position: relative;
  z-index: 1;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px 10px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  :deep(img) {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: cover;
    object-position: center 28%;
    transform: scale(1.06);
    filter: blur(2px) brightness(0.78);
  }
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.12) 0%,
    rgba(0, 0, 0, 0.32) 48%,
    rgba(0, 0, 0, 0.55) 100%
  );
}

.hero-extra {
  flex-shrink: 0;
  width: 100%;
  padding: 12px 16px 14px;
  background: #0d0d12;
}

.nav,
.hero-main {
  position: relative;
  z-index: 1;
}

.nav {
  display: flex;
  justify-content: space-between;
  height: 40px;
  margin-top: var(--app-header-top);
  align-items: center;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  padding-left: 22px;
}

.poster {
  width: 86px;
  height: 118px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.32);
  outline: 1.5px solid rgba(255, 255, 255, 0.95);

  :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h1 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.cate {
  flex-shrink: 0;
  background: #331020;
  color: #ff6699;
  font-size: 10px;
  line-height: 1;
  padding: 3px 7px;
  border-radius: 4px;
  font-weight: 700;
}

.chap-num {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.86);
}

.stats {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.78);

  em {
    font-style: normal;
  }

  i {
    width: 1px;
    height: 10px;
    background: rgba(255, 255, 255, 0.35);
  }
}

.fav-btn {
  align-self: flex-start;
  margin-top: 10px;
  height: 30px;
  padding: 0 18px;
  border: 0;
  border-radius: 15px;
  background: #ff3d7f;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(255, 61, 127, 0.28);

  &.on {
    background: #331020;
    color: #ff6699;
    box-shadow: none;
  }
}

.panel {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0d0d12;
}

.tab-row {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-shrink: 0;
  padding: 10px 16px 0;
  border-bottom: 1px solid #22222b;
}

.tab {
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 0 10px;
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

.scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #0d0d12;
}

.comment-hold {
  padding: 48px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  background: transparent;

  span {
    font-size: 12px;
    color: #ff6699;
    background: #331020;
    border-radius: 999px;
    padding: 4px 10px;
  }
}

.intro {
  margin: 10px 0 0;
  font-size: 13px;
  color: #b0b0bd;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reason {
  margin: 8px 0 0;
  font-size: 12px;
  color: #ff8fb3;
}

.catalog {
  margin-top: 0;
}

.catalog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #191920;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #f5f5f8;
  }

  span {
    font-size: 12px;
    color: #ff6699;
  }
}

.chapter {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 14px;
  border: 0;
  border-bottom: 1px solid #22222b;
  background: #0d0d12;
  text-align: left;
}

.ch-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  background: #24242e;
  flex-shrink: 0;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.ch-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: #f5f5f8;
  font-weight: 500;
}

.chapter.lock .ch-name {
  color: #4e4e5a;
}

.watch {
  flex-shrink: 0;
  height: 26px;
  padding: 0 12px;
  border-radius: 13px;
  border: 1px solid #ff6699;
  color: #ff6699;
  font-size: 12px;
  line-height: 24px;
}

.ch-lock {
  flex-shrink: 0;
  font-size: 11px;
  color: #8c8c9c;
}

.bottom-bar {
  flex-shrink: 0;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px));
  background: #0d0d12;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.28);
}

.read-btn {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 22px;
  background: #ff3d7f;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
}
</style>
