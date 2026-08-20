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

    <section v-if="ads.length" class="ad-rail-wrap">
      <AdSwipe :items="ads" @select="open" />
    </section>

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel + '-' + subTab" class="inner-pane">
          <section class="quick-strip">
            <button v-for="item in quicks.slice(0, 4)" :key="item.label" type="button" class="quick-item" @click="onQuick(item)">
              <span class="quick-icon"><LineIcon :name="item.icon" /></span>
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <SectionPanel title="日更限定" more @more="go('/list?media=video&type=daily')">
            <p v-if="!covers.length" class="page-empty">暂无视频，子后台「视频管理」上架后显示</p>
            <div v-else class="video-grid">
              <article v-for="item in covers" :key="item.id" @click="open(item)">
                <div class="thumb" :class="`tone-${item.tone}`">
                  <img v-if="item.cover" :src="item.cover" alt="" />
                  <span v-if="item.tag" class="badge">{{ item.tag }}</span>
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
import AdSwipe from '@/components/AdSwipe.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import LineIcon from '@/components/LineIcon.vue'
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
  { icon: 'vip', label: '抢先看', path: '/vip' },
  { icon: 'play', label: '直播', path: '' },
  { icon: 'topic', label: '专题', path: '/list?media=video&type=topic' },
  { icon: 'wallet', label: '金币专区', path: '/wallet' },
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
  fetchVideoList(1, 6, '', 1)
    .then((data) => {
      list.value = (data.list || []).slice(0, 6)
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

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 8px;
}

.thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: $radius-thumb;
  overflow: hidden;

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

.badge,
.duration {
  position: absolute;
  z-index: 1;
  color: #fff;
  font-size: 10px;
}

.badge {
  top: 6px;
  left: 6px;
  background: $primary-color;
  border: 0;
  border-radius: 6px;
  padding: 1px 6px;
}

.duration {
  left: 6px;
  bottom: 6px;
}

.title {
  margin-top: 6px;
  font-size: 13px;
  color: $ink;
  font-weight: 600;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@include media-tones;
</style>
