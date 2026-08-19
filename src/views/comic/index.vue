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

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel + '-' + subTab" class="inner-pane">
          <section v-if="covers[0]" class="hero-banner" @click="open(covers[0])">
            <div class="hero-cover" :class="`tone-${covers[0].tone}`">
              <img v-if="covers[0].cover" :src="covers[0].cover" alt="" />
            </div>
          </section>

          <section class="quick-strip">
            <button v-for="item in quicks.slice(0, 4)" :key="item.label" type="button" class="quick-item" @click="go(item.path)">
              <span class="quick-icon">{{ item.icon }}</span>
              <span class="quick-label">{{ item.label }}</span>
            </button>
          </section>

          <SectionPanel :title="sectionTitle" more @more="go(morePath)">
            <p v-if="!covers.length" class="page-empty">{{ emptyText }}</p>
            <MediaGrid v-else :items="covers" cols="cols-2" @select="open" />
          </SectionPanel>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HomeHeader from '@/components/HomeHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionPanel from '@/components/SectionPanel.vue'
import { fetchComicsCategories, fetchComicsList, comicCategories, type ComicsItem } from '@/api/comics'
import { useTabSlide } from '@/composables/useTabSlide'
import type { CoverItem } from '@/data/mock'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Comic' })

const fallbackTabs = ['新更', '推荐', '漫画榜', '韩漫', '日漫', '同人', '国漫']
const router = useRouter()
const channels = ['漫画', '动漫', '小说', '短剧']
const subTabs = ref([...fallbackTabs])
const cateKind = ref<Record<string, number>>({})
const channelSlide = useTabSlide(channels)
const subSlide = useTabSlide(subTabs.value, fallbackTabs[0])
const channel = computed(() => channelSlide.current.value)
const subTab = computed(() => subSlide.current.value)
const innerName = ref('tab-left')

const selectChannel = (item: string) => {
  channelSlide.select(item)
  innerName.value = channelSlide.name.value
}

const selectSub = (item: string) => {
  subSlide.select(item)
  innerName.value = subSlide.name.value
}

const quicks = [
  { icon: '📍', label: '专题', path: '/list?media=comic&type=topic' },
  { icon: '🔥', label: '热门', path: '/list?media=comic&type=hot' },
  { icon: '📅', label: '每日', path: '/list?media=comic&type=daily' },
  { icon: '🏆', label: '榜单', path: '/list?media=comic&type=rank' },
  { icon: '📚', label: '分类', path: '/list?media=comic&type=category' },
]

const list = ref<ComicsItem[]>([])
const covers = computed<CoverItem[]>(() =>
  list.value.map((c) => ({
    id: String(c.id),
    title: c.title,
    sub: c.author || `${c.chapter_count}话`,
    tag: c.is_vip ? 'VIP' : c.price > 0 ? '金币' : 'Free',
    views: String(c.view_count),
    cover: mediaUrl(c.cover),
    labels: comicCategories(c),
    tone: c.id % 6,
  })),
)

const go = (path: string) => {
  router.push(path)
}

const open = (item: CoverItem) => {
  router.push(`/comic/${item.id}`)
}

const currentKind = computed(() => cateKind.value[subTab.value])

const sectionTitle = computed(() => {
  const kind = currentKind.value
  if (kind === 2 || subTab.value === '推荐') return '精选推荐'
  if (kind === 3 || subTab.value === '漫画榜') return '漫画榜'
  if (kind === 0) return subTab.value || '今日上新'
  return '今日上新'
})

const emptyText = computed(() => {
  const kind = currentKind.value
  if (kind === 2 || subTab.value === '推荐') return '暂无推荐，子后台勾选「H5 推荐」后显示'
  if (kind === 3 || subTab.value === '漫画榜') return '暂无榜单，有观看数据后显示'
  if (kind === 0) return `暂无「${subTab.value}」漫画，上架并选择该分类后显示`
  return '暂无漫画，子后台「漫画管理」上架后显示'
})

const morePath = computed(() => {
  const kind = currentKind.value
  if (kind === 3 || subTab.value === '漫画榜') return '/list?media=comic&type=rank'
  if (kind === 2 || subTab.value === '推荐') return '/list?media=comic&type=recommend'
  return '/list?media=comic&type=daily'
})

const loadList = () => {
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
      list.value = data.list || []
    })
    .catch(toastError)
}

onMounted(() => {
  fetchComicsCategories()
    .then((data) => {
      const rows = data.list || []
      if (!rows.length) return
      const names = rows.map((r) => r.name)
      const kinds: Record<string, number> = {}
      rows.forEach((r) => {
        kinds[r.name] = r.kind
      })
      cateKind.value = kinds
      subTabs.value = names
      if (!names.includes(subTab.value)) {
        subSlide.select(names[0])
      }
    })
    .catch(() => undefined)
    .finally(loadList)
})

watch(subTab, loadList)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
}

.hero-cover {
  height: 148px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

@include media-tones;
</style>
