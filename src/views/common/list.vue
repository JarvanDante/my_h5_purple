<template>
  <div class="page-shell sub-page">
    <PageHeader :title="title" />
    <div class="soft-card body">
      <p v-if="loading" class="page-empty">加载中…</p>
      <p v-else-if="!items.length" class="page-empty">{{ emptyText }}</p>
      <MediaGrid v-else :items="items" cols="cols-2" :wide="media === 'video'" @select="open" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { fetchComicsList, comicCategories } from '@/api/comics'
import { fetchVideoList, type VideoItem } from '@/api/video'
import { listTitles, type CoverItem } from '@/data/mock'
import { mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const items = ref<CoverItem[]>([])
const loading = ref(true)

const media = computed(() => (String(route.query.media || '') === 'video' ? 'video' : 'comic'))
const type = computed(() => String(route.query.type || ''))

const videoTitles: Record<string, string> = {
  topic: '专题',
  hot: '热门视频',
  daily: '日更限定',
  rank: '视频排行',
  category: '分类',
}

const title = computed(() => {
  if (media.value === 'video') {
    return videoTitles[type.value] || '相关视频'
  }
  return listTitles[type.value] || '列表'
})

const emptyText = computed(() =>
  media.value === 'video' ? '暂无相关视频' : '暂无相关漫画',
)

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

const videoSort = () => 1

const open = (item: CoverItem) => {
  if (media.value === 'video') {
    router.push(`/video/${item.id}`)
    return
  }
  router.push(`/comic/${item.id}`)
}

const load = () => {
  loading.value = true
  const task =
    media.value === 'video'
      ? fetchVideoList(1, 40, '', videoSort()).then((data) => {
          items.value = (data.list || []).map(toVideoCover)
        })
      : (() => {
          let sort = 2
          let recommend = 0
          if (type.value === 'rank' || type.value === 'hot') sort = 1
          else if (type.value === 'recommend') {
            sort = 0
            recommend = 1
          }
          return fetchComicsList(1, 40, '', '', sort, recommend).then((data) => {
            items.value = (data.list || []).map((c) => ({
              id: String(c.id),
              title: c.title,
              sub: c.author || `${c.chapter_count}话`,
              tag: c.is_vip ? 'VIP' : c.price > 0 ? '金币' : 'Free',
              views: String(c.view_count),
              cover: mediaUrl(c.cover),
              labels: comicCategories(c),
              tone: c.id % 6,
            }))
          })
        })()
  task.catch(toastError).finally(() => {
    loading.value = false
  })
}

watch(() => [media.value, type.value], load, { immediate: true })
</script>

<style scoped lang="scss">
.body {
  min-height: 50vh;
}
</style>
