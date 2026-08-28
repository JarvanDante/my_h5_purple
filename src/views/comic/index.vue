<template>
  <div class="page-shell comic-page">
    <HomeHeader
      dark
      :channels="channels"
      :channel="channel"
      @select-channel="selectChannel"
      @checkin="go('/checkin')"
      @search="go(searchPath(channel))"
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
            <p v-if="!floors.length" class="page-empty">{{ emptyText }}</p>
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
import PosterCard from '@/components/home/PosterCard.vue'
import PosterGrid from '@/components/home/PosterGrid.vue'
import PosterRail from '@/components/home/PosterRail.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import classIcon from '@/assets/icons/mid/class.png'
import dailyIcon from '@/assets/icons/mid/daily.png'
import hotIcon from '@/assets/icons/mid/hot.png'
import rankIcon from '@/assets/icons/mid/rank.png'
import { fetchCartoonCategories, fetchCartoonList, type CartoonCategory, type CartoonItem } from '@/api/cartoon'
import { fetchComicsModules, type ComicsItem, type ComicsModule } from '@/api/comics'
import { useTabSlide } from '@/composables/useTabSlide'
import type { CoverItem } from '@/data/mock'
import { comicPath, videoPath } from '@/utils/idcrypt'
import { searchPath } from '@/utils/searchScope'
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

type FloorCat = { id: number; name: string; kind: number }
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

const media = computed(() => (isCartoon.value ? 'cartoon' : 'comic'))
const mediaLabel = computed(() => (isCartoon.value ? '动漫' : '漫画'))

const floorMeta = (cat: FloorCat) => {
  const name = cat.name
  const kind = cat.kind
  const mid = media.value
  if (kind === 1) {
    return {
      layout: 'rail' as const,
      sub: 'NEW ARRIVALS',
      more: `/list?media=${mid}&type=daily`,
      size: 10,
      mark: 'new' as CoverItem['mark'],
    }
  }
  if (kind === 2) {
    return {
      layout: 'grid' as const,
      sub: 'HOT',
      more: `/list?media=${mid}&type=recommend`,
      size: 9,
      mark: 'hot' as CoverItem['mark'],
    }
  }
  if (kind === 3) {
    return {
      layout: 'rail' as const,
      sub: 'RANKING',
      more: `/list?media=${mid}&type=rank`,
      size: 10,
      mark: 'hot' as CoverItem['mark'],
    }
  }
  return {
    layout: 'grid' as const,
    sub: '',
    more: `/list?media=${mid}&type=category&category=${encodeURIComponent(name)}`,
    size: 9,
    mark: undefined as CoverItem['mark'],
  }
}

const fallbackCats = (prefix: number): FloorCat[] => [
  { id: prefix + 1, name: '新更', kind: 1 },
  { id: prefix + 2, name: '推荐', kind: 2 },
]

const banners = computed<CoverItem[]>(() => {
  const first = floors.value.find((f) => f.items.length)
  return first?.items.slice(0, 5) || []
})

const emptyText = computed(() => {
  if (!ready.value) return `${channel.value}即将上线`
  if (isCartoon.value) return '暂无动漫，子后台「动漫管理」上架后显示'
  if (!floors.value.length) return '暂无模块，请在子后台「漫画模块」配置'
  return '暂无漫画，子后台「漫画管理」上架后显示'
})

const go = (path: string) => {
  router.push(path)
}

const open = (item: CoverItem) => {
  if (isCartoon.value) {
    router.push(videoPath(item.id))
    return
  }
  router.push(comicPath(item.id))
}

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

const moduleMore = (mod: ComicsModule) => {
  const tag = mod.tags?.[0]
  if (tag) return `/list?media=comic&tag=${encodeURIComponent(tag)}`
  return '/list?media=comic&type=daily'
}

const loadCartoonItems = async (cat: FloorCat) => {
  const meta = floorMeta(cat)
  const category = cat.kind === 0 ? cat.name : ''
  const sort = cat.kind === 1 ? 1 : 0
  const data = await fetchCartoonList(1, meta.size, '', category, sort)
  let rows = data.list || []
  if ((cat.kind === 2 || cat.kind === 3) && !rows.length) {
    const latest = await fetchCartoonList(1, meta.size, '', '', 1)
    rows = latest.list || []
  }
  return rows.map((c, i) => toCartoonCover(c, i < 2 ? meta.mark : undefined))
}

const toFloors = async (cats: FloorCat[], loader: (cat: FloorCat) => Promise<CoverItem[]>) => {
  const rows = await Promise.all(
    cats.map(async (cat) => {
      const meta = floorMeta(cat)
      let items: CoverItem[] = []
      try {
        items = await loader(cat)
      } catch (err) {
        toastError(err)
      }
      return {
        id: cat.id,
        title: cat.name,
        sub: meta.sub,
        layout: meta.layout,
        more: meta.more,
        empty: `暂无「${cat.name}」${mediaLabel.value}`,
        items,
      }
    }),
  )
  floors.value = rows
}

const loadComicFloors = async () => {
  try {
    const mods = (await fetchComicsModules('comic_home')).list || []
    if (!mods.length) {
      floors.value = []
      return
    }
    floors.value = mods.map((mod) => {
      const mark = moduleMark(mod.icon)
      return {
        id: mod.id,
        title: mod.name,
        sub: moduleSub(mod.icon),
        layout: moduleLayout(mod.style),
        more: moduleMore(mod),
        empty: `暂无「${mod.name}」漫画`,
        items: (mod.items || []).map((c, i) => toComicCover(c, i < 2 ? mark : undefined)),
      }
    })
  } catch (err) {
    toastError(err)
    floors.value = []
  }
}

const loadCartoonFloors = async () => {
  let cats: CartoonCategory[] = []
  try {
    cats = (await fetchCartoonCategories()).list || []
  } catch {
    cats = []
  }
  await toFloors(cats.length ? cats : fallbackCats(20), loadCartoonItems)
}

const loadFloors = () => {
  floors.value = []
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
  height: 88px;
  padding: 0 6px;
  background: #1c1c22;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.quick-item {
  border: 0;
  background: transparent;
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.quick-icon {
  width: 56px;
  height: 56px;
  object-fit: contain;
  background: transparent;
  border-radius: 0;
  mix-blend-mode: lighten;
}

.quick-label {
  color: #c8c8d0;
  font-size: 11px;
  line-height: 1.1;
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

.comic-page .quick-strip .quick-icon {
  background: transparent;
}

.comic-page .quick-strip .quick-label {
  color: #c8c8d0;
  background: transparent;
}
</style>
