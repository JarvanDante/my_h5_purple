<template>
  <div class="page-shell video-page">
    <header class="video-header">
      <div class="tab-row">
        <div class="tabs">
          <button
            v-for="item in tabs"
            :key="item"
            type="button"
            class="tab-item"
            :class="{ active: tab === item }"
            @click="select(item)"
          >
            {{ item }}
          </button>
        </div>
        <button type="button" class="checkin-btn" @click="go('/checkin')">
          <span>🎁</span>
          签到
        </button>
      </div>

      <div class="search-row">
        <div class="search-box" @click="go('/search')">
          <span class="search-icon">⌕</span>
          <span>搜索更多视频</span>
        </div>
        <button type="button" class="side-action vip" @click="go('/vip')">
          <span>VIP</span>
          充值
        </button>
        <button type="button" class="side-action fav" @click="go('/favorite')">
          <span>★</span>
          收藏
        </button>
      </div>

      <section class="ad-row">
        <button
          v-for="item in ads"
          :key="item.id"
          type="button"
          class="ad-card"
          @click="open(item)"
        >
          <div class="ad-cover" :class="`tone-${item.tone}`">
            <img v-if="item.cover" :src="item.cover" alt="" />
          </div>
          <p class="ellipsis">{{ item.title }}</p>
          <span>广告</span>
        </button>
      </section>
    </header>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="inner-pane">
          <section class="quick-grid">
            <button v-for="item in quicks" :key="item.label" type="button" @click="onQuick(item)">
              <span class="q-icon" :style="{ background: item.bg }">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          </section>

          <section class="block">
            <div class="block-head">
              <h3>日更限定//特别放送//🎬🎬🎬</h3>
              <button type="button" @click="go('/list?type=daily')">更多 ›</button>
            </div>
            <p v-if="!covers.length" class="page-empty">暂无视频，子后台「视频管理」上架后显示</p>
            <div v-else class="video-grid">
              <article v-for="item in covers" :key="item.id" @click="open(item)">
                <div class="thumb" :class="`tone-${item.tone}`">
                  <img v-if="item.cover" :src="item.cover" alt="" />
                  <span class="badge">{{ item.tag || 'Free' }}</span>
                  <span v-if="item.duration" class="duration">{{ item.duration }}</span>
                </div>
                <p class="title">{{ item.title }}</p>
                <span v-if="item.views" class="hot">人气·{{ item.views }}</span>
              </article>
            </div>
          </section>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { fetchVideoList, type VideoItem } from '@/api/video'
import { useTabSlide } from '@/composables/useTabSlide'
import { videos, type CoverItem } from '@/data/mock'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Video' })

const router = useRouter()
const tabs = ['热门', '最新', '热播', '短视频', '长视频']
const slide = useTabSlide(tabs)
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const select = (item: string) => slide.select(item)
const list = ref<VideoItem[]>([])

const pad = (n: number) => String(n).padStart(2, '0')
const formatDuration = (sec: number) => {
  if (!sec) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

const toCover = (v: VideoItem): CoverItem => ({
  id: String(v.id),
  title: v.title,
  duration: formatDuration(v.duration),
  tag: 'Free',
  cover: mediaUrl(v.cover_url),
  tone: v.id % 6,
})

const covers = computed<CoverItem[]>(() => list.value.map(toCover))
const ads = computed<CoverItem[]>(() => {
  const live = covers.value.slice(0, 6)
  return live.length ? live : videos.slice(0, 6)
})

const quicks = [
  { icon: '👑', label: '抢先看', bg: '#ffe4ec', path: '/vip' },
  { icon: '📹', label: '直播', bg: '#ffe8f0', path: '' },
  { icon: '📖', label: '专题', bg: '#fff3e0', path: '/list?type=topic' },
  { icon: '🪙', label: '金币专区', bg: '#fff6d8', path: '/wallet' },
  { icon: '🎁', label: '热门', bg: '#ffe4d6', path: '/list?type=hot' },
  { icon: '🏆', label: '排行', bg: '#e8f1ff', path: '/list?type=rank' },
  { icon: '🎬', label: '片商', bg: '#f3e8ff', path: '/list?type=category' },
  { icon: '⭐', label: '演员', bg: '#ffe8ea', path: '' },
  { icon: '📁', label: '分类', bg: '#e8f8ef', path: '/list?type=category' },
  { icon: '✨', label: '原创', bg: '#e8f4ff', path: '/list?type=daily' },
]

const go = (path: string) => router.push(path)
const open = (item: CoverItem) => {
  if (item.id.startsWith('v')) {
    showToast('示例广告')
    return
  }
  router.push(`/video/${item.id}`)
}

const onQuick = (item: { label: string; path: string }) => {
  if (item.path) {
    go(item.path)
    return
  }
  showToast(`${item.label} 稍后接入`)
}

onMounted(() => {
  fetchVideoList(1, 20)
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

$video-red: #7a1424;

.video-header {
  background: $video-red;
  color: #fff;
  padding: 8px 0 12px;
}

.tab-row,
.search-row {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.tabs {
  flex: 1;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  min-width: 0;
}

.tab-item {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 600;
  padding: 6px 0 8px;
  position: relative;

  &.active {
    color: #fff;

    &::after {
      content: '';
      position: absolute;
      left: 2px;
      right: 2px;
      bottom: 0;
      height: 2px;
      background: #fff;
      border-radius: 2px;
    }
  }
}

.checkin-btn {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;

  span {
    font-size: 18px;
    line-height: 1;
  }
}

.search-row {
  margin-top: 8px;
  gap: 8px;
}

.search-box {
  flex: 1;
  height: 34px;
  border-radius: 17px;
  background: rgba(0, 0, 0, 0.28);
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 13px;
}

.search-icon {
  font-size: 16px;
}

.side-action {
  width: 40px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 10px;
  line-height: 1.15;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;

  span {
    font-size: 12px;
    font-weight: 700;
  }

  &.vip span {
    color: $secondary-color;
  }

  &.fav span {
    color: #ffb14a;
  }
}

.ad-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 12px 12px 0;
}

.ad-card {
  width: 72px;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  color: #fff;

  p {
    margin-top: 6px;
    font-size: 11px;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.45);
  }
}

.ad-cover {
  height: 96px;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.inner-pane {
  background: #fff;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px 4px;
  padding: 14px 8px 8px;

  button {
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #333;
  }
}

.q-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.block {
  padding: 8px 12px 16px;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  h3 {
    font-size: 13px;
    font-weight: 700;
  }

  button {
    border: 0;
    background: transparent;
    color: #999;
    font-size: 12px;
  }
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 8px;
}

.thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #3b82f6;
  color: #fff;
  font-size: 10px;
  padding: 2px 8px 3px;
  border-radius: 8px 0 8px 0;
}

.duration {
  position: absolute;
  left: 6px;
  bottom: 6px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
}

.title {
  margin-top: 6px;
  font-size: 13px;
  color: #222;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot {
  display: inline-block;
  margin-top: 4px;
  background: #ffe8d6;
  color: #e24b2a;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
}

.tone-0 { background: linear-gradient(160deg, #d9c7ee, #8a6bb3); }
.tone-1 { background: linear-gradient(160deg, #c7d8ee, #6b8ab3); }
.tone-2 { background: linear-gradient(160deg, #eec7d4, #b36b86); }
.tone-3 { background: linear-gradient(160deg, #c7eee0, #6bb39a); }
.tone-4 { background: linear-gradient(160deg, #eee3c7, #b39a6b); }
.tone-5 { background: linear-gradient(160deg, #c7e4ee, #6ba0b3); }
</style>
