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
          @click="channel = item"
        >
          {{ item }}
        </button>
        <button type="button" class="checkin-btn" @click="soon('签到')">
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
          @click="subTab = item"
        >
          {{ item }}
        </button>
      </div>

      <div class="search-row">
        <div class="search-box" @click="soon('搜索')">
          <span class="search-icon">⌕</span>
          <span>搜索更多{{ channel }}</span>
        </div>
        <button type="button" class="side-action vip" @click="soon('VIP')">
          <span>VIP</span>
          充值
        </button>
        <button type="button" class="side-action fav" @click="soon('收藏')">
          <span>★</span>
          收藏
        </button>
      </div>
    </header>

    <section class="banner-row">
      <div v-for="n in 4" :key="n" class="banner-card">
        <div class="banner-cover" />
        <p class="ellipsis">精选推荐 {{ n }}</p>
        <span class="ad-tag">广告</span>
      </div>
    </section>

    <section class="quick-row">
      <button v-for="item in quicks" :key="item.label" type="button" class="quick-item" @click="soon(item.label)">
        <span class="quick-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </section>

    <section class="block">
      <div class="block-head">
        <h3>今日上新：新作品已经准时送达</h3>
        <button type="button" @click="soon('更多')">更多 ›</button>
      </div>
      <div class="cover-grid">
        <article v-for="n in 6" :key="n" class="cover-card" @click="soon('作品详情')">
          <div class="cover-thumb">
            <span class="free-tag">Free</span>
          </div>
          <p class="ellipsis">占位作品 {{ n }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'

defineOptions({ name: 'Comic' })

const channels = ['漫画', '动漫', '小说', '短剧']
const subTabs = ['新更', '推荐', '漫画榜', '韩漫', '日漫', '同人', '国漫']
const quicks = [
  { icon: '📍', label: '专题' },
  { icon: '🔥', label: '热门' },
  { icon: '📅', label: '每日' },
  { icon: '🏆', label: '榜单' },
  { icon: '📚', label: '分类' },
]

const channel = ref('漫画')
const subTab = ref('新更')

const soon = (name: string) => {
  showToast(`${name} 即将接入`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

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

.banner-cover,
.cover-thumb {
  background: linear-gradient(160deg, #d9c7ee 0%, #8a6bb3 100%);
  border-radius: 6px;
}

.banner-cover {
  height: 92px;
}

.banner-card p,
.cover-card p {
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

.cover-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 8px;
}

.cover-thumb {
  position: relative;
  height: 132px;
}

.free-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: #3b82f6;
  color: #fff;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
}
</style>
