<template>
  <div class="page-shell video-page">
    <HomeHeader
      dark
      :channels="channels"
      :channel="channel"
      :search-text="searchHint"
      @select-channel="selectChannel"
      @checkin="go('/checkin')"
      @search="go(searchPath('video'))"
      @vip="go('/vip')"
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

          <template v-if="floors.length">
            <FloorBlock
              v-for="floor in floors"
              :key="floor.id"
              :title="floor.title"
              :sub="floor.sub"
              more
              @more="go(floor.more)"
            >
              <p v-if="!floor.items.length" class="page-empty">{{ floor.empty }}</p>
              <PosterRail v-else-if="floor.layout === 'rail'" :items="floor.items" @select="open" />
              <PosterRail v-else-if="floor.layout === 'wide-rail'" :items="floor.items" wide @select="open" />
              <PosterGrid v-else-if="floor.layout === 'grid-2'" :items="floor.items" :cols="2" @select="open" />
              <PosterGrid v-else-if="floor.layout === 'wide-grid'" :items="floor.items" :cols="2" wide @select="open" />
              <div v-else-if="floor.layout === 'hero-mix'" class="hero-mix">
                <PosterCard v-if="floor.items[0]" class="hero-mix-main" :item="floor.items[0]" wide @select="open" />
                <PosterGrid :items="floor.items.slice(1)" :cols="2" wide @select="open" />
              </div>
              <div v-else-if="floor.layout === 'one-wide'" class="one-wide">
                <PosterCard :item="floor.items[0]" wide @select="open" />
              </div>
              <PosterGrid v-else :items="floor.items" @select="open" />
            </FloorBlock>
          </template>
          <p v-else class="page-empty">{{ emptyText }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { fetchVideoCategories, fetchVideoModules, type VideoItem, type VideoModule } from '@/api/video'
import AdSwipe from '@/components/AdSwipe.vue'
import FloorBlock from '@/components/home/FloorBlock.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import PosterCard from '@/components/home/PosterCard.vue'
import PosterGrid from '@/components/home/PosterGrid.vue'
import PosterRail from '@/components/home/PosterRail.vue'
import { useTabSlide } from '@/composables/useTabSlide'
import { videos, type CoverItem } from '@/data/mock'
import { formatDuration, isRecent } from '@/utils/format'
import { videoPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'
import { searchHint as videoSearchHint, searchPath } from '@/utils/searchScope'

defineOptions({ name: 'Video' })

const fallbackTabs = ['最新', '推荐', '视频榜', '电影', '短剧', '综艺']
const router = useRouter()
const channels = ref([...fallbackTabs])
const channelSlide = useTabSlide(channels.value, fallbackTabs[0])
const channel = computed(() => channelSlide.current.value)
const innerName = ref('tab-left')

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
}

type FloorLayout = 'rail' | 'wide-rail' | 'grid-2' | 'grid-3' | 'wide-grid' | 'hero-mix' | 'one-wide'
type FloorBlockItem = {
  id: number
  title: string
  sub: string
  layout: FloorLayout
  more: string
  empty: string
  items: CoverItem[]
}

const floors = ref<FloorBlockItem[]>([])

const toCover = (v: VideoItem, mark?: CoverItem['mark']): CoverItem => ({
  id: String(v.id),
  title: v.title,
  duration: formatDuration(v.duration),
  tag: 'Free',
  cover: mediaUrl(v.cover_url),
  mark: mark || (isRecent(v.created_at) ? 'new' : undefined),
  tone: v.id % 6,
})

const ads = computed<CoverItem[]>(() => {
  const live = floors.value.find((f) => f.items.length)?.items.slice(0, 6) || []
  return live.length ? live : videos.slice(0, 6)
})

const emptyText = '暂无模块，请在子后台「视频模块」配置'

const moduleLayout = (style: number): FloorLayout => {
  if (style === 1) return 'hero-mix'
  if (style === 2) return 'wide-grid'
  if (style === 3) return 'one-wide'
  if (style === 4) return 'grid-2'
  if (style === 5) return 'rail'
  if (style === 6) return 'wide-rail'
  return 'grid-3'
}

const moduleSub = (icon: number) => {
  if (icon === 2) return 'STAR'
  if (icon === 3) return 'HOT'
  return 'NEW'
}

const moduleMark = (icon: number): CoverItem['mark'] => (icon === 1 ? 'new' : 'hot')

const moduleMore = (mod: VideoModule) => {
  const tag = mod.tags?.[0]
  if (tag) return `/list?media=video&tag=${encodeURIComponent(tag)}`
  return '/list?media=video&type=daily'
}

const quicks = [
  { emoji: '👑', label: '抢先看', path: '/vip' },
  { emoji: '▶️', label: '直播', path: '' },
  { emoji: '📍', label: '专题', path: '/list?media=video&type=topic' },
  { emoji: '💰', label: '金币专区', path: '/wallet' },
]

const searchHint = computed(() => videoSearchHint('video'))

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

const loadCategories = async () => {
  try {
    const data = await fetchVideoCategories()
    const rows = data.list || []
    if (!rows.length) return
    const names = rows.map((r) => r.name)
    channels.value = names
    if (!names.includes(channel.value)) {
      channelSlide.select(names[0])
    }
  } catch {
    /* 顶栏分类失败时保留默认 tabs */
  }
}

const loadFloors = async () => {
  try {
    const mods = (await fetchVideoModules('video_home')).list || []
    floors.value = mods.map((mod) => {
      const mark = moduleMark(mod.icon)
      return {
        id: mod.id,
        title: mod.name,
        sub: moduleSub(mod.icon),
        layout: moduleLayout(mod.style),
        more: moduleMore(mod),
        empty: `暂无「${mod.name}」视频`,
        items: (mod.items || []).map((v, i) => toCover(v, i < 2 ? mark : undefined)),
      }
    })
  } catch (err) {
    toastError(err)
    floors.value = []
  }
}

onMounted(() => {
  loadCategories()
  loadFloors()
})
</script>

<style scoped lang="scss">
.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.page-empty {
  padding: 36px 16px;
  text-align: center;
  color: #6f6f78;
  font-size: 13px;
}

.hero-mix {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hero-mix-main {
  padding: 0 12px;
}

.one-wide {
  padding: 0 12px;
}
</style>
