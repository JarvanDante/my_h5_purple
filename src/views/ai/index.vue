<template>
  <div class="page-shell">
    <header class="home-header">
      <div class="channel-row">
        <h1 class="site-name">AI</h1>
      </div>
      <p class="ai-desc">创作工具演示页，后续接真实能力</p>
    </header>
    <section class="soft-card tools">
      <button
        v-for="tool in aiTools"
        :key="tool.key"
        type="button"
        class="tool"
        :class="`tool--${tool.key}`"
        @click="open(tool.title)"
      >
        <div class="icon">{{ marks[tool.key] }}</div>
        <div class="copy">
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.desc }}</p>
        </div>
        <span class="arrow" aria-hidden="true">›</span>
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
import { comicPath } from '@/utils/idcrypt'

defineOptions({ name: 'Ai' })

const router = useRouter()
const marks: Record<string, string> = {
  draw: '绘',
  face: '换',
  chat: '聊',
  novel: '文',
}

const open = (name: string) => {
  showToast(`${name} 稍后接入`)
}

const openItem = (item: CoverItem) => {
  router.push(comicPath(item.id))
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.site-name {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: $text-color;
}

.ai-desc {
  margin-top: 6px;
  font-size: 12px;
  color: $text-color-secondary;
}

.tools {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid $line;
  background: #16161c;
  border-radius: 12px;
  padding: 12px;
  text-align: left;
  color: inherit;

  &:active {
    transform: scale(0.985);
    background: #1e1e26;
  }
}

.copy {
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 15px;
    font-weight: 700;
    color: $text-color;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: $text-color-secondary;
  }
}

.icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: $primary-soft;
  color: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.tool--face .icon {
  background: rgba(176, 108, 255, 0.16);
  color: #c59bff;
}

.tool--chat .icon {
  background: rgba(86, 156, 255, 0.16);
  color: #7eb6ff;
}

.tool--novel .icon {
  background: rgba(255, 176, 92, 0.16);
  color: #ffc27a;
}

.arrow {
  flex-shrink: 0;
  color: $text-color-muted;
  font-size: 22px;
  line-height: 1;
}

.recent .section-title {
  display: inline-block;
  margin-bottom: 10px;
}
</style>
