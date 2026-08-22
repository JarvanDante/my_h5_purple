<template>
  <div class="page-shell comic-page">
    <HomeHeader
      dark
      :channels="channels"
      :channel="channel"
      search-text="输入你想搜索的关键字"
      @select-channel="selectChannel"
      @checkin="go('/checkin')"
      @search="go('/search')"
      @vip="go('/vip')"
    />

    <HomeHero :items="banners" @select="open" />

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel" class="floor-pane">
          <section v-if="ready" class="quick-strip">
            <button v-for="item in quicks" :key="item.label" type="button" class="quick-item" @click="go(item.path)">
              <img class="quick-icon" :src="item.icon" :alt="item.label" />
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <template v-if="ready">
            <FloorBlock title="竖图横滑" sub="NEW ARRIVALS" more @more="go(railMore)">
              <p v-if="!railItems.length" class="page-empty">{{ emptyText }}</p>
              <PosterRail v-else :items="railItems" @select="open" />
            </FloorBlock>

            <FloorBlock title="竖图九宫格" sub="NEW ARRIVALS" more @more="go(gridMore)">
              <p v-if="!gridItems.length" class="page-empty">{{ emptyText }}</p>
              <PosterGrid v-else :items="gridItems" @select="open" />
            </FloorBlock>
          </template>

          <p v-else class="page-empty">{{ emptyText }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import FloorBlock from '@/components/home/FloorBlock.vue'
import HomeHero from '@/components/home/HomeHero.vue'
import PosterGrid from '@/components/home/PosterGrid.vue'
import PosterRail from '@/components/home/PosterRail.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import classIcon from '@/assets/icons/mid/class.png'
import dailyIcon from '@/assets/icons/mid/daily.png'
import hotIcon from '@/assets/icons/mid/hot.png'
import rankIcon from '@/assets/icons/mid/rank.png'
import { fetchCartoonList, type CartoonItem } from '@/api/cartoon'
import { fetchComicsList, type ComicsItem } from '@/api/comics'
import { useTabSlide } from '@/composables/useTabSlide'
import type { CoverItem } from '@/data/mock'
import { videoPath } from '@/utils/idcrypt'
import { formatDuration, formatViews, isRecent } from '@/utils/format'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Comic' })

const router = useRouter()
const channels = ['漫画', '动漫', '小说', '短剧']
const channelSlide = useTabSlide(channels)
const channel = computed(() => channelSlide.current.value)
const innerName = ref('tab-left')
const isCartoon = computed(() => channel.value === '动漫')
const isComic = computed(() => channel.value === '漫画')
const ready = computed(() => isComic.value || isCartoon.value)

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
}

const comicQuicks = [
  { icon: classIcon, label: '专题', path: '/list?media=comic&type=topic' },
  { icon: hotIcon, label: '热门', path: '/list?media=comic&type=hot' },
  { icon: dailyIcon, label: '每日', path: '/list?media=comic&type=daily' },
  { icon: rankIcon, label: '榜单', path: '/list?media=comic&type=rank' },
]
const cartoonQuicks = [
  { icon: classIcon, label: '专题', path: '/list?media=cartoon&type=topic' },
  { icon: hotIcon, label: '热门', path: '/list?media=cartoon&type=hot' },
  { icon: dailyIcon, label: '每日', path: '/list?media=cartoon&type=daily' },
  { icon: rankIcon, label: '榜单', path: '/list?media=cartoon&type=rank' },
]
const quicks = computed(() => (isCartoon.value ? cartoonQuicks : comicQuicks))

const comicLatest = ref<ComicsItem[]>([])
const comicHot = ref<ComicsItem[]>([])
const cartoonLatest = ref<CartoonItem[]>([])
const cartoonHot = ref<CartoonItem[]>([])

const toComicCover = (c: ComicsItem, mark?: CoverItem['mark']): CoverItem => {
  const ended = c.update_status === 2
  return {
    id: String(c.id),
    title: c.title,
    cover: mediaUrl(c.cover),
    views: formatViews(c.view_count),
    badge: ended ? '已完结' : `共${c.chapter_count || 0}话`,
    statusTone: ended ? 'end' : 'chapter',
    mark: mark || (isRecent(c.created_at) ? 'new' : c.view_count >= 1000 ? 'hot' : undefined),
    tone: c.id % 6,
  }
}

const toCartoonCover = (c: CartoonItem, mark?: CoverItem['mark']): CoverItem => ({
  id: String(c.id),
  title: c.title,
  cover: mediaUrl(c.cover_url),
  duration: formatDuration(c.duration),
  badge: (c.categories?.[0] || c.category || '').split(/[,，]/)[0] || undefined,
  statusTone: 'chapter',
  mark: mark || (isRecent(c.created_at) ? 'new' : undefined),
  tone: c.id % 6,
})

const railItems = computed<CoverItem[]>(() => {
  if (isCartoon.value) return cartoonLatest.value.slice(0, 10).map((c, i) => toCartoonCover(c, i < 2 ? 'new' : undefined))
  if (isComic.value) return comicLatest.value.slice(0, 10).map((c, i) => toComicCover(c, i < 2 ? 'new' : undefined))
  return []
})

const gridItems = computed<CoverItem[]>(() => {
  if (isCartoon.value) return cartoonHot.value.slice(0, 9).map((c, i) => toCartoonCover(c, i < 2 ? 'hot' : undefined))
  if (isComic.value) return comicHot.value.slice(0, 9).map((c, i) => toComicCover(c, i < 2 ? 'hot' : undefined))
  return []
})

const banners = computed<CoverItem[]>(() => railItems.value.slice(0, 5))

const emptyText = computed(() => {
  if (!ready.value) return `${channel.value}即将上线`
  return isCartoon.value ? '暂无动漫，子后台「动漫管理」上架后显示' : '暂无漫画，子后台「漫画管理」上架后显示'
})

const media = computed(() => (isCartoon.value ? 'cartoon' : 'comic'))
const railMore = computed(() => `/list?media=${media.value}&type=daily`)
const gridMore = computed(() => `/list?media=${media.value}&type=recommend`)

const go = (path: string) => {
  router.push(path)
}

const open = (item: CoverItem) => {
  if (isCartoon.value) {
    router.push(videoPath(item.id))
    return
  }
  router.push(`/comic/${item.id}`)
}

const loadComicFloors = () => {
  Promise.all([
    fetchComicsList(1, 10, '', '', 2),
    fetchComicsList(1, 9, '', '', 0, 1),
  ])
    .then(([latest, hot]) => {
      comicLatest.value = latest.list || []
      const rec = hot.list || []
      comicHot.value = rec.length ? rec : (latest.list || []).slice(0, 9)
    })
    .catch(toastError)
}

const loadCartoonFloors = () => {
  Promise.all([
    fetchCartoonList(1, 10, '', '', 1),
    fetchCartoonList(1, 9, '', '', 0),
  ])
    .then(([latest, hot]) => {
      cartoonLatest.value = latest.list || []
      const rec = hot.list || []
      cartoonHot.value = rec.length ? rec : (latest.list || []).slice(0, 9)
    })
    .catch(toastError)
}

const loadFloors = () => {
  if (isCartoon.value) {
    loadCartoonFloors()
    return
  }
  if (isComic.value) {
    loadComicFloors()
    return
  }
}

onMounted(loadFloors)
watch(channel, loadFloors)
</script>

<style scoped lang="scss">
.comic-page {
  background: #0b0b0d;
  color: #f2f2f5;
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
  background: #0b0b0d;
}

.floor-pane {
  padding: 4px 0 20px;
  min-height: 60vh;
  background: #0b0b0d;
}

.quick-strip {
  margin: 0 12px 14px;
  padding: 14px 6px 12px;
  background: #1c1c22;
  border-radius: 14px;
  display: flex;
  justify-content: space-around;
}

.quick-item {
  border: 0;
  background: transparent;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.quick-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  mix-blend-mode: lighten;
}

.quick-label {
  color: #c8c8d0;
  font-size: 11px;
}

.page-empty {
  padding: 36px 16px;
  text-align: center;
  color: #6f6f78;
  font-size: 13px;
}
</style>

<style lang="scss">
.page-shell.comic-page {
  background: #0b0b0d;
}

.comic-page .inner-slide,
.comic-page .floor-pane {
  background: #0b0b0d;
}

.comic-page .quick-strip {
  background: #1c1c22;
  box-shadow: none;
}

.comic-page .quick-strip .quick-label {
  color: #c8c8d0;
  background: transparent;
}
</style>
