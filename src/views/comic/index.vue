<template>
  <div class="page-shell comic-page">
    <HomeHeader
      dark
      :channels="channels"
      :channel="channel"
      :sub-tabs="subTabs"
      :sub-tab="subTab"
      @select-channel="selectChannel"
      @select-sub="selectSub"
      @checkin="go('/checkin')"
      @search="go(searchPath(channel))"
      @vip="go('/vip')"
    />

    <HomeHero :items="banners" @select="openBanner" />
    <NoticeMarquee />

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel" class="floor-pane">
          <section v-if="ready && quicks.length" class="quick-strip">
            <button
              v-for="item in quicks"
              :key="item.key"
              type="button"
              class="quick-item"
              @click="onQuick(item)"
            >
              <img v-if="item.local" class="quick-icon" :src="item.icon" :alt="item.label" />
              <EncryptedImage v-else class="quick-icon" :src="item.icon" :alt="item.label" />
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <div v-if="subTab && !isComic && !isCartoon && !isNovel" class="cat-pane">
            <p v-if="catLoading" class="page-empty">加载中…</p>
            <p v-else-if="!catItems.length" class="page-empty">暂无「{{ subTab }}」{{ channel }}</p>
            <PosterGrid
              v-else
              :items="catItems"
              :cols="isCartoon ? 2 : 3"
              :wide="isCartoon"
              @select="open"
            />
          </div>

          <template v-else-if="ready">
            <template v-for="(floor, i) in floors" :key="floor.id">
              <FloorBlock
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
              <AdBanner v-if="i < floors.length - 1" :index="i + 1" />
            </template>
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
import AdBanner from '@/components/AdBanner.vue'
import FloorBlock from '@/components/home/FloorBlock.vue'
import HomeHero from '@/components/home/HomeHero.vue'
import NoticeMarquee from '@/components/home/NoticeMarquee.vue'
import PosterCard from '@/components/home/PosterCard.vue'
import PosterGrid from '@/components/home/PosterGrid.vue'
import PosterRail from '@/components/home/PosterRail.vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import { quickArtSrc } from '@/assets/theme'
import { fetchCartoonCategories, fetchCartoonModules, type CartoonItem } from '@/api/cartoon'
import { fetchComicsCategories, fetchComicsList, fetchComicsModules, type ComicsItem } from '@/api/comics'
import { fetchBannerList } from '@/api/banner'
import { fetchKingkongList } from '@/api/kingkong'
import { fetchNovelCategories, fetchNovelList, fetchNovelModules, type NovelItem } from '@/api/novel'
import { fetchVideoCategories } from '@/api/video'
import { goKingkong, positionOfChannel } from '@/utils/kingkongJump'
import { openPromoLink } from '@/utils/promoLink'
import { useTabSlide } from '@/composables/useTabSlide'
import type { CoverItem } from '@/data/mock'
import { coverItemPath, novelPath, videoPath } from '@/utils/idcrypt'
import { searchPath } from '@/utils/searchScope'
import { formatDuration, formatViews, isRecent } from '@/utils/format'
import { mediaUrl, toastError } from '@/utils/request'
import { moduleChips, moduleMorePath } from '@/utils/moduleFilter'

defineOptions({ name: 'Comic' })

const router = useRouter()
const channels = ['漫画', '动漫', '小说']
const channelSlide = useTabSlide(channels)
const channel = computed(() => channelSlide.current.value)
const innerName = ref('tab-left')
const isCartoon = computed(() => channel.value === '动漫')
const isComic = computed(() => channel.value === '漫画')
const isNovel = computed(() => channel.value === '小说')
const ready = computed(() => isComic.value || isCartoon.value || isNovel.value)

type SubCat = { id: number; name: string; kind: number; rank?: number }
const catsByChannel = ref<Record<string, SubCat[]>>({
  漫画: [],
  动漫: [],
  小说: [],
  短剧: [],
})
const subTab = ref('')
const subTabs = computed(() => (catsByChannel.value[channel.value] || []).map((c) => c.name))
const catItems = ref<CoverItem[]>([])
const catLoading = ref(false)

const byWeight = (list: SubCat[]) => {
  const rows = [...list]
  if (rows.some((c) => (c.rank || 0) > 0)) {
    rows.sort((a, b) => (b.rank || 0) - (a.rank || 0) || b.id - a.id)
  }
  return rows
}
const firstOf = (list: SubCat[]) => list[0]?.name || ''
const firstComicName = () => firstOf(catsByChannel.value.漫画)
const firstCartoonName = () => firstOf(catsByChannel.value.动漫)

const ensureSubTab = (forceFirst = false) => {
  const names = (catsByChannel.value[channel.value] || []).map((c) => c.name)
  if (!names.length) return
  if (forceFirst || !names.includes(subTab.value)) subTab.value = names[0]
}

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
  catItems.value = []
  if (item === '小说') ensureSubTab(true)
  else if (item === '漫画' || item === '动漫') ensureSubTab()
  else subTab.value = ''
}

const selectSub = (name: string) => {
  if (subTab.value === name) {
    if (isComic.value || isCartoon.value || isNovel.value) return
    subTab.value = ''
    catItems.value = []
    return
  }
  subTab.value = name
  if (isComic.value) {
    loadComicFloors()
    return
  }
  if (isCartoon.value) {
    loadCartoonFloors()
    return
  }
  if (isNovel.value) {
    loadNovelFloors()
    return
  }
  loadCatItems()
}

const loadSubCats = async () => {
  const toCats = (list?: { id?: number; name: string; kind: number; rank?: number }[]) =>
    (list || [])
      .filter((x) => x.name)
      .map((x) => ({ id: x.id || 0, name: x.name, kind: x.kind || 0, rank: x.rank || 0 }))
  const [comics, cartoon, novel, video] = await Promise.allSettled([
    fetchComicsCategories(),
    fetchCartoonCategories(),
    fetchNovelCategories(),
    fetchVideoCategories(),
  ])
  if (comics.status === 'fulfilled') catsByChannel.value.漫画 = toCats(comics.value.list)
  if (cartoon.status === 'fulfilled') catsByChannel.value.动漫 = toCats(cartoon.value.list)
  if (novel.status === 'fulfilled') catsByChannel.value.小说 = byWeight(toCats(novel.value.list))
  if (video.status === 'fulfilled') catsByChannel.value.短剧 = toCats(video.value.list)
  if (isNovel.value) ensureSubTab(true)
  else if (isComic.value && !subTab.value) subTab.value = firstComicName()
  else if (isCartoon.value && !subTab.value) subTab.value = firstCartoonName()
}

type QuickItem = {
  key: string
  icon: string
  label: string
  open_mode: string
  link: string
  position: string
  local?: boolean
}

const quicks = ref<QuickItem[]>([])

const loadQuicks = async () => {
  if (!ready.value) {
    quicks.value = []
    return
  }
  try {
    const data = await fetchKingkongList(positionOfChannel(channel.value))
    quicks.value = (data.list || []).map((r, i) => {
      const art = quickArtSrc(r.name, i)
      return {
        key: `kk-${r.id}`,
        icon: art || r.icon_url,
        label: r.name,
        open_mode: r.open_mode,
        link: r.link,
        position: r.position,
        local: Boolean(art),
      }
    })
  } catch {
    quicks.value = []
  }
}

const onQuick = (item: QuickItem) => {
  goKingkong(router, item)
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
let floorSeq = 0

const toComicCover = (c: ComicsItem, mark?: CoverItem['mark']): CoverItem => {
  const ended = c.update_status === 2
  return {
    id: String(c.id),
    kind: 'comic',
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
  kind: 'cartoon',
  title: c.title,
  cover: mediaUrl(c.cover_url),
  duration: formatDuration(c.duration),
  badge: (c.categories?.[0] || c.category || '').split(/[,，]/)[0] || undefined,
  statusTone: 'chapter',
  mark: mark || (isRecent(c.created_at) ? 'new' : undefined),
  tone: c.id % 6,
})

const toNovelCover = (n: NovelItem, mark?: CoverItem['mark']): CoverItem => {
  const ended = n.update_status === 2
  return {
    id: String(n.id),
    kind: 'novel',
    href: novelPath(n.id),
    title: n.title,
    cover: mediaUrl(n.cover),
    views: formatViews(n.view_count),
    badge: ended ? '已完结' : `共${n.chapter_count || 0}章`,
    statusTone: ended ? 'end' : 'chapter',
    mark: mark || (isRecent(n.created_at) ? 'new' : n.view_count >= 1000 ? 'hot' : undefined),
    tone: n.id % 6,
  }
}

const loadCatItems = async () => {
  const name = subTab.value
  if (!name) {
    catItems.value = []
    return
  }
  const cat = (catsByChannel.value[channel.value] || []).find((c) => c.name === name)
  catLoading.value = true
  try {
    if (isComic.value) {
      let sort = 2
      let recommend = 0
      let cate = ''
      if (cat?.kind === 3) sort = 1
      else if (cat?.kind === 2) {
        sort = 0
        recommend = 1
      } else if (cat?.kind !== 1) {
        cate = name
      }
      const data = await fetchComicsList(1, 36, '', cate, sort, recommend)
      catItems.value = (data.list || []).map((c) => toComicCover(c))
      return
    }
    const cate = !cat || cat.kind === 0 ? name : ''
    const sort = cat?.kind === 3 ? 1 : 2
    const data = await fetchNovelList(1, 36, '', cate, sort)
    catItems.value = (data.list || []).map(toNovelCover)
  } catch (err) {
    toastError(err)
    catItems.value = []
  } finally {
    catLoading.value = false
  }
}

const bannerPos = computed(() => {
  if (channel.value === '动漫') return 'cartoon'
  if (channel.value === '小说') return 'novel'
  return 'comics'
})
const banners = ref<CoverItem[]>([])
const loadBanners = async () => {
  try {
    const data = await fetchBannerList(bannerPos.value)
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

const emptyText = computed(() => {
  if (!ready.value) return `${channel.value}即将上线`
  if (isCartoon.value && !floors.value.length) {
    return subTab.value
      ? `暂无「${subTab.value}」模块，请在子后台「动漫模块」把位置选成该分类`
      : '暂无模块，请在子后台「动漫模块」配置'
  }
  if (isNovel.value && !floors.value.length) {
    return subTab.value
      ? `暂无「${subTab.value}」模块，请在子后台「小说模块」把位置选成该分类`
      : '暂无模块，请在子后台「小说模块」配置'
  }
  if (!floors.value.length) {
    return subTab.value
      ? `暂无「${subTab.value}」模块，请在子后台「漫画模块」把位置选成该分类`
      : '暂无模块，请在子后台「漫画模块」配置'
  }
  return '暂无漫画，子后台「漫画管理」上架后显示'
})

const go = (path: string) => {
  router.push(path)
}

const open = (item: CoverItem) => {
  if (isNovel.value || item.kind === 'novel') {
    router.push(novelPath(item.id))
    return
  }
  if (isCartoon.value || item.kind === 'cartoon') {
    router.push(videoPath(item.id))
    return
  }
  router.push(coverItemPath(item))
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

const moduleMore = (media: 'comic' | 'cartoon' | 'novel', mod: { tags?: string[]; categories?: string[] }) =>
  moduleMorePath(media, mod)

const loadComicFloors = async () => {
  const seq = floorSeq
  try {
    const cat = (catsByChannel.value.漫画 || []).find((c) => c.name === subTab.value)
    if (!cat?.id) {
      if (seq === floorSeq) floors.value = []
      return
    }
    const position = `cat_${cat.id}`
    const mods = (await fetchComicsModules(position)).list || []
    if (seq !== floorSeq) return
    if (!mods.length) {
      floors.value = []
      return
    }
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
        more: moduleMore('comic', mod),
        empty: `暂无「${mod.name}」漫画`,
        items: (mod.items || []).map((c, i) => toComicCover(c, i < 2 ? mark : undefined)),
      }
    })
  } catch (err) {
    toastError(err)
    if (seq === floorSeq) floors.value = []
  }
}

const loadNovelFloors = async () => {
  const seq = floorSeq
  try {
    const cat = (catsByChannel.value.小说 || []).find((c) => c.name === subTab.value)
    if (!cat?.id) {
      if (seq === floorSeq) floors.value = []
      return
    }
    const mods = (await fetchNovelModules(`cat_${cat.id}`)).list || []
    if (seq !== floorSeq) return
    if (!mods.length) {
      floors.value = []
      return
    }
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
        more: moduleMore('novel', mod),
        empty: `暂无「${mod.name}」小说`,
        items: (mod.items || []).map((c, i) => toNovelCover(c, i < 2 ? mark : undefined)),
      }
    })
  } catch (err) {
    toastError(err)
    if (seq === floorSeq) floors.value = []
  }
}

const loadCartoonFloors = async () => {
  const seq = floorSeq
  try {
    const cat = (catsByChannel.value.动漫 || []).find((c) => c.name === subTab.value)
    if (!cat?.id) {
      if (seq === floorSeq) floors.value = []
      return
    }
    const mods = (await fetchCartoonModules(`cat_${cat.id}`)).list || []
    if (seq !== floorSeq) return
    if (!mods.length) {
      floors.value = []
      return
    }
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
        more: moduleMore('cartoon', mod),
        empty: `暂无「${mod.name}」动漫`,
        items: (mod.items || []).map((c, i) => toCartoonCover(c, i < 2 ? mark : undefined)),
      }
    })
  } catch (err) {
    toastError(err)
    if (seq === floorSeq) floors.value = []
  }
}

const loadFloors = () => {
  floorSeq += 1
  floors.value = []
  if (isCartoon.value) {
    loadCartoonFloors()
    return
  }
  if (isComic.value) {
    loadComicFloors()
    return
  }
  if (isNovel.value) {
    loadNovelFloors()
  }
}

onMounted(async () => {
  await loadSubCats()
  loadFloors()
  loadQuicks()
  loadBanners()
})
watch(channel, () => {
  if (isNovel.value) ensureSubTab(true)
  else ensureSubTab()
  loadFloors()
  loadQuicks()
  loadBanners()
})
watch(subTabs, (names) => {
  if (!isNovel.value || !names.length) return
  if (names.includes(subTab.value)) return
  subTab.value = names[0]
  loadFloors()
})
</script>

<style scoped lang="scss">
.comic-page {
  background: transparent;
  color: #fff;
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
  background: transparent;
}

.floor-pane {
  padding: 4px 0 20px;
  min-height: 60vh;
  background: transparent;
}

.cat-pane {
  padding: 10px 0 20px;
  min-height: 50vh;
}

.quick-strip {
  margin: 4px 0 10px;
  height: 88px;
  padding: 0 6px;
  background: transparent;
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
  mix-blend-mode: normal;
}

.quick-label {
  color: #fff;
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
  background-color: #000;
  background-image: radial-gradient(140% 42% at 50% -8%, #97005f 0%, #4c002f 32%, #13000c 58%, #000 80%);
  background-repeat: no-repeat;
}

.comic-page .inner-slide,
.comic-page .floor-pane {
  background: transparent;
}

.comic-page .quick-strip {
  background: transparent;
  box-shadow: none;
}

.comic-page .quick-strip .quick-icon {
  background: transparent;
}

.comic-page .quick-strip .quick-label {
  color: #fff;
  background: transparent;
}
</style>
