<template>
  <div class="page-shell ai-home">
    <header class="hero">
      <img class="hero-art" :src="heroArt" alt="" />
      <div class="hero-ui">
        <AppTopbar />
        <div class="hero-copy">
          <h1>AI智能创作</h1>
          <button type="button" class="works-link" @click="router.push('/ai/works')">
            查看我的AI作品
            <span class="works-go" aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </header>

    <section class="grid">
      <button
        v-for="tool in aiTools"
        :key="tool.key"
        type="button"
        class="card"
        @click="open(tool)"
      >
        <img :src="arts[tool.key]" :alt="tool.title" />
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppTopbar from '@/components/AppTopbar.vue'
import { showToast } from 'vant'
import { aiTools } from '@/data/mock'
import heroArt from '@/assets/ai/hero.png'
import artI2v from '@/assets/ai/i2v.png'
import artFace from '@/assets/ai/face.png'
import artUndress from '@/assets/ai/undress.png'
import artDraw from '@/assets/ai/draw.png'
import artNovel from '@/assets/ai/novel.png'
import artDress from '@/assets/ai/dress.png'

defineOptions({ name: 'Ai' })

const router = useRouter()
const arts: Record<string, string> = {
  i2v: artI2v,
  face: artFace,
  undress: artUndress,
  draw: artDraw,
  novel: artNovel,
  dress: artDress,
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
  background-color: $primary-color;
  background-image: none;
  color: #fff;
  padding-bottom: calc(#{$tabbar-height} + 12px + env(safe-area-inset-bottom, 0px));
}

.hero {
  position: relative;
  overflow: hidden;
}

.hero-art {
  display: block;
  width: 100%;
  height: 228px;
  object-fit: cover;
  object-position: 78% center;
}

.hero-ui {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: var(--app-header-top) 12px 18px;
}

.hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  background: linear-gradient(180deg, transparent, $primary-color);
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 58%;
  padding-left: 4px;
}

.hero-copy h1 {
  margin: 0;
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
}

.works-link {
  margin-top: 12px;
  align-self: flex-start;
  height: 32px;
  padding: 0 8px 0 12px;
  border: 0;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.works-go {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  color: $primary-color;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

.hero-ui :deep(.app-topbar) {
  position: relative;
  z-index: 2;
}

.hero-ui :deep(.menu-btn) {
  background: rgba(255, 255, 255, 0.22);
}

.hero-ui :deep(.menu-btn i) {
  background: #fff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 2px 12px 0;
}

.card {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 18px;
  overflow: hidden;
  line-height: 0;

  &:active {
    transform: scale(0.98);
  }

  img {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
