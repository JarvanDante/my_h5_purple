<template>
  <div class="page-shell">
    <header class="head">
      <h1>星球</h1>
      <div class="tabs">
        <button
          v-for="item in tabs"
          :key="item"
          type="button"
          :class="{ active: tab === item }"
          @click="select(item)"
        >
          {{ item }}
        </button>
      </div>
    </header>
    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab">
          <article v-for="post in posts" :key="post.id" class="post" @click="goPost">
            <div class="avatar" :class="`tone-${post.tone}`" />
            <div class="main">
              <h3>{{ post.user }}</h3>
              <p>{{ post.text }}</p>
              <div class="pic" :class="`tone-${post.tone}`" />
              <div class="bar">
                <span>♡ {{ post.likes }}</span>
                <span>💬 {{ post.comments }}</span>
              </div>
            </div>
          </article>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { showToast } from 'vant'
import { useTabSlide } from '@/composables/useTabSlide'
import { posts } from '@/data/mock'

defineOptions({ name: 'Planet' })

const tabs = ['广场', '关注', '最新']
const slide = useTabSlide(tabs)
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const select = (item: string) => slide.select(item)

const goPost = () => {
  showToast('帖子详情稍后接入')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
}

.head {
  background: $primary-color;
  color: #fff;
  padding: 10px 12px 0;

  h1 {
    font-size: 20px;
  }
}

.tabs {
  display: flex;
  gap: 18px;
  margin-top: 8px;

  button {
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    height: 38px;
    position: relative;

    &.active {
      color: #fff;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background: #fff;
      }
    }
  }
}

.post {
  display: flex;
  gap: 10px;
  padding: 14px 12px;
  background: #fff;
  border-bottom: 8px solid #f6f6f6;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.main {
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 14px;
  }

  p {
    margin: 6px 0 8px;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
  }
}

.pic {
  height: 140px;
  border-radius: 8px;
}

.bar {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}

.tone-0 { background: linear-gradient(160deg, #ffd0e0, #ff4d88); }
.tone-1 { background: linear-gradient(160deg, #e4d4ff, #7b5be0); }
.tone-2 { background: linear-gradient(160deg, #ffc2d4, #e85a9a); }
.tone-3 { background: linear-gradient(160deg, #ffe0f0, #c45b9a); }
.tone-4 { background: linear-gradient(160deg, #ffd9c8, #ff7a9a); }
</style>
