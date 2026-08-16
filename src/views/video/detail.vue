<template>
  <div class="page-shell sub-page">
    <PageHeader :title="item?.title || '视频详情'" />
    <div class="player" :class="`tone-${tone}`">
      <HlsPlayer v-if="item?.source_url" :src="item.source_url" :poster="item.cover_url" />
      <span v-else>暂无播放地址，请在媒资中心转码后回填</span>
    </div>
    <section class="info">
      <h2>{{ item?.title }}</h2>
      <p>{{ item?.description || item?.created_at }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import HlsPlayer from '@/components/HlsPlayer.vue'
import { fetchVideoDetail, type VideoItem } from '@/api/video'
import { toastError } from '@/utils/request'

const route = useRoute()
const item = ref<VideoItem | null>(null)
const tone = computed(() => (item.value?.id || 0) % 6)

onMounted(() => {
  fetchVideoDetail(Number(route.params.id))
    .then((data) => {
      item.value = data
    })
    .catch(toastError)
})
</script>

<style scoped lang="scss">
.player {
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
}

.tone-0 { background: linear-gradient(160deg, #ffd0e0, #ff4d88); }
.tone-1 { background: linear-gradient(160deg, #e4d4ff, #7b5be0); }
.tone-2 { background: linear-gradient(160deg, #ffc2d4, #e85a9a); }
.tone-3 { background: linear-gradient(160deg, #ffe0f0, #c45b9a); }
.tone-4 { background: linear-gradient(160deg, #ffd9c8, #ff7a9a); }
.tone-5 { background: linear-gradient(160deg, #dcc8ff, #8b6ad4); }

.info {
  background: #fff;
  padding: 14px 12px;
}

h2 {
  font-size: 16px;
}

.info p {
  margin-top: 6px;
  color: #888;
  font-size: 12px;
}
</style>
