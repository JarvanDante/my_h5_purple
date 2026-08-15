<template>
  <div class="page-shell sub-page">
    <PageHeader :title="item.title" />
    <div class="hero" :class="`tone-${item.tone}`" />
    <section class="info">
      <h2>{{ item.title }}</h2>
      <p>{{ item.sub }} · {{ item.views }}阅读</p>
      <div class="tags">
        <span>{{ item.tag }}</span>
        <span>连载</span>
        <span>恋爱</span>
      </div>
      <p class="intro">
        一个关于相遇与告别的故事。城市灯火次第亮起时，主角终于决定打开那扇尘封已久的门。
      </p>
      <button type="button" class="read-btn" @click="start">开始阅读</button>
    </section>
    <section class="chapters">
      <h3>目录</h3>
      <button v-for="n in 12" :key="n" type="button" class="chapter" @click="start">
        第 {{ n }} 话
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { findComic } from '@/data/mock'

const route = useRoute()
const item = computed(() => findComic(String(route.params.id)))

const start = () => {
  showToast('阅读器稍后接入')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.hero {
  height: 220px;
}

.tone-0 { background: linear-gradient(160deg, #d9c7ee, #8a6bb3); }
.tone-1 { background: linear-gradient(160deg, #c7d8ee, #6b8ab3); }
.tone-2 { background: linear-gradient(160deg, #eec7d4, #b36b86); }
.tone-3 { background: linear-gradient(160deg, #c7eee0, #6bb39a); }
.tone-4 { background: linear-gradient(160deg, #eee3c7, #b39a6b); }
.tone-5 { background: linear-gradient(160deg, #c7e4ee, #6ba0b3); }

.info,
.chapters {
  background: #fff;
  padding: 16px;
}

h2 {
  font-size: 18px;
}

.info p {
  margin-top: 6px;
  color: #888;
  font-size: 12px;
}

.intro {
  color: #555 !important;
  line-height: 1.6;
}

.tags {
  display: flex;
  gap: 8px;
  margin: 10px 0;

  span {
    background: #f3ecfb;
    color: $primary-color;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.read-btn {
  width: 100%;
  height: 40px;
  margin-top: 14px;
  border: 0;
  border-radius: 20px;
  background: $primary-color;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.chapters {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  h3 {
    grid-column: 1 / -1;
    font-size: 14px;
    margin-bottom: 4px;
  }
}

.chapter {
  height: 36px;
  border: 1px solid #eee;
  background: #fafafa;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
}
</style>
