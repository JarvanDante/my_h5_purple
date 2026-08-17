<template>
  <div class="page-shell video-page">
    <HomeHeader
      :channels="channels"
      :channel="channel"
      :sub-tabs="subTabs"
      :sub-tab="subTab"
      @select-channel="selectChannel"
      @select-sub="selectSub"
      @checkin="go('/checkin')"
      @search="go('/search')"
      @vip="go('/vip')"
      @favorite="go('/favorite')"
    />

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel + '-' + subTab" class="inner-pane">
          <section v-if="ads[0]" class="hero-banner" @click="open(ads[0])">
            <div class="hero-cover" :class="`tone-${ads[0].tone}`">
              <img v-if="ads[0].cover" :src="ads[0].cover" alt="" />
            </div>
          </section>

          <section class="quick-strip">
            <button v-for="item in quicks.slice(0, 4)" :key="item.label" type="button" class="quick-item" @click="onQuick(item)">
              <span class="quick-icon">{{ item.icon }}</span>
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <SectionPanel title="日更限定" more @more="go('/list?media=video&type=daily')">
            <p v-if="!covers.length" class="page-empty">暂无视频，子后台「视频管理」上架后显示</p>
            <div v-else class="video-grid">
              <article v-for="item in covers" :key="item.id" @click="open(item)">
                <div class="thumb" :class="`tone-${item.tone}`">
                  <img v-if="item.cover" :src="item.cover" alt="" />
                  <span class="meta-left">{{ item.views || '热播' }}</span>
                  <span v-if="item.duration" class="duration">{{ item.duration }}</span>
                </div>
                <p class="title">{{ item.title }}</p>
              </article>
            </div>
          </SectionPanel>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import HomeHeader from '@/components/HomeHeader.vue'
import { fetchVideoList, type VideoItem } from '@/api/video'
import { useTabSlide } from '@/composables/useTabSlide'
import SectionPanel from '@/components/SectionPanel.vue'
import { videos, type CoverItem } from '@/data/mock'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Video' })

const router = useRouter()
const channels = ['热门', '最新', '热播', '短视频', '长视频']
const subTabs = ['推荐', '日更', '排行', '金币', '免费', '片商', '分类']
const channelSlide = useTabSlide(channels)
const subSlide = useTabSlide(subTabs)
const channel = computed(() => channelSlide.current.value)
const subTab = computed(() => subSlide.current.value)
const innerName = ref('tab-left')

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
}

const selectSub = (item: string) => {
  subSlide.select(item)
  innerName.value = subSlide.name.value
}

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
  { icon: '📖', label: '专题', bg: '#fff3e0', path: '/list?media=video&type=topic' },
  { icon: '🪙', label: '金币专区', bg: '#fff6d8', path: '/wallet' },
  { icon: '🎁', label: '热门', bg: '#ffe4d6', path: '/list?media=video&type=hot' },
  { icon: '🏆', label: '排行', bg: '#e8f1ff', path: '/list?media=video&type=rank' },
  { icon: '🎬', label: '片商', bg: '#f3e8ff', path: '/list?media=video&type=category' },
  { icon: '⭐', label: '演员', bg: '#ffe8ea', path: '' },
  { icon: '📁', label: '分类', bg: '#e8f8ef', path: '/list?media=video&type=category' },
  { icon: '✨', label: '原创', bg: '#e8f4ff', path: '/list?media=video&type=daily' },
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
@use '@/styles/tones.scss' as *;

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.hero-banner {
  margin: 10px 12px 0;
  border-radius: $radius-card;
  overflow: hidden;
  border: 1.6px solid $ink;
  background: #fff;
}

.hero-cover {
  height: 148px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 8px;
}

.thumb {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: $radius-thumb;
  overflow: hidden;
  border: 1.6px solid $ink;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &::after {
    content: '';
    position: absolute;
    inset: auto 0 0;
    height: 42%;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
  }
}

.meta-left,
.duration {
  position: absolute;
  bottom: 6px;
  z-index: 1;
  color: #fff;
  font-size: 10px;
}

.meta-left {
  left: 6px;
}

.duration {
  right: 6px;
}

.title {
  margin-top: 6px;
  font-size: 13px;
  color: $ink;
  font-weight: 600;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@include media-tones;
</style>
