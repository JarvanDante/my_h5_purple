<template>
  <div class="page-shell">
    <header class="head">
      <h1>AI</h1>
      <p>创作工具演示页，后续接真实能力</p>
    </header>
    <section class="tools">
      <button v-for="tool in aiTools" :key="tool.key" type="button" class="tool" @click="open(tool.title)">
        <div class="icon">AI</div>
        <div>
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.desc }}</p>
        </div>
      </button>
    </section>
    <section class="recent">
      <h3>最近生成</h3>
      <MediaGrid :items="comics.slice(0, 3)" @select="openItem" />
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

.head {
  background: $primary-color;
  color: #fff;
  padding: 14px 12px 18px;

  h1 {
    font-size: 20px;
  }

  p {
    margin-top: 6px;
    font-size: 12px;
    opacity: 0.75;
  }
}

.tools,
.recent {
  background: #fff;
  padding: 12px;
}

.tool {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  background: $background-surface2;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 10px;
  text-align: left;

  h3 {
    font-size: 15px;
    color: #333;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: #888;
  }
}

.icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: $primary-color;
  color: $on-accent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.recent h3 {
  font-size: 14px;
  margin-bottom: 10px;
}
</style>
