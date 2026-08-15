<template>
  <div class="page-shell sub-page">
    <PageHeader :title="item?.title || '视频详情'" />
    <div class="player" :class="`tone-${tone}`">
      <video v-if="item?.source_url" :src="item.source_url" controls playsinline class="media" />
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

.media {
  width: 100%;
  max-height: 240px;
  background: #000;
}

.tone-0 { background: linear-gradient(160deg, #d9c7ee, #8a6bb3); }
.tone-1 { background: linear-gradient(160deg, #c7d8ee, #6b8ab3); }
.tone-2 { background: linear-gradient(160deg, #eec7d4, #b36b86); }
.tone-3 { background: linear-gradient(160deg, #c7eee0, #6bb39a); }
.tone-4 { background: linear-gradient(160deg, #eee3c7, #b39a6b); }
.tone-5 { background: linear-gradient(160deg, #c7e4ee, #6ba0b3); }

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
