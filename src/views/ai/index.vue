<template>
  <div class="page-shell ai-home">
    <header class="ai-top">
      <AppTopbar title="AI智能创作" />
    </header>
    <header class="hero">
      <div class="hero-copy">
        <button type="button" class="works-link" @click="router.push('/ai/works')">查看我的AI作品 ›</button>
      </div>
    </header>

    <section class="grid">
      <button
        v-for="tool in aiTools"
        :key="tool.key"
        type="button"
        class="card"
        :class="`card--${tool.key}`"
        @click="open(tool)"
      >
        <div class="card-top">
          <h3>{{ tool.title }}</h3>
          <span class="go" aria-hidden="true">›</span>
        </div>
        <div class="visual">{{ marks[tool.key] }}</div>
        <p>{{ tool.desc }}</p>
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppTopbar from '@/components/AppTopbar.vue'
import { showToast } from 'vant'
import { aiTools } from '@/data/mock'

defineOptions({ name: 'Ai' })

const router = useRouter()
const marks: Record<string, string> = {
  i2v: '片',
  face: '换',
  undress: '衣',
  draw: '绘',
  novel: '文',
  dress: '装',
}

const open = (tool: { key: string; title: string }) => {
  if (tool.key === 'face') {
    router.push('/ai/faceswap')
    return
  }
  if (tool.key === 'undress') {
    router.push('/ai/undress')
    return
  }
  showToast(`${tool.title} 稍后接入`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.ai-home {
  padding-bottom: calc(#{$tabbar-height} + 16px + env(safe-area-inset-bottom, 0px));
}

.ai-top {
  position: sticky;
  top: 0;
  z-index: 50;
  padding: var(--app-header-top) 12px 0;
  background: $background-page;
}

.hero {
  margin: 8px 12px 14px;
  padding: 16px 16px 20px;
  border-radius: 18px;
  background:
    radial-gradient(120% 140% at 20% 0%, rgba(255, 92, 147, 0.55), transparent 55%),
    linear-gradient(135deg, #3a1a28 0%, #1a1218 70%);
  box-shadow: $shadow-card;
}

.hero-copy h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
}

.works-link {
  margin-top: 12px;
  height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: $radius-pill;
  background: #fff;
  color: $primary-color;
  font-size: 13px;
  font-weight: 700;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;
}

.card {
  min-height: 168px;
  padding: 12px;
  border: 0;
  border-radius: 16px;
  text-align: left;
  color: #fff;
  display: flex;
  flex-direction: column;
  background: #2a1620;

  &:active {
    transform: scale(0.98);
  }

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 800;
  }

  p {
    margin-top: auto;
    font-size: 11px;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.72);
  }
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.go {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
}

.visual {
  width: 56px;
  height: 56px;
  margin: 16px auto 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
}

.card--face {
  background: linear-gradient(180deg, #ff6b9d 0%, #c43d72 100%);
}
.card--i2v {
  background: linear-gradient(180deg, #ff8f6b 0%, #c45a3d 100%);
}
.card--undress {
  background: linear-gradient(180deg, #c59bff 0%, #7a4cc4 100%);
}
.card--draw {
  background: linear-gradient(180deg, #7eb6ff 0%, #3d6ec4 100%);
}
.card--novel {
  background: linear-gradient(180deg, #ffc27a 0%, #c47a3d 100%);
}
.card--dress {
  background: linear-gradient(180deg, #7ad4c4 0%, #3d9a8a 100%);
}
</style>
