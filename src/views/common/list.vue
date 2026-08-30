<template>
  <div class="page-shell sub-page">
    <PageHeader :title="title" />
    <div class="soft-card body">
      <p v-if="loading" class="page-empty">加载中…</p>
      <p v-else-if="!items.length" class="page-empty">{{ emptyText }}</p>
      <MediaGrid
        v-else
        :items="items"
        :cols="media === 'video' || media === 'cartoon' || media === 'douyin' ? 'cols-2' : 'cols-3'"
        :wide="media === 'video' || media === 'douyin'"
        :poster="media === 'cartoon'"
        @select="open"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { fetchCartoonList, cartoonCategories, type CartoonItem } from '@/api/cartoon'
import { fetchComicsList, comicCategories, type ComicsItem } from '@/api/comics'
import { fetchNovelList, type NovelItem } from '@/api/novel'
import { fetchDouyinList } from '@/api/douyin'
import { fetchVideoList, type VideoItem } from '@/api/video'
import { listTitles, type CoverItem } from '@/data/mock'
import { estimateAdCount, interleaveAds, makeEmptyAds } from '@/utils/interleaveAds'
import { useUserStore } from '@/stores/user'
import { comicPath, videoPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'
import { splitNames } from '@/utils/moduleFilter'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const items = ref<CoverItem[]>([])
const loading = ref(true)

const media = computed(() => {
  const m = String(route.query.media || '')
  if (m === 'video' || m === 'cartoon' || m === 'novel' || m === 'douyin') return m
  return 'comic'
})
const type = computed(() => String(route.query.type || ''))
const categories = computed(() =>
  [...new Set([...splitNames(route.query.categories), ...splitNames(route.query.category)])],
)
const tags = computed(() =>
  [...new Set([...splitNames(route.query.tags), ...splitNames(route.query.tag)])],
)
const category = computed(() => categories.value.join(','))
const tag = computed(() => tags.value.join(','))
const dimTitle = computed(() => [...categories.value, ...tags.value].join(' · '))

const videoTitles: Record<string, string> = {
  topic: '专题',
  hot: '热门视频',
  daily: '日更限定',
  rank: '视频排行',
  recommend: '精选推荐',
  category: '分类',
}
const douyinTitles: Record<string, string> = {
  topic: '专题',
  hot: '热门抖音',
  daily: '最新上架',
  rank: '抖音榜',
  recommend: '精选推荐',
  category: '分类',
}
const cartoonTitles: Record<string, string> = {
  topic: '专题',
  hot: '热门动漫',
  daily: '最新上架',
  rank: '动漫榜',
  recommend: '精选推荐',
  category: '分类',
}

const title = computed(() => {
  if (dimTitle.value) return dimTitle.value
  if (media.value === 'video') return videoTitles[type.value] || '相关视频'
  if (media.value === 'douyin') return douyinTitles[type.value] || '相关抖音'
  if (media.value === 'cartoon') return cartoonTitles[type.value] || '相关动漫'
  if (media.value === 'novel') return '相关小说'
  return listTitles[type.value] || '列表'
})

const emptyText = computed(() => {
  const kind =
    media.value === 'video'
      ? '视频'
      : media.value === 'douyin'
        ? '抖音'
        : media.value === 'cartoon'
          ? '动漫'
          : media.value === 'novel'
            ? '小说'
            : '漫画'
  if (dimTitle.value) return `暂无「${dimTitle.value}」${kind}`
  return `暂无相关${kind}`
})

const pad = (n: number) => String(n).padStart(2, '0')
const formatDuration = (sec: number) => {
  if (!sec) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const toVideoCover = (v: VideoItem): CoverItem => ({
  id: String(v.id),
  title: v.title,
  duration: formatDuration(v.duration),
  tag: 'Free',
  cover: mediaUrl(v.cover_url),
  tone: v.id % 6,
})

const toCartoonCover = (v: CartoonItem): CoverItem => {
  const cate = cartoonCategories(v)[0] || ''
  return {
    id: String(v.id),
    title: v.title,
    duration: formatDuration(v.duration),
    tag: 'Free',
    cover: mediaUrl(v.cover_url),
    badge: cate || undefined,
    tone: v.id % 6,
  }
}

const toNovelCover = (n: NovelItem): CoverItem => {
  const ended = n.update_status === 2
  return {
    id: String(n.id),
    title: n.title,
    tag: n.is_vip ? 'VIP' : 'Free',
    cover: mediaUrl(n.cover),
    badge: ended ? '已完结' : `共${n.chapter_count || 0}章`,
    tone: n.id % 6,
  }
}

const toComicCover = (c: ComicsItem): CoverItem => {
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
}

const withAds = (list: CoverItem[], cols: number) =>
  userStore.isVip ? list : interleaveAds(list, makeEmptyAds(estimateAdCount(list.length, cols)), cols)

const open = (item: CoverItem) => {
  if (item.isAd) return
  if (media.value === 'video' || media.value === 'cartoon' || media.value === 'douyin') {
    router.push(videoPath(item.id))
    return
  }
  router.push(comicPath(item.id))
}

const load = async () => {
  loading.value = true
  try {
    if (media.value === 'video' || media.value === 'douyin') {
      let sort = 1
      let cate = ''
      if (type.value === 'recommend' || type.value === 'rank' || type.value === 'hot') sort = 0
      else if (type.value === 'category' || category.value) {
        cate = category.value
        sort = 1
      }
      const fetchList = media.value === 'douyin' ? fetchDouyinList : fetchVideoList
      const data = await fetchList(1, 40, '', sort, cate, tag.value)
      items.value = withAds((data.list || []).map(toVideoCover), 2)
      return
    }
    if (media.value === 'cartoon') {
      let sort = 1
      let cate = ''
      if (type.value === 'recommend' || type.value === 'rank' || type.value === 'hot') sort = 0
      else if (type.value === 'category' || category.value) {
        cate = category.value
        sort = 1
      }
      const data = await fetchCartoonList(1, 40, '', cate, sort, tag.value)
      items.value = withAds((data.list || []).map(toCartoonCover), 2)
      return
    }
    if (media.value === 'novel') {
      const data = await fetchNovelList(1, 40, '', category.value, 2)
      items.value = withAds((data.list || []).map(toNovelCover), 3)
      return
    }
    let sort = 2
    let recommend = 0
    let cate = ''
    if (type.value === 'rank' || type.value === 'hot') sort = 1
    else if (type.value === 'recommend') {
      sort = 0
      recommend = 1
    } else if (type.value === 'category' || category.value) {
      cate = category.value
      sort = 2
    }
    const data = await fetchComicsList(1, 40, '', cate, sort, recommend, tag.value)
    items.value = withAds((data.list || []).map(toComicCover), 3)
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

watch(() => [media.value, type.value, category.value, tag.value], load, { immediate: true })
watch(() => userStore.isVip, (vip) => {
  if (vip) items.value = items.value.filter((row) => !row.isAd)
})
</script>

<style scoped lang="scss">
.body {
  min-height: 50vh;
}
</style>
