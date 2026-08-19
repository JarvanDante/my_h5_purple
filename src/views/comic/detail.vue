<template>
  <div class="page-shell sub-page comic-detail">
    <header class="hero">
      <div v-if="cover" class="hero-tile" :style="{ backgroundImage: `url(${cover})` }" />
      <div v-if="cover" class="hero-blur" :style="{ backgroundImage: `url(${cover})` }" />
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
          <div class="title-row">
            <h1 class="ellipsis">{{ item.title }}</h1>
            <span v-if="category" class="cate">{{ category }}</span>
          </div>
          <p class="line">共{{ item.chapter_count || 0 }}话</p>
          <p class="line">{{ formatCount(item.view_count) }}人气 · {{ formatCount(item.like_count) }}人收藏</p>
          <button type="button" class="fav-btn" @click="onFav">+收藏</button>
        </div>
      </div>
    </header>

    <div v-if="tags.length" class="tag-row">
      <span v-for="tag in tags" :key="tag">{{ tag }}</span>
    </div>

    <section v-if="item?.intro" class="intro-card">{{ item.intro }}</section>
    <p v-if="item?.reason" class="reason">{{ item.reason }}</p>

    <section class="catalog">
      <div class="catalog-head">
        <h3>目录</h3>
        <span>共{{ chapters.length }}话</span>
      </div>
      <button
        v-for="ch in chapters"
        :key="ch.id"
        type="button"
        class="chapter"
        :class="{ lock: !ch.playable }"
        @click="openChapter(ch)"
      >
        <span class="ch-name">第{{ ch.seq }}话</span>
        <span v-if="!ch.playable" class="ch-lock">锁</span>
      </button>
    </section>

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

const cover = computed(() => mediaUrl(item.value?.cover))
const category = computed(() => comicCategories(item.value || {})[0] || '')
const tags = computed(() => (item.value?.tags || []).filter(Boolean))

const formatCount = (n?: number) => {
  const v = Number(n || 0)
  if (v >= 10000) return `${(v / 10000).toFixed(1).replace(/\.0$/, '')}w`
  return String(v)
}

const load = async () => {
  const id = Number(route.params.id)
  const [d, c] = await Promise.all([fetchComicsDetail(id), fetchComicsChapters(id)])
  item.value = d
  chapters.value = c.list || []
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

const onFav = () => {
  if (!getToken()) {
    showToast('请先登录')
    return
  }
  showToast('漫画收藏即将开放')
}

onMounted(() => {
  load().catch(toastError)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.comic-detail {
  padding-bottom: 0;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background: $background-page;
}

.hero {
  position: relative;
  padding: 0 14px 18px;
  overflow: hidden;
  color: #fff;
  min-height: 228px;
}

.hero-tile,
.hero-blur {
  position: absolute;
  inset: 0;
  background-position: center;
}

.hero-tile {
  background-repeat: repeat;
  background-size: 72px auto;
  opacity: 0.55;
  filter: brightness(0.45) saturate(0.9);
}

.hero-blur {
  background-repeat: no-repeat;
  background-size: cover;
  filter: blur(22px) brightness(0.42);
  transform: scale(1.12);
  opacity: 0.85;
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 10, 16, 0.25) 0%, rgba(20, 10, 16, 0.55) 100%);
}

.nav,
.hero-main {
  position: relative;
  z-index: 1;
}

.nav {
  display: flex;
  justify-content: space-between;
  height: 46px;
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
  margin-top: 6px;
}

.poster {
  width: 92px;
  height: 128px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);
}

.meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2px 0 0;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

h1 {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.cate {
  flex-shrink: 0;
  margin-top: 2px;
  background: $primary-color;
  color: #fff;
  font-size: 10px;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 3px;
  font-weight: 700;
}

.line {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
}

.fav-btn {
  align-self: flex-start;
  margin-top: 10px;
  height: 28px;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  background: $accent-yellow;
  color: $ink;
  font-size: 12px;
  font-weight: 800;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px 4px;
  background: #fff;

  span {
    font-size: 12px;
    color: #e07a2f;
    background: #f4f4f4;
    border-radius: 12px;
    padding: 4px 10px;
  }
}

.intro-card {
  margin: 10px 14px 0;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

.reason {
  margin: 8px 14px 0;
  font-size: 12px;
  color: #c2410c;
}

.catalog {
  flex: 1;
  margin: 12px 14px 12px;
  padding: 12px;
  background: #fff;
  border-radius: 12px;
}

.catalog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  h3 {
    font-size: 15px;
  }

  span {
    font-size: 12px;
    color: $text-color-secondary;
  }
}

.chapter {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  border: 0;
  border-top: 1px solid #f5eef1;
  background: #fff;
  font-size: 14px;
  color: $ink;
  text-align: left;

  &.lock {
    color: #bbb;
  }
}

.ch-lock {
  font-size: 11px;
  color: #c4a4ad;
}

.bottom-bar {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  padding: 8px 16px calc(8px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  box-shadow: 0 -4px 16px rgba(44, 27, 34, 0.06);
}

.read-btn {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 22px;
  background: $accent-yellow;
  color: $ink;
  font-size: 16px;
  font-weight: 800;
}
</style>
