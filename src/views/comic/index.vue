<template>
  <div class="page-shell comic-page">
    <header class="comic-header">
      <div class="channel-row">
        <button
          v-for="item in channels"
          :key="item"
          type="button"
          class="channel-item"
          :class="{ active: channel === item }"
          @click="selectChannel(item)"
        >
          {{ item }}
        </button>
        <button type="button" class="checkin-btn" @click="go('/checkin')">
          <span class="gift">🎁</span>
          签到
        </button>
      </div>

      <div class="sub-row">
        <button
          v-for="item in subTabs"
          :key="item"
          type="button"
          class="sub-item"
          :class="{ active: subTab === item }"
          @click="selectSub(item)"
        >
          {{ item }}
        </button>
      </div>

      <div class="search-row">
        <div class="search-box" @click="go('/search')">
          <span class="search-icon">⌕</span>
          <span>搜索更多{{ channel }}</span>
        </div>
        <button type="button" class="side-action vip" @click="go('/vip')">
          <span>VIP</span>
          充值
        </button>
        <button type="button" class="side-action fav" @click="go('/favorite')">
          <span>★</span>
          收藏
        </button>
      </div>
    </header>

    <div class="inner-slide">
      <transition :name="innerName">
        <div :key="channel + '-' + subTab" class="inner-pane">
          <section class="banner-row">
            <div v-for="item in comics.slice(0, 4)" :key="item.id" class="banner-card" @click="open(item)">
              <div class="banner-cover" :class="`tone-${item.tone}`" />
              <p class="ellipsis">{{ item.title }}</p>
              <span class="ad-tag">广告</span>
            </div>
          </section>

          <section class="quick-row">
            <button v-for="item in quicks" :key="item.label" type="button" class="quick-item" @click="go(item.path)">
              <span class="quick-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          </section>

          <section class="block">
            <div class="block-head">
              <h3>今日上新：新作品已经准时送达</h3>
              <button type="button" @click="go('/list?type=daily')">更多 ›</button>
            </div>
            <MediaGrid :items="comics" @select="open" />
          </section>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MediaGrid from '@/components/MediaGrid.vue'
import { useTabSlide } from '@/composables/useTabSlide'
import { comics, type CoverItem } from '@/data/mock'

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
  { icon: '📍', label: '专题', path: '/list?type=topic' },
  { icon: '🔥', label: '热门', path: '/list?type=hot' },
  { icon: '📅', label: '每日', path: '/list?type=daily' },
  { icon: '🏆', label: '榜单', path: '/list?type=rank' },
  { icon: '📚', label: '分类', path: '/list?type=category' },
]

const go = (path: string) => {
  router.push(path)
}

const open = (item: CoverItem) => {
  router.push(`/comic/${item.id}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
}

.comic-header {
  background: $primary-color;
  color: #fff;
  padding: 8px 12px 12px;
}

.channel-row,
.sub-row,
.search-row {
  display: flex;
  align-items: center;
}

.channel-row {
  gap: 16px;
}

.channel-item {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 18px;
  font-weight: 600;
  padding: 4px 0;

  &.active {
    color: #fff;
  }
}

.checkin-btn {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.sub-row {
  margin-top: 8px;
  gap: 14px;
  overflow-x: auto;
}

.sub-item {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  padding: 6px 0;
  position: relative;

  &.active {
    color: #fff;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 2px;
      right: 2px;
      bottom: 0;
      height: 2px;
      background: #fff;
      border-radius: 2px;
    }
  }
}

.search-row {
  margin-top: 10px;
  gap: 8px;
}

.search-box {
  flex: 1;
  height: 34px;
  border-radius: 17px;
  background: rgba(0, 0, 0, 0.22);
  color: rgba(255, 255, 255, 0.72);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 13px;
}

.search-icon {
  font-size: 16px;
}

.side-action {
  width: 40px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 10px;
  line-height: 1.15;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;

  span {
    font-size: 12px;
    font-weight: 700;
  }

  &.vip span {
    color: $secondary-color;
  }

  &.fav span {
    color: #ffb14a;
  }
}

.banner-row,
.quick-row,
.block {
  background: #fff;
  padding: 12px;
}

.banner-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.banner-cover {
  height: 92px;
  border-radius: 6px;
}

.tone-0 { background: linear-gradient(160deg, #d9c7ee, #8a6bb3); }
.tone-1 { background: linear-gradient(160deg, #c7d8ee, #6b8ab3); }
.tone-2 { background: linear-gradient(160deg, #eec7d4, #b36b86); }
.tone-3 { background: linear-gradient(160deg, #c7eee0, #6bb39a); }

.banner-card p {
  margin-top: 6px;
  font-size: 11px;
  color: #333;
}

.ad-tag {
  display: inline-block;
  margin-top: 2px;
  font-size: 10px;
  color: #bbb;
}

.quick-row {
  display: flex;
  justify-content: space-between;
  padding-top: 4px;
}

.quick-item {
  border: 0;
  background: transparent;
  width: 56px;
  color: #333;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f3ecfb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  h3 {
    font-size: 13px;
    font-weight: 600;
  }

  button {
    border: 0;
    background: transparent;
    color: #999;
    font-size: 12px;
  }
}

</style>
