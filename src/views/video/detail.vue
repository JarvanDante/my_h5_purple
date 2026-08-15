<template>
  <div class="page-shell sub-page">
    <PageHeader :title="item.title" />
    <div class="player" :class="`tone-${item.tone}`">
      <span>▶ {{ item.duration }}</span>
    </div>
    <section class="info">
      <h2>{{ item.title }}</h2>
      <p>{{ item.views }}播放 · {{ item.tag }}</p>
    </section>
    <section class="more">
      <h3>相关推荐</h3>
      <MediaGrid :items="videos.filter((x) => x.id !== item.id)" cols="cols-2" @select="open" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { findVideo, videos, type CoverItem } from '@/data/mock'

const route = useRoute()
const router = useRouter()
const item = computed(() => findVideo(String(route.params.id)))

const open = (next: CoverItem) => {
  router.replace(`/video/${next.id}`)
}
</script>

<style scoped lang="scss">
.player {
  height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}

.tone-0 { background: linear-gradient(160deg, #d9c7ee, #8a6bb3); }
.tone-1 { background: linear-gradient(160deg, #c7d8ee, #6b8ab3); }
.tone-2 { background: linear-gradient(160deg, #eec7d4, #b36b86); }
.tone-3 { background: linear-gradient(160deg, #c7eee0, #6bb39a); }
.tone-4 { background: linear-gradient(160deg, #eee3c7, #b39a6b); }
.tone-5 { background: linear-gradient(160deg, #c7e4ee, #6ba0b3); }

.info,
.more {
  background: #fff;
  padding: 14px 12px;
}

h2 {
  font-size: 16px;
}

.info p,
.more h3 {
  margin-top: 6px;
  color: #888;
  font-size: 12px;
}

.more h3 {
  margin: 0 0 10px;
  color: #333;
  font-size: 14px;
}
</style>
