<template>
  <div class="page-shell sub-page">
    <PageHeader :title="item?.title || '视频详情'" />
    <div class="player" :class="`tone-${tone}`">
      <HlsPlayer v-if="item?.source_url" :src="item.source_url" :poster="item.cover_url" />
      <span v-else>暂无播放地址，请在媒资中心转码后回填</span>
    </div>

    <div class="tab-row">
      <button type="button" class="tab" :class="{ active: tab === 'intro' }" @click="tab = 'intro'">简介</button>
      <button type="button" class="tab" :class="{ active: tab === 'comment' }" @click="tab = 'comment'">评论</button>
      <button type="button" class="line-btn" @click="soon('线路')">线路1</button>
    </div>

    <template v-if="tab === 'intro'">
      <section class="soft-card info">
        <h2>{{ item?.title }}</h2>
        <p>{{ item?.description || item?.created_at }}</p>
      </section>

      <section class="soft-card ad-row">
        <button v-for="ad in ads" :key="ad.label" type="button" class="ad-item" @click="onAd(ad)">
          <span class="ad-icon">{{ ad.icon }}</span>
          <span class="ad-label">{{ ad.label }}</span>
        </button>
      </section>

      <SectionPanel title="精彩推荐">
        <p v-if="!recommends.length" class="page-empty">暂无更多视频</p>
        <MediaGrid v-else :items="recommends" cols="cols-2" wide @select="open" />
      </SectionPanel>
    </template>

    <section v-else class="soft-card comment-box">
      <p class="page-empty">暂无评论</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import HlsPlayer from '@/components/HlsPlayer.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionPanel from '@/components/SectionPanel.vue'
import { fetchVideoDetail, fetchVideoList, type VideoItem } from '@/api/video'
import type { CoverItem } from '@/data/mock'
import { mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const item = ref<VideoItem | null>(null)
const recommends = ref<CoverItem[]>([])
const tab = ref<'intro' | 'comment'>('intro')
const tone = computed(() => (item.value?.id || 0) % 6)

const ads = [
  { icon: '👑', label: '开通VIP', path: '/vip' },
  { icon: '🪙', label: '金币商城', path: '/wallet' },
  { icon: '🎁', label: '福利中心', path: '/checkin' },
  { icon: '🌸', label: '精选活动', path: '' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const formatDuration = (sec: number) => {
  if (!sec) return ''
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

const toCover = (v: VideoItem): CoverItem => ({
  id: String(v.id),
  title: v.title,
  duration: formatDuration(v.duration),
  tag: 'Free',
  cover: mediaUrl(v.cover_url),
  tone: v.id % 6,
})

const soon = (name: string) => showToast(`${name} 稍后接入`)

const onAd = (ad: { label: string; path: string }) => {
  if (ad.path) {
    router.push(ad.path)
    return
  }
  soon(ad.label)
}

const open = (row: CoverItem) => {
  router.push(`/video/${row.id}`)
}

const load = () => {
  const id = Number(route.params.id)
  if (!id) return
  tab.value = 'intro'
  fetchVideoDetail(id)
    .then((data) => {
      item.value = data
    })
    .catch(toastError)
  fetchVideoList(1, 8, '', 1)
    .then((data) => {
      recommends.value = (data.list || [])
        .filter((v) => v.id !== id)
        .slice(0, 6)
        .map(toCover)
    })
    .catch(toastError)
}

watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.player {
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  background: #000;
}

.player :deep(.media) {
  max-height: none;
  aspect-ratio: 16 / 9;
  height: auto;
}

@include media-tones;

.tab-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 12px 0;
}

.tab {
  border: 0;
  background: transparent;
  color: $text-color-secondary;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 0;
  position: relative;

  &.active {
    color: $ink;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      border-radius: 2px;
      background: $accent-yellow;
    }
  }
}

.line-btn {
  margin-left: auto;
  border: 1.4px solid $ink;
  background: #fff;
  color: $ink;
  font-size: 12px;
  font-weight: 700;
  border-radius: $radius-pill;
  padding: 4px 10px;
}

.info {
  h2 {
    font-size: 16px;
  }

  p {
    margin-top: 6px;
    color: $text-color-muted;
    font-size: 12px;
  }
}

.ad-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.ad-item {
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.ad-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1.6px solid $ink;
  background: $accent-yellow;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.ad-label {
  font-size: 11px;
  color: $ink;
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-box {
  min-height: 160px;
}
</style>
