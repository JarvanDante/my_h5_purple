<template>
  <div class="page-shell comic-page">
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

    <section class="ad-rail-wrap">
      <AdSwipe :items="banners" />
    </section>

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel + '-' + subTab" class="inner-pane">
          <section class="quick-strip">
            <button v-for="item in quicks.slice(0, 4)" :key="item.label" type="button" class="quick-item" @click="go(item.path)">
              <span class="quick-icon">{{ item.emoji }}</span>
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <SectionPanel :title="sectionTitle" more @more="go(morePath)">
            <p v-if="!covers.length" class="page-empty">{{ emptyText }}</p>
            <MediaGrid v-else :items="covers" :cols="isCartoon ? 'cols-2' : 'cols-3'" :wide="isCartoon" @select="open" />
          </SectionPanel>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdSwipe from '@/components/AdSwipe.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionPanel from '@/components/SectionPanel.vue'
import { cartoonCategories, fetchCartoonCategories, fetchCartoonList, type CartoonItem } from '@/api/cartoon'
import { fetchComicsCategories, fetchComicsList, comicCategories, type ComicsItem } from '@/api/comics'
import { useTabSlide } from '@/composables/useTabSlide'
import type { CoverItem } from '@/data/mock'
import { videoPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Comic' })

const comicFallback = ['新更', '推荐', '漫画榜', '韩漫', '日漫', '同人', '国漫']
const cartoonFallback = ['最新', '推荐', '动漫榜', '番剧', '剧场版']
const router = useRouter()
const channels = ['漫画', '动漫', '小说', '短剧']
const subTabs = ref([...comicFallback])
const cateKind = ref<Record<string, number>>({})
const channelSlide = useTabSlide(channels)
const subSlide = useTabSlide(subTabs.value, comicFallback[0])
const channel = computed(() => channelSlide.current.value)
const subTab = computed(() => subSlide.current.value)
const innerName = ref('tab-left')
const isCartoon = computed(() => channel.value === '动漫')
const isComic = computed(() => channel.value === '漫画')

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
}

const selectSub = (item: string) => {
  subSlide.select(item)
  innerName.value = subSlide.name.value
}

const comicQuicks = [
  { emoji: '📍', label: '专题', path: '/list?media=comic&type=topic' },
  { emoji: '🔥', label: '热门', path: '/list?media=comic&type=hot' },
  { emoji: '📅', label: '每日', path: '/list?media=comic&type=daily' },
  { emoji: '🏆', label: '榜单', path: '/list?media=comic&type=rank' },
]
const cartoonQuicks = [
  { emoji: '📍', label: '专题', path: '/list?media=cartoon&type=topic' },
  { emoji: '🔥', label: '热门', path: '/list?media=cartoon&type=hot' },
  { emoji: '📅', label: '每日', path: '/list?media=cartoon&type=daily' },
  { emoji: '🏆', label: '榜单', path: '/list?media=cartoon&type=rank' },
]
const quicks = computed(() => (isCartoon.value ? cartoonQuicks : comicQuicks))

const comicList = ref<ComicsItem[]>([])
const cartoonList = ref<CartoonItem[]>([])
const banners = ref<CoverItem[]>([])

const pad = (n: number) => String(n).padStart(2, '0')
const formatDuration = (sec: number) => {
  if (!sec) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const covers = computed<CoverItem[]>(() => {
  if (isCartoon.value) {
    return cartoonList.value.map((c) => {
      const cate = cartoonCategories(c)[0] || ''
      return {
        id: String(c.id),
        title: c.title,
        tag: 'Free',
        cover: mediaUrl(c.cover_url),
        duration: formatDuration(c.duration),
        badge: cate || undefined,
        tone: c.id % 6,
      }
    })
  }
  return comicList.value.map((c) => {
    const cate = comicCategories(c)[0] || ''
    return {
      id: String(c.id),
      title: c.title,
      tag: c.is_vip ? 'VIP' : 'Free',
      cover: mediaUrl(c.cover),
      badge: `共${c.chapter_count || 0}话${cate ? `·${cate}` : ''}`,
      mosaic: true,
      tone: c.id % 6,
    }
  })
})

watch(covers, (rows) => {
  banners.value = rows.slice(0, 6)
})

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

const currentKind = computed(() => cateKind.value[subTab.value])

const sectionTitle = computed(() => {
  const kind = currentKind.value
  if (isCartoon.value) {
    if (kind === 2 || subTab.value === '推荐') return '精选推荐'
    if (kind === 3 || subTab.value === '动漫榜') return '动漫榜'
    if (kind === 0) return subTab.value || '今日上新'
    return '今日上新'
  }
  if (kind === 2 || subTab.value === '推荐') return '精选推荐'
  if (kind === 3 || subTab.value === '漫画榜') return '漫画榜'
  if (kind === 0) return subTab.value || '今日上新'
  return '今日上新'
})

const emptyText = computed(() => {
  if (!isComic.value && !isCartoon.value) return `${channel.value}即将上线`
  const noun = isCartoon.value ? '动漫' : '漫画'
  const kind = currentKind.value
  if (kind === 2 || subTab.value === '推荐') return `暂无推荐${noun}`
  if (kind === 3 || subTab.value.includes('榜')) return `暂无${noun}榜`
  if (kind === 0) return `暂无「${subTab.value}」${noun}，上架并选择该分类后显示`
  return `暂无${noun}，子后台「${noun}管理」上架后显示`
})

const morePath = computed(() => {
  const kind = currentKind.value
  const name = subTab.value
  const media = isCartoon.value ? 'cartoon' : 'comic'
  if (kind === 3 || name.includes('榜')) return `/list?media=${media}&type=rank`
  if (kind === 2 || name === '推荐') return `/list?media=${media}&type=recommend`
  if (kind === 1 || name === '新更' || name === '最新') return `/list?media=${media}&type=daily`
  return `/list?media=${media}&type=category&category=${encodeURIComponent(name)}`
})

const applyCategories = (rows: { name: string; kind: number }[], fallback: string[]) => {
  const names = rows.length ? rows.map((r) => r.name) : fallback
  const kinds: Record<string, number> = {}
  rows.forEach((r) => {
    kinds[r.name] = r.kind
  })
  cateKind.value = kinds
  subTabs.value = names
  if (names.length && !names.includes(subTab.value)) {
    subSlide.select(names[0])
  }
}

const loadComicList = () => {
  const kind = cateKind.value[subTab.value]
  let category = ''
  let sort = 2
  let recommend = 0
  if (kind === 1) {
    sort = 2
  } else if (kind === 2) {
    sort = 0
    recommend = 1
  } else if (kind === 3) {
    sort = 1
  } else if (kind === 0 || kind === undefined) {
    const name = subTab.value
    if (name === '新更' || name === '最新') sort = 2
    else if (name === '推荐') {
      sort = 0
      recommend = 1
    } else if (name === '漫画榜') sort = 1
    else {
      category = name
      sort = 2
    }
  }
  fetchComicsList(1, 21, '', category, sort, recommend)
    .then((data) => {
      comicList.value = data.list || []
    })
    .catch(toastError)
}

const loadCartoonList = () => {
  const kind = cateKind.value[subTab.value]
  let category = ''
  let sort = 1
  if (kind === 1) {
    sort = 1
  } else if (kind === 2) {
    sort = 0
  } else if (kind === 3) {
    sort = 0
  } else if (kind === 0 || kind === undefined) {
    const name = subTab.value
    if (name === '最新' || name === '新更') sort = 1
    else if (name === '推荐' || name === '动漫榜') sort = 0
    else {
      category = name
      sort = 1
    }
  }
  fetchCartoonList(1, 21, '', category, sort)
    .then((data) => {
      cartoonList.value = data.list || []
    })
    .catch(toastError)
}

const loadList = () => {
  if (isCartoon.value) {
    loadCartoonList()
    return
  }
  if (isComic.value) {
    loadComicList()
    return
  }
  comicList.value = []
  cartoonList.value = []
}

const loadCategories = () => {
  if (isCartoon.value) {
    return fetchCartoonCategories()
      .then((data) => applyCategories(data.list || [], cartoonFallback))
      .catch(() => applyCategories([], cartoonFallback))
      .finally(loadList)
  }
  if (isComic.value) {
    return fetchComicsCategories()
      .then((data) => applyCategories(data.list || [], comicFallback))
      .catch(() => applyCategories([], comicFallback))
      .finally(loadList)
  }
  applyCategories([], [])
  comicList.value = []
  cartoonList.value = []
}

onMounted(loadCategories)
watch(channel, loadCategories)
watch(subTab, loadList)
</script>

<style scoped lang="scss">
.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
}
</style>
