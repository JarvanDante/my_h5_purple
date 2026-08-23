<template>
  <div class="page-shell sub-page search-page">
    <header class="search-head">
      <button type="button" class="back" aria-label="返回" @click="back">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="head-tabs">
        <button type="button" class="head-tab" :class="{ active: pane === 'search' }" @click="pane = 'search'">
          搜一搜
        </button>
        <button type="button" class="head-tab" :class="{ active: pane === 'library' }" @click="openLibrary">
          {{ scopeName }}库
        </button>
      </div>
    </header>

    <div class="search-bar">
      <span class="bar-ico"><LineIcon name="search" /></span>
      <input
        ref="inputEl"
        v-model="keyword"
        type="search"
        :placeholder="placeholder"
        enterkeyhint="search"
        @keyup.enter="doSearch()"
      />
      <button type="button" class="bar-btn" @click="doSearch()">搜索</button>
    </div>

    <template v-if="pane === 'search' && !searched">
      <section v-if="history.length" class="block">
        <div class="block-head">
          <h3>历史搜索</h3>
          <button type="button" class="clear-btn" @click="clearHistory">
            <LineIcon name="trash" />
            清除全部记录
          </button>
        </div>
        <div class="pills">
          <button v-for="word in history" :key="word" type="button" @click="doSearch(word)">
            {{ word }}
          </button>
        </div>
      </section>

      <section class="block hot-block">
        <div class="block-head">
          <h3 class="hot-title">热门搜索</h3>
        </div>
        <div class="rank-grid">
          <button
            v-for="(word, idx) in hotTags"
            :key="`${idx}-${word}`"
            type="button"
            class="rank-item"
            @click="doSearch(word)"
          >
            <span v-if="idx < 3" class="crown" :class="`crown-${idx + 1}`" aria-hidden="true">
              <svg viewBox="0 0 28 22">
                <path d="M3.2 9.2 8 11.2 14 3.2 20 11.2 24.8 9.2 22.4 19.4H5.6Z" />
              </svg>
              <b>{{ idx + 1 }}</b>
            </span>
            <i v-else class="rank-no">{{ idx + 1 }}</i>
            <span>{{ word }}</span>
          </button>
        </div>
      </section>
    </template>

    <section v-else-if="pane === 'search'" class="result-block">
      <p v-if="loading" class="page-empty">搜索中…</p>
      <p v-else-if="!results.length" class="page-empty">{{ emptyText }}</p>
      <MediaGrid
        v-else
        :items="results"
        :cols="gridCols"
        :wide="scope === 'video' || scope === 'short'"
        :poster="scope === 'cartoon'"
        @select="open"
      />
    </section>

    <section v-else class="result-block">
      <p v-if="!ready" class="page-empty">{{ `${scopeName}即将上线` }}</p>
      <p v-else-if="loading" class="page-empty">加载中…</p>
      <p v-else-if="!library.length" class="page-empty">{{ emptyText }}</p>
      <MediaGrid
        v-else
        :items="library"
        :cols="gridCols"
        :wide="scope === 'video' || scope === 'short'"
        :poster="scope === 'cartoon'"
        @select="open"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog } from 'vant'
import LineIcon from '@/components/LineIcon.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { fetchCartoonList, cartoonCategories, type CartoonItem } from '@/api/cartoon'
import { fetchComicsList, comicCategories, type ComicsItem } from '@/api/comics'
import { fetchHotSearch } from '@/api/ranks'
import { fetchVideoList, type VideoItem } from '@/api/video'
import { hotWords, type CoverItem } from '@/data/mock'
import { comicPath, videoPath } from '@/utils/idcrypt'
import { formatDuration, formatViews } from '@/utils/format'
import { mediaUrl, toastError } from '@/utils/request'
import { clearSearchHistory, listSearchHistory, pushSearchHistory } from '@/utils/searchHistory'
import { parseScope, searchHint, scopeLabel, type SearchScope } from '@/utils/searchScope'

const FALLBACK_TAGS: Record<SearchScope, string[]> = {
  comic: ['韩漫', '日漫', '校园', '恋爱', '完结', '都市', '玄幻', '热血', '后宫', '穿越'],
  cartoon: ['热血', '异世界', '校园', '恋爱', '奇幻', '日常', '战斗', '搞笑', '冒险', '完结'],
  novel: ['都市', '玄幻', '言情', '穿越', '重生', '校园', '修真', '脑洞', '完结', '短篇'],
  short: ['短剧', '甜宠', '逆袭', '复仇', '豪门', '穿越', '重生', '都市', '古装', '完结'],
  video: ['电影', '短剧', '综艺', '热播', '最新', '推荐', '动作', '爱情', '喜剧', '悬疑'],
  planet: ['推荐', '日常', '活动', '求推荐', '完结', '韩漫', '日漫', '同人', '吐槽', '安利'],
  ai: ['绘画', '换脸', '对话', '小说', '封面', '分镜', '角色', '上色', '风格', '提示词'],
}

const route = useRoute()
const router = useRouter()
const inputEl = ref<HTMLInputElement | null>(null)
const pane = ref<'search' | 'library'>('search')
const keyword = ref('')
const searched = ref(false)
const loading = ref(false)
const results = ref<CoverItem[]>([])
const library = ref<CoverItem[]>([])
const history = ref(listSearchHistory())
const hotTags = ref<string[]>([])

const scope = computed(() => parseScope(route.query.scope))
const scopeName = computed(() => scopeLabel(scope.value))
const placeholder = computed(() => searchHint(scope.value))
const ready = computed(() => ['comic', 'cartoon', 'video', 'short'].includes(scope.value))
const gridCols = computed(() => (scope.value === 'comic' || scope.value === 'novel' ? 'cols-3' : 'cols-2'))
const emptyText = computed(() => {
  if (!ready.value) return `${scopeName.value}搜索即将接入`
  return `暂无相关${scopeName.value}`
})

const back = () => {
  if (window.history.state?.back) {
    router.back()
    return
  }
  router.replace('/comic')
}

const toComicCover = (c: ComicsItem): CoverItem => {
  const cate = comicCategories(c)[0] || ''
  return {
    id: String(c.id),
    title: c.title,
    tag: c.is_vip ? 'VIP' : 'Free',
    cover: mediaUrl(c.cover),
    views: formatViews(c.view_count),
    badge: `共${c.chapter_count || 0}话${cate ? `·${cate}` : ''}`,
    tone: c.id % 6,
  }
}

const toCartoonCover = (c: CartoonItem): CoverItem => ({
  id: String(c.id),
  title: c.title,
  duration: formatDuration(c.duration),
  tag: 'Free',
  cover: mediaUrl(c.cover_url),
  badge: (cartoonCategories(c)[0] || '').split(/[,，]/)[0] || undefined,
  tone: c.id % 6,
})

const toVideoCover = (v: VideoItem): CoverItem => ({
  id: String(v.id),
  title: v.title,
  duration: formatDuration(v.duration),
  tag: 'Free',
  cover: mediaUrl(v.cover_url),
  tone: v.id % 6,
})

const fetchByScope = async (word = '') => {
  if (scope.value === 'cartoon') {
    const data = await fetchCartoonList(1, 30, word, '', word ? 0 : 1)
    return (data.list || []).map(toCartoonCover)
  }
  if (scope.value === 'video' || scope.value === 'short') {
    const cate = scope.value === 'short' && !word ? '短剧' : ''
    const data = await fetchVideoList(1, 30, word, word ? 0 : 1, cate)
    return (data.list || []).map(toVideoCover)
  }
  if (scope.value === 'comic') {
    const data = await fetchComicsList(1, 30, word, '', word ? 0 : 2)
    return (data.list || []).map(toComicCover)
  }
  return []
}

const doSearch = async (word?: string) => {
  if (word) keyword.value = word
  const q = keyword.value.trim()
  pane.value = 'search'
  searched.value = true
  if (q) {
    pushSearchHistory(q)
    history.value = listSearchHistory()
  }
  if (!ready.value) {
    results.value = []
    return
  }
  loading.value = true
  try {
    results.value = await fetchByScope(q)
  } catch (err) {
    toastError(err)
    results.value = []
  } finally {
    loading.value = false
  }
}

const openLibrary = async () => {
  pane.value = 'library'
  if (!ready.value) {
    library.value = []
    return
  }
  if (library.value.length) return
  loading.value = true
  try {
    library.value = await fetchByScope('')
  } catch (err) {
    toastError(err)
    library.value = []
  } finally {
    loading.value = false
  }
}

const loadHot = async () => {
  const fallback = FALLBACK_TAGS[scope.value] || hotWords
  try {
    const data = await fetchHotSearch(scope.value)
    const words = (data.list || []).map((x) => x.keyword).filter(Boolean)
    const seen = new Set(words)
    for (const w of fallback) {
      if (words.length >= 10) break
      if (seen.has(w)) continue
      words.push(w)
      seen.add(w)
    }
    hotTags.value = words.slice(0, 10)
    return
  } catch {
    /* use fallback */
  }
  hotTags.value = fallback.slice(0, 10)
}

const clearHistory = () => {
  showConfirmDialog({ title: '清除记录', message: '确定清除全部搜索记录？' })
    .then(() => {
      clearSearchHistory()
      history.value = []
    })
    .catch(() => undefined)
}

const open = (item: CoverItem) => {
  if (scope.value === 'cartoon' || scope.value === 'video' || scope.value === 'short') {
    router.push(videoPath(item.id))
    return
  }
  router.push(comicPath(item.id))
}

const resetIdle = () => {
  keyword.value = ''
  searched.value = false
  results.value = []
  library.value = []
  pane.value = 'search'
  loadHot()
}

watch(() => route.query.scope, resetIdle)

onMounted(() => {
  loadHot()
  inputEl.value?.focus()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.search-page {
  background: $background-page;
  color: $text-color;
}

.search-head {
  position: sticky;
  top: 0;
  z-index: 20;
  height: calc(42px + var(--app-header-top));
  padding: var(--app-header-top) 8px 0;
  display: flex;
  align-items: center;
  background: $background-page;
  box-shadow: 0 1px 0 rgba(255, 92, 147, 0.35);
}

.back {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: $text-color;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
}

.head-tabs {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-right: 36px;
}

.head-tab {
  position: relative;
  border: 0;
  background: transparent;
  color: $text-color-secondary;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 2px 10px;

  &.active {
    color: $text-color;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 2px;
      width: 22px;
      height: 3px;
      border-radius: 2px;
      background: $primary-color;
      transform: translateX(-50%);
    }
  }
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 12px 4px;
  height: 40px;
  padding: 3px 3px 3px 12px;
  border-radius: $radius-pill;
  background: #16161c;
  border: 1px solid $line;
}

.bar-ico {
  width: 16px;
  height: 16px;
  color: $text-color-secondary;
  display: flex;
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  background: transparent;
  color: $text-color;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: $text-color-muted;
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
}

.bar-btn {
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: $radius-pill;
  background: $primary-color;
  color: $on-accent;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.block {
  padding: 16px 16px 4px;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h3 {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 700;
    color: $text-color;
  }
}

.hot-title {
  &::before {
    content: '';
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: #9b6bff;
  }
}

.hot-block {
  padding-bottom: 16px;
}

.clear-btn {
  border: 0;
  background: transparent;
  color: $text-color-muted;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  :deep(.line-icon) {
    width: 13px;
    height: 13px;
  }
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    border: 0;
    background: #1c1c22;
    color: $text-color-secondary;
    border-radius: $radius-pill;
    padding: 6px 12px;
    font-size: 12px;
  }
}

.rank-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 18px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  height: 38px;
  border: 0;
  background: transparent;
  color: $text-color;
  text-align: left;
  font-size: 14px;

  > span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.crown {
  position: relative;
  width: 22px;
  height: 18px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  b {
    position: relative;
    z-index: 1;
    margin-top: 5px;
    font-size: 9px;
    font-weight: 800;
    line-height: 1;
    color: #1a1208;
  }
}

.crown-1 svg {
  fill: #f5c542;
}

.crown-2 svg {
  fill: #c5d4e0;
}

.crown-3 svg {
  fill: #e8a07a;
}

.rank-no {
  width: 22px;
  flex-shrink: 0;
  color: #d4b46a;
  font-size: 14px;
  font-weight: 700;
  font-style: normal;
  text-align: center;
}

.result-block {
  padding: 12px 12px 24px;
}
</style>
