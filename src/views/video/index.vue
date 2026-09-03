<template>
  <div class="page-shell video-page" :class="{ 'is-douyin': isDouyin }">
    <HomeHeader
      dark
      :channels="channels"
      :channel="channel"
      :sub-tabs="isDouyin ? [] : subTabs"
      :sub-tab="subTab"
      :search-text="searchHint"
      :hide-search="isDouyin"
      @select-channel="selectChannel"
      @select-sub="selectSub"
      @checkin="go('/checkin')"
      @search="go(searchPath(channel))"
      @vip="go('/vip')"
    />

    <DouyinHome v-if="isDouyin" />

    <template v-else>
    <HomeHero :items="banners" @select="openBanner" />
    <AdBanner />

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel" class="inner-pane">
          <section v-if="quicks.length" class="quick-strip">
            <button
              v-for="item in quicks"
              :key="item.key"
              type="button"
              class="quick-item"
              @click="onQuick(item)"
            >
              <EncryptedImage class="quick-icon" :src="item.icon" :alt="item.label" />
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <div v-if="subTab" class="cat-pane">
            <p v-if="catLoading" class="page-empty">加载中…</p>
            <p v-else-if="!catItems.length" class="page-empty">暂无「{{ subTab }}」视频</p>
            <PosterGrid v-else :items="catItems" :cols="2" wide @select="open" />
          </div>

          <template v-else-if="floors.length">
            <FloorBlock
              v-for="floor in floors"
              :key="floor.id"
              :title="floor.title"
              :sub="floor.sub"
              :categories="floor.categories"
              :tags="floor.tags"
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchBannerList } from '@/api/banner'
import { fetchKingkongList } from '@/api/kingkong'
import { fetchVideoCategories, fetchVideoList, fetchVideoModules, type VideoItem, type VideoModule } from '@/api/video'
import AdBanner from '@/components/AdBanner.vue'
import DouyinHome from '@/components/douyin/DouyinHome.vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import FloorBlock from '@/components/home/FloorBlock.vue'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import { goKingkong, takeVideoChannel } from '@/utils/kingkongJump'
import PosterCard from '@/components/home/PosterCard.vue'
import PosterGrid from '@/components/home/PosterGrid.vue'
import PosterRail from '@/components/home/PosterRail.vue'
import { useTabSlide } from '@/composables/useTabSlide'
import type { CoverItem } from '@/data/mock'
import { formatDuration, isRecent } from '@/utils/format'
import { videoPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'
import { searchHint as videoSearchHint, searchPath } from '@/utils/searchScope'
import { moduleChips, moduleMorePath } from '@/utils/moduleFilter'
import { openPromoLink } from '@/utils/promoLink'

defineOptions({ name: 'Video' })

const router = useRouter()
const channels = ['视频', '抖音']
const channelSlide = useTabSlide(channels, takeVideoChannel() === '抖音' ? '抖音' : undefined)
const channel = computed(() => channelSlide.current.value)
const isDouyin = computed(() => channel.value === '抖音')
const innerName = ref('tab-left')

type SubCat = { name: string; kind: number }
const catsByChannel = ref<Record<string, SubCat[]>>({
  视频: [],
  抖音: [],
})
const subTab = ref('')
const subTabs = computed(() => (catsByChannel.value[channel.value] || []).map((c) => c.name))
const catItems = ref<CoverItem[]>([])
const catLoading = ref(false)

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
  subTab.value = ''
  catItems.value = []
}

const selectSub = (name: string) => {
  if (subTab.value === name) {
    subTab.value = ''
    catItems.value = []
    return
  }
  subTab.value = name
  loadCatItems()
}

type FloorLayout = 'rail' | 'wide-rail' | 'grid-2' | 'grid-3' | 'wide-grid' | 'hero-mix' | 'one-wide'
type FloorBlockItem = {
  id: number
  title: string
  sub: string
  categories: string[]
  tags: string[]
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

const loadCatItems = async () => {
  const name = subTab.value
  if (!name) {
    catItems.value = []
    return
  }
  const cat = (catsByChannel.value[channel.value] || []).find((c) => c.name === name)
  catLoading.value = true
  try {
    let sort = 1
    let cate = ''
    if (cat?.kind === 2 || cat?.kind === 3) sort = 0
    else if (cat?.kind !== 1) {
      cate = name
    }
    const data = await fetchVideoList(1, 36, '', sort, cate)
    catItems.value = (data.list || []).map((v) => toCover(v))
  } catch (err) {
    toastError(err)
    catItems.value = []
  } finally {
    catLoading.value = false
  }
}

const banners = ref<CoverItem[]>([])
const loadBanners = async () => {
  if (isDouyin.value) {
    banners.value = []
    return
  }
  try {
    const data = await fetchBannerList('video')
    banners.value = (data.list || []).map((b, i) => ({
      id: `banner-${b.id}`,
      title: b.title || '',
      cover: mediaUrl(b.cover_url),
      href: b.link,
      tone: i % 6,
    }))
  } catch {
    banners.value = []
  }
}
const openBanner = (item: CoverItem) => openPromoLink(router, item.href)

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

const moduleMore = (mod: VideoModule) => moduleMorePath('video', mod)

type QuickItem = {
  key: string
  label: string
  icon: string
  open_mode: string
  link: string
  position: string
}

const quicks = ref<QuickItem[]>([])

const loadQuicks = async () => {
  if (isDouyin.value) {
    quicks.value = []
    return
  }
  try {
    const data = await fetchKingkongList('movie')
    quicks.value = (data.list || []).map((r) => ({
      key: `kk-${r.id}`,
      label: r.name,
      icon: r.icon_url,
      open_mode: r.open_mode,
      link: r.link,
      position: r.position,
    }))
  } catch {
    quicks.value = []
  }
}

const searchHint = computed(() => videoSearchHint(isDouyin.value ? 'douyin' : 'video'))

const go = (path: string) => router.push(path)
const open = (item: CoverItem) => {
  router.push(videoPath(item.id))
}

const onQuick = (item: QuickItem) => {
  goKingkong(router, item)
}

const loadSubCats = async () => {
  const toCats = (list?: { name: string; kind: number }[]) =>
    (list || []).filter((x) => x.name).map((x) => ({ name: x.name, kind: x.kind || 0 }))
  try {
    const video = await fetchVideoCategories()
    catsByChannel.value.视频 = toCats(video.list)
  } catch {
    catsByChannel.value.视频 = []
  }
}

const loadFloors = async () => {
  if (isDouyin.value) return
  try {
    const mods = (await fetchVideoModules('video_home')).list || []
    floors.value = mods.map((mod) => {
      const mark = moduleMark(mod.icon)
      const chips = moduleChips(mod)
      return {
        id: mod.id,
        title: mod.name,
        sub: moduleSub(mod.icon),
        categories: chips.categories,
        tags: chips.tags,
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

watch(channel, () => {
  loadFloors()
  loadQuicks()
  loadBanners()
})

onMounted(() => {
  loadSubCats()
  loadFloors()
  loadQuicks()
  loadBanners()
})
</script>

<style scoped lang="scss">
.video-page.is-douyin {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #050506;
}

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

.cat-pane {
  padding: 10px 0 20px;
  min-height: 50vh;
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
