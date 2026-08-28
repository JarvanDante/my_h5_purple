<template>
  <div class="dy-home">
    <nav class="feed-tabs">
      <button
        v-for="tab in feedTabs"
        :key="tab.key"
        type="button"
        class="feed-tab"
        :class="{ on: feedTab === tab.key }"
        @click="selectFeed(tab.key)"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div v-if="feedTab === 'discover'" class="discover">
      <div v-if="chips.length" class="chips">
        <button
          v-for="chip in chips"
          :key="chip.name"
          type="button"
          class="chip"
          :class="{ on: category === chip.name }"
          @click="selectChip(chip.name)"
        >
          {{ chip.name }}
        </button>
      </div>
      <DouyinGrid :items="items" :loading="loading" empty="暂无抖音，请先在子后台抖音管理上架" @select="openOverlay" />
    </div>

    <DouyinFeed
      v-else
      :key="feedTab"
      :items="items"
      :loading="loading"
      :empty="emptyText"
    />

    <DouyinFeed
      v-if="overlay"
      overlay
      :items="items"
      :start="overlayIndex"
      empty="暂无抖音"
      @close="overlay = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import DouyinFeed from '@/components/douyin/DouyinFeed.vue'
import DouyinGrid from '@/components/douyin/DouyinGrid.vue'
import { fetchDouyinCategories, fetchDouyinList, type DouyinCategory, type DouyinItem } from '@/api/douyin'
import { COLLECT_FAV, fetchCollectList, MEDIA_VIDEO } from '@/api/collect'
import { fetchVideoDetail } from '@/api/video'
import { useUserStore } from '@/stores/user'
import { getToken, toastError } from '@/utils/request'

const feedTabs = [
  { key: 'follow', label: '关注' },
  { key: 'discover', label: '发现' },
  { key: 'hot', label: '热门' },
  { key: 'like', label: '喜欢' },
] as const

type FeedKey = (typeof feedTabs)[number]['key']

const userStore = useUserStore()
const feedTab = ref<FeedKey>('hot')
const cats = ref<DouyinCategory[]>([])
const category = ref('')
const items = ref<DouyinItem[]>([])
const loading = ref(false)
const overlay = ref(false)
const overlayIndex = ref(0)

const chips = computed(() => cats.value.filter((c) => c.kind === 0 || c.kind === 2))

const emptyText = computed(() => {
  if (feedTab.value === 'follow') return '关注创作者后，作品会出现在这里'
  if (feedTab.value === 'like') return getToken() ? '还没有喜欢的抖音' : '登录后查看喜欢的作品'
  return '暂无抖音，去子后台「抖音管理」上架'
})

const selectFeed = (key: FeedKey) => {
  feedTab.value = key
  overlay.value = false
}

const selectChip = (name: string) => {
  category.value = category.value === name ? '' : name
}

const openOverlay = (item: DouyinItem) => {
  overlayIndex.value = Math.max(0, items.value.findIndex((x) => x.id === item.id))
  overlay.value = true
}

const loadCats = async () => {
  try {
    cats.value = (await fetchDouyinCategories()).list || []
  } catch {
    cats.value = []
  }
}

const loadList = async () => {
  loading.value = true
  try {
    if (feedTab.value === 'follow') {
      if (!getToken()) {
        items.value = []
        return
      }
      await userStore.ensureLogin().catch(() => undefined)
      const data = await fetchDouyinList(1, 24, '', 0, '', '', 1)
      items.value = data.list || []
      return
    }
    if (feedTab.value === 'like') {
      if (!getToken()) {
        items.value = []
        return
      }
      await userStore.ensureLogin().catch(() => undefined)
      const ids = ((await fetchCollectList(COLLECT_FAV, MEDIA_VIDEO, 1, 30)).list || []).map((x) => x.content_id)
      const rows = await Promise.all(ids.map((id) => fetchVideoDetail(id).catch(() => null)))
      items.value = rows.filter((x): x is DouyinItem => Boolean(x?.id && x.source_url))
      return
    }
    const sort = feedTab.value === 'hot' ? 0 : 1
    const cate = feedTab.value === 'discover' ? category.value : ''
    const data = await fetchDouyinList(1, 24, '', sort, cate)
    items.value = data.list || []
  } catch (err) {
    toastError(err)
    items.value = []
  } finally {
    loading.value = false
  }
}

watch([feedTab, category], loadList)
onMounted(() => {
  loadCats()
  loadList()
})
</script>

<style scoped lang="scss">
.dy-home {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.feed-tabs {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 14px 2px;
}

.feed-tab {
  appearance: none;
  position: relative;
  border: 0;
  background: transparent;
  color: #9a9aa3;
  font-size: 15px;
  line-height: 32px;
  padding: 0;

  &.on {
    color: #fff;
    font-weight: 700;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 2px;
      width: 18px;
      height: 3px;
      transform: translateX(-50%);
      border-radius: 99px;
      background: #ff5c93;
      box-shadow: 0 0 10px rgba(255, 92, 147, 0.7);
    }
  }
}

.discover {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.chips {
  display: flex;
  gap: 16px;
  padding: 4px 14px 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.chip {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #8a8a94;
  font-size: 13px;
  padding: 0;

  &.on {
    color: #fff;
    font-weight: 700;
  }
}
</style>
