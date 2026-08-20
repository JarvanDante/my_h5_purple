<template>
  <div class="page-shell sub-page">
    <PageHeader :title="title" />
    <div class="soft-card body">
      <p v-if="loading" class="page-empty">加载中…</p>
      <p v-else-if="!items.length" class="page-empty">{{ emptyText }}</p>
      <MediaGrid
        v-else
        :items="items"
        :cols="media === 'video' || media === 'cartoon' ? 'cols-2' : 'cols-3'"
        :wide="media === 'video' || media === 'cartoon'"
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
import { fetchVideoList, type VideoItem } from '@/api/video'
import { fetchComicsList, comicCategories, type ComicsItem } from '@/api/comics'
import { listTitles, type CoverItem } from '@/data/mock'
import { estimateAdCount, interleaveAds, makeEmptyAds } from '@/utils/interleaveAds'
import { videoPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const items = ref<CoverItem[]>([])
const loading = ref(true)

const media = computed(() => {
  const m = String(route.query.media || '')
  if (m === 'video' || m === 'cartoon') return m
  return 'comic'
})
const type = computed(() => String(route.query.type || ''))
const category = computed(() => String(route.query.category || ''))

const videoTitles: Record<string, string> = {
  topic: '专题',
  hot: '热门视频',
  daily: '日更限定',
  rank: '视频排行',
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
  if (media.value === 'video') {
    return videoTitles[type.value] || '相关视频'
  }
  if (media.value === 'cartoon') {
    return category.value || cartoonTitles[type.value] || '相关动漫'
  }
  if (category.value) return category.value
  return listTitles[type.value] || '列表'
})

const emptyText = computed(() => {
  if (media.value === 'video') return '暂无相关视频'
  if (media.value === 'cartoon') {
    if (category.value) return `暂无「${category.value}」动漫`
    return '暂无相关动漫'
  }
  if (category.value) return `暂无「${category.value}」漫画`
  return '暂无相关漫画'
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

const videoSort = () => 1

const withAds = (list: CoverItem[], cols: number) =>
  interleaveAds(list, makeEmptyAds(estimateAdCount(list.length, cols)), cols)

const open = (item: CoverItem) => {
  if (item.isAd) return
  if (media.value === 'video' || media.value === 'cartoon') {
    router.push(videoPath(item.id))
    return
  }
  router.push(`/comic/${item.id}`)
}

const load = async () => {
  loading.value = true
  try {
    if (media.value === 'video') {
      const data = await fetchVideoList(1, 40, '', videoSort())
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
      const data = await fetchCartoonList(1, 40, '', cate, sort)
      items.value = withAds((data.list || []).map(toCartoonCover), 2)
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
    const data = await fetchComicsList(1, 40, '', cate, sort, recommend)
    items.value = withAds((data.list || []).map(toComicCover), 3)
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

watch(() => [media.value, type.value, category.value], load, { immediate: true })
</script>

<style scoped lang="scss">
.body {
  min-height: 50vh;
}
</style>
