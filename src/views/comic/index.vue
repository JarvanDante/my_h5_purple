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

          <SectionPanel title="今日上新" more @more="go('/list?media=comic&type=daily')">
            <p v-if="!covers.length" class="page-empty">暂无漫画，子后台「漫画管理」上架后显示</p>
            <MediaGrid v-else :items="covers" cols="cols-2" @select="open" />
          </SectionPanel>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import HomeHeader from '@/components/HomeHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionPanel from '@/components/SectionPanel.vue'
import { fetchComicsList, type ComicsItem } from '@/api/comics'
import { useTabSlide } from '@/composables/useTabSlide'
import type { CoverItem } from '@/data/mock'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Comic' })

const router = useRouter()
const channels = ['漫画', '动漫', '小说', '短剧']
const subTabs = ['新更', '推荐', '漫画榜', '韩漫', '日漫', '同人', '国漫']
const channelSlide = useTabSlide(channels)
const subSlide = useTabSlide(subTabs)
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
    tone: c.id % 6,
  })),
)

const go = (path: string) => {
  router.push(path)
}

const open = (item: CoverItem) => {
  router.push(`/comic/${item.id}`)
}

onMounted(() => {
  fetchComicsList(1, 21)
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
})
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
