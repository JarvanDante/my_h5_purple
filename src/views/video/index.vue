<template>
  <div class="page-shell video-page">
    <HomeHeader
      :channels="channels"
      :channel="channel"
      :sub-tabs="[]"
      sub-tab=""
      @select-channel="selectChannel"
      @checkin="go('/checkin')"
      @search="go('/search')"
      @vip="go('/vip')"
      @favorite="go('/favorite')"
    />

    <section class="ad-rail-wrap">
      <AdSwipe :items="ads" />
    </section>

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel" class="inner-pane">
          <section class="quick-strip">
            <button v-for="item in quicks.slice(0, 4)" :key="item.label" type="button" class="quick-item" @click="onQuick(item)">
              <span class="quick-icon">{{ item.emoji }}</span>
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <SectionPanel :title="sectionTitle" more @more="go(morePath)">
            <p v-if="!covers.length" class="page-empty">{{ emptyText }}</p>
            <div v-else class="video-grid">
              <article v-for="item in covers" :key="item.id" @click="open(item)">
                <div class="thumb" :class="`tone-${item.tone}`">
                  <EncryptedImage v-if="item.cover" :src="item.cover" alt="" />
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AdSwipe from '@/components/AdSwipe.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import { fetchVideoCategories, fetchVideoList, type VideoItem } from '@/api/video'
import { useTabSlide } from '@/composables/useTabSlide'
import SectionPanel from '@/components/SectionPanel.vue'
import { videos, type CoverItem } from '@/data/mock'
import { videoPath } from '@/utils/idcrypt'
import EncryptedImage from '@/components/EncryptedImage.vue'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Video' })

const fallbackTabs = ['最新', '推荐', '视频榜', '电影', '短剧', '综艺']
const router = useRouter()
const channels = ref([...fallbackTabs])
const cateKind = ref<Record<string, number>>({})
const channelSlide = useTabSlide(channels.value, fallbackTabs[0])
const channel = computed(() => channelSlide.current.value)
const innerName = ref('tab-left')

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
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

const currentKind = computed(() => cateKind.value[channel.value])

const sectionTitle = computed(() => {
  const kind = currentKind.value
  if (kind === 2 || channel.value === '推荐') return '精选推荐'
  if (kind === 3 || channel.value.includes('榜')) return channel.value || '视频榜'
  if (kind === 0) return channel.value || '今日上新'
  return '今日上新'
})

const emptyText = computed(() => {
  const kind = currentKind.value
  if (kind === 2 || channel.value === '推荐') return '暂无推荐视频'
  if (kind === 3 || channel.value.includes('榜')) return '暂无视频榜'
  if (kind === 0) return `暂无「${channel.value}」视频，上架并选择该分类后显示`
  return '暂无视频，子后台「视频管理」上架后显示'
})

const morePath = computed(() => {
  const kind = currentKind.value
  const name = channel.value
  if (kind === 3 || name.includes('榜')) return '/list?media=video&type=rank'
  if (kind === 2 || name === '推荐') return '/list?media=video&type=recommend'
  if (kind === 1 || name === '最新' || name === '新更' || name === '日更') return '/list?media=video&type=daily'
  return `/list?media=video&type=category&category=${encodeURIComponent(name)}`
})

const quicks = [
  { emoji: '👑', label: '抢先看', path: '/vip' },
  { emoji: '▶️', label: '直播', path: '' },
  { emoji: '📍', label: '专题', path: '/list?media=video&type=topic' },
  { emoji: '💰', label: '金币专区', path: '/wallet' },
]

const go = (path: string) => router.push(path)
const open = (item: CoverItem) => {
  if (item.id.startsWith('v')) {
    showToast('示例广告')
    return
  }
  router.push(videoPath(item.id))
}

const onQuick = (item: { label: string; path: string }) => {
  if (item.path) {
    go(item.path)
    return
  }
  showToast(`${item.label} 稍后接入`)
}

const loadList = () => {
  const kind = cateKind.value[channel.value]
  let category = ''
  let sort = 1
  if (kind === 1) {
    sort = 1
  } else if (kind === 2 || kind === 3) {
    sort = 0
  } else if (kind === 0 || kind === undefined) {
    const name = channel.value
    if (name === '最新' || name === '新更' || name === '日更') sort = 1
    else if (name === '推荐' || name.includes('榜')) sort = 0
    else {
      category = name
      sort = 1
    }
  }
  fetchVideoList(1, 21, '', sort, category)
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
}

onMounted(() => {
  fetchVideoCategories()
    .then((data) => {
      const rows = data.list || []
      if (!rows.length) return
      const names = rows.map((r) => r.name)
      const kinds: Record<string, number> = {}
      rows.forEach((r) => {
        kinds[r.name] = r.kind
      })
      cateKind.value = kinds
      channels.value = names
      if (!names.includes(channel.value)) {
        channelSlide.select(names[0])
      }
    })
    .catch(() => undefined)
    .finally(loadList)
})

watch(channel, loadList)
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 8px;
}

.video-grid > article {
  min-width: 0;
}

.thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: $radius-thumb;
  overflow: hidden;

  :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    max-width: 100%;
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
