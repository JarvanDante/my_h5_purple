<template>
  <div class="page-shell sub-page comic-detail">
    <header class="hero">
      <div v-if="cover" class="hero-bg">
        <img :src="cover" alt="" />
      </div>
      <div class="hero-mask" />
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
          <CoverMosaic :src="cover" />
        </div>
        <div class="meta">
          <h1 class="ellipsis">{{ item.title }}</h1>
          <p class="sub">
            <span v-for="name in categories" :key="name" class="cate">{{ name }}</span>
            <span class="chap-num">共{{ item.chapter_count || 0 }}话</span>
          </p>
          <p class="stats">{{ formatCount(item.view_count) }}人气 | {{ formatCount(favCount) }}人收藏</p>
          <button type="button" class="fav-btn" :class="{ on: collected }" @click="onFav">
            {{ collected ? '已收藏' : '+收藏' }}
          </button>
        </div>
      </div>
    </header>

    <div class="scroll-body">
      <div v-if="tags.length" class="tag-row">
        <span v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <p v-if="item?.intro" class="intro">{{ item.intro }}</p>
      <p v-if="item?.reason" class="reason">{{ item.reason }}</p>

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
            <img v-if="cover" :src="cover" alt="" />
          </span>
          <span class="ch-name">第{{ String(ch.seq).padStart(2, '0') }}话</span>
          <span v-if="ch.playable" class="watch">观看</span>
          <span v-else class="ch-lock">锁</span>
        </button>
      </section>
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
import CoverMosaic from '@/components/CoverMosaic.vue'
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
import { getToken, mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const item = ref<ComicsDetail | null>(null)
const chapters = ref<ChapterItem[]>([])
const collected = ref(false)

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
  const id = Number(route.params.id)
  const [d, c] = await Promise.all([fetchComicsDetail(id), fetchComicsChapters(id)])
  item.value = d
  chapters.value = c.list || []
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
  router.push(`/comic/${route.params.id}/read/${ch.id}`)
}

const startFirst = () => {
  const first = chapters.value.find((c) => c.playable) || chapters.value[0]
  if (first) openChapter(first)
}

const back = () => {
  if (window.history.state?.back) {
    router.back()
    return
  }
  router.replace('/comic')
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
  background: #fff;
}

.hero {
  position: relative;
  flex-shrink: 0;
  min-height: 292px;
  padding: 0 14px 32px;
  overflow: hidden;
  color: #fff;
  background: #1a1618;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  img {
    position: absolute;
    left: 50%;
    top: 46%;
    width: auto;
    height: 230%;
    max-width: none;
    transform: translate(-50%, -50%);
  }
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
}

.nav,
.hero-main {
  position: relative;
  z-index: 1;
}

.nav {
  display: flex;
  justify-content: space-between;
  height: calc(46px + env(safe-area-inset-top, 0px));
  padding-top: env(safe-area-inset-top, 0px);
  align-items: center;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

.hero-main {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.poster {
  width: 92px;
  height: 128px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.28);
  outline: 2px solid #fff;
}

.meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 2px 0 0;
}

h1 {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
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
  background: #7b6cff;
  color: #fff;
  font-size: 10px;
  line-height: 1;
  padding: 3px 7px;
  border-radius: 999px;
  font-weight: 700;
}

.chap-num,
.stats {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.88);
}

.stats {
  margin-top: 8px;
}

.fav-btn {
  align-self: flex-start;
  margin-top: 10px;
  height: 28px;
  padding: 0 16px;
  border: 0;
  border-radius: 14px;
  background: #ffd84d;
  color: #1a1a1f;
  font-size: 12px;
  font-weight: 800;

  &.on {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
  }
}

.scroll-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px 0;
  background: #fff;

  span {
    font-size: 12px;
    color: #e07a2f;
    background: #fff1e4;
    border-radius: 999px;
    padding: 4px 10px;
  }
}

.intro {
  margin: 10px 14px 0;
  font-size: 13px;
  color: #1a1a1f;
  line-height: 1.6;
}

.reason {
  margin: 8px 14px 0;
  font-size: 12px;
  color: #c2410c;
}

.catalog {
  margin-top: 14px;
}

.catalog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #fff1e4;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: #e07a2f;
  }

  span {
    font-size: 12px;
    color: #e07a2f;
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
  border-bottom: 1px solid #f4f0f2;
  background: #fff;
  text-align: left;
}

.ch-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  background: #f4f4f6;
  flex-shrink: 0;

  img {
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
  color: #1a1a1f;
  font-weight: 500;
}

.chapter.lock .ch-name {
  color: #bbb;
}

.watch {
  flex-shrink: 0;
  height: 26px;
  padding: 0 12px;
  border-radius: 13px;
  border: 1px solid #e07a2f;
  color: #e07a2f;
  font-size: 12px;
  line-height: 24px;
}

.ch-lock {
  flex-shrink: 0;
  font-size: 11px;
  color: #c4a4ad;
}

.bottom-bar {
  flex-shrink: 0;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  box-shadow: 0 -4px 16px rgba(44, 27, 34, 0.06);
}

.read-btn {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 22px;
  background: #ffd84d;
  color: #1a1a1f;
  font-size: 16px;
  font-weight: 800;
}
</style>
