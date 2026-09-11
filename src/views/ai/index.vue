<template>
  <div class="page-shell ai-home">
    <HomeHeader
      dark
      :channels="channels"
      :channel="channel"
      search-text="搜索更多AI"
      @select-channel="selectChannel"
      @search="router.push(searchPath('ai'))"
      @vip="router.push('/vip')"
      @checkin="router.push('/checkin')"
    />

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
import HomeHeader from '@/components/HomeHeader.vue'
import { showToast } from 'vant'
import { aiTools } from '@/data/mock'
import { searchPath } from '@/utils/searchScope'

defineOptions({ name: 'Ai' })

const router = useRouter()
const channels = ['智能创作', '我的作品']
const channel = '智能创作'
const selectChannel = (item: string) => {
  if (item === '我的作品') router.push('/ai/works')
}
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

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 10px 12px 0;
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
