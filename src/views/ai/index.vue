<template>
  <div class="page-shell">
    <header class="home-header">
      <div class="channel-row">
        <h1 class="site-name">AI</h1>
      </div>
      <p class="ai-desc">创作工具演示页，后续接真实能力</p>
    </header>
    <section class="soft-card tools">
      <button v-for="tool in aiTools" :key="tool.key" type="button" class="tool" @click="open(tool.title)">
        <div class="icon">AI</div>
        <div>
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.desc }}</p>
        </div>
      </button>
    </section>
    <section class="soft-card recent">
      <h3 class="section-title">最近生成</h3>
      <MediaGrid :items="comics.slice(0, 3)" cols="cols-3" @select="openItem" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import MediaGrid from '@/components/MediaGrid.vue'
import { aiTools, comics, type CoverItem } from '@/data/mock'

defineOptions({ name: 'Ai' })

const router = useRouter()

const open = (name: string) => {
  showToast(`${name} 稍后接入`)
}

const openItem = (item: CoverItem) => {
  router.push(`/comic/${item.id}`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.ai-desc {
  margin-top: 8px;
  font-size: 12px;
  color: $text-color-secondary;
}

.tool {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.6px solid $ink;
  background: $background-surface2;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  text-align: left;

  h3 {
    font-size: 15px;
    color: #f2f2f5;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: $text-color-muted;
  }
}

.icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: $primary-color;
  color: $ink;
  border: 1.6px solid $ink;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
}

.recent .section-title {
  display: inline-block;
  margin-bottom: 10px;
}
</style>
