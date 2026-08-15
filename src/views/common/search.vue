<template>
  <div class="page-shell sub-page">
    <PageHeader title="搜索" />
    <div class="search-bar">
      <input v-model="keyword" type="search" placeholder="搜索漫画 / 视频 / 小说" @keyup.enter="doSearch" />
      <button type="button" @click="doSearch">搜索</button>
    </div>
    <section class="block">
      <h3>热门搜索</h3>
      <div class="words">
        <button v-for="word in hotWords" :key="word" type="button" @click="keyword = word; doSearch()">
          {{ word }}
        </button>
      </div>
    </section>
    <section v-if="results.length" class="block">
      <h3>搜索结果</h3>
      <MediaGrid :items="results" @select="open" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { comics, hotWords, type CoverItem } from '@/data/mock'

const router = useRouter()
const keyword = ref('')
const results = ref<CoverItem[]>([])

const doSearch = () => {
  const q = keyword.value.trim()
  results.value = q ? comics.filter((x) => x.title.includes(q)) : comics
}

const open = (item: CoverItem) => {
  router.push(`/comic/${item.id}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.search-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;

  input {
    flex: 1;
    height: 36px;
    border: 0;
    border-radius: 18px;
    background: $background-surface2;
    padding: 0 14px;
    font-size: 14px;
    outline: none;
  }

  button {
    border: 0;
    background: $primary-color;
    color: #fff;
    border-radius: 18px;
    padding: 0 14px;
    font-size: 13px;
  }
}

.block {
  background: #fff;
  margin-top: 8px;
  padding: 12px;
}

h3 {
  font-size: 14px;
  margin-bottom: 10px;
}

.words {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    border: 0;
    background: $background-surface2;
    color: $primary-color;
    border-radius: 14px;
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
