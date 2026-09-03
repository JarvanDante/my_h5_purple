<template>
  <div class="page-shell sub-page video-play" :class="{ 'is-comment': tab === 'comment' }">
    <div class="player" :class="[`tone-${tone}`, { 'is-fs': isFs }]">
      <button type="button" class="back-btn" aria-label="返回" @click="back">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <HlsPlayer
        v-if="item?.source_url"
        ref="playerRef"
        :src="mediaUrl(item.source_url)"
        :poster="posterSrc"
        :trial-sec="!isVip && item.need_vip ? item.preview_sec || 5 : 0"
        @user-pause="onUserPause"
        @play="onPlayerPlay"
        @ended="onTrialEnd"
        @native-fullscreen="toggleFs"
      />
      <span v-else class="no-src">暂无播放地址，请在媒资中心转码后回填</span>
      <div v-if="showTrial" class="trial-cover">
        <h3>试看结束</h3>
        <p>开通会员 全站视频免费看</p>
        <button type="button" class="trial-vip" @click="goVip">开通会员免费看</button>
      </div>
      <div v-else-if="showAd" class="ad-cover">
        <AdImage v-if="playerAd" :ad="playerAd" :mark="false" />
        <span v-else class="ad-placeholder">广告</span>
        <button type="button" class="ad-skip" @click="onAdAction">
          {{ adLeft > 0 ? `开通会员跳过广告：${adLeft}秒` : '开始播放' }}
        </button>
      </div>
      <div v-else-if="showPauseAd" class="pause-ad">
        <div class="pause-ad-box">
          <button type="button" class="pause-ad-close" aria-label="关闭" @click="closePauseAd">×</button>
          <AdImage v-if="playerAd" :ad="playerAd" />
          <span v-else>广告</span>
          <button type="button" class="pause-ad-vip" @click="goVip">VIP去广告</button>
        </div>
      </div>
    </div>

    <div class="tab-row">
      <button type="button" class="tab" :class="{ active: tab === 'intro' }" @click="tab = 'intro'">简介</button>
      <button type="button" class="tab" :class="{ active: tab === 'comment' }" @click="tab = 'comment'">
        评论({{ commentCount }})
      </button>
      <button type="button" class="line-btn" @click="soon('线路')">线路1</button>
    </div>

    <template v-if="tab === 'intro'">
      <section class="intro">
        <h2>{{ item?.title }}</h2>
        <div v-if="tags.length" class="tags">
          <span v-for="tag in tags" :key="tag">{{ tag }}</span>
        </div>
        <p v-if="item?.created_at" class="meta">{{ item.created_at }}</p>
      </section>

      <section class="actions">
        <button type="button" :class="{ on: liked }" @click="toggle('like')">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20Z" stroke="currentColor" stroke-width="1.6" />
          </svg>
          <span>{{ liked ? '已赞' : '点赞' }}</span>
        </button>
        <button type="button" :class="{ on: collected }" @click="toggle('fav')">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 17.2 6.2 20l1.1-6.4L2.8 9.2l6.5-.9L12 2.8l2.7 5.5 6.5.9-4.5 4.4L17.8 20 12 17.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
          <span>{{ collected ? '已收藏' : '收藏' }}</span>
        </button>
        <button type="button" @click="share">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="18" cy="5.5" r="2.2" stroke="currentColor" stroke-width="1.6" />
            <circle cx="6" cy="12" r="2.2" stroke="currentColor" stroke-width="1.6" />
            <circle cx="18" cy="18.5" r="2.2" stroke="currentColor" stroke-width="1.6" />
            <path d="M8 12.7 16 17.8M16 6.2 8 11.3" stroke="currentColor" stroke-width="1.6" />
          </svg>
          <span>分享</span>
        </button>
        <button type="button" @click="soon('反馈')">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 6.5h14v9.2H9.2L5 19.4V6.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
          <span>反馈</span>
        </button>
      </section>

      <AdIconGrid v-if="!isVip" :limit="5" />

      <SectionPanel title="精彩推荐">
        <p v-if="!recommends.length" class="page-empty">暂无更多视频</p>
        <MediaGrid v-else :items="recommends" cols="cols-2" wide @select="open" />
      </SectionPanel>
    </template>

    <CommentPanel
      v-else-if="item"
      :content-id="item.id"
      :media-type="COMMENT_MEDIA_VIDEO"
      @update:count="commentCount = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { AD_SLOT } from '@/api/ads'
import AdIconGrid from '@/components/AdIconGrid.vue'
import AdImage from '@/components/AdImage.vue'
import CommentPanel from '@/components/CommentPanel.vue'
import HlsPlayer from '@/components/HlsPlayer.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import SectionPanel from '@/components/SectionPanel.vue'
import { COMMENT_MEDIA_VIDEO } from '@/api/ops'
import { COLLECT_FAV, COLLECT_LIKE, fetchCollectList, MEDIA_VIDEO, operateCollect } from '@/api/collect'
import { fetchVideoDetail, fetchVideoList, type VideoItem } from '@/api/video'
import { useAdsStore } from '@/stores/ads'
import { useUserStore } from '@/stores/user'
import type { CoverItem } from '@/data/mock'
import { routeId, videoPath } from '@/utils/idcrypt'
import { useEncryptedSrc } from '@/composables/useEncryptedSrc'
import { pushBrowse } from '@/utils/browseHistory'
import { getToken, mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const adsStore = useAdsStore()
const isVip = computed(() => userStore.isVip)
const playerAd = computed(() => (isVip.value ? undefined : adsStore.firstOf(AD_SLOT.player)))
const item = ref<VideoItem | null>(null)
const recommends = ref<CoverItem[]>([])
const tab = ref<'intro' | 'comment'>('intro')
const commentCount = ref(0)
const liked = ref(false)
const collected = ref(false)
const playerRef = ref<{ play: () => void; pause: () => void } | null>(null)
const showAd = ref(false)
const showPauseAd = ref(false)
const showTrial = ref(false)
const isFs = ref(false)
const adLeft = ref(5)
let adTimer = 0

const clearAdTimer = () => {
  window.clearInterval(adTimer)
  adTimer = 0
}

const startAdTimer = () => {
  if (isVip.value) {
    showAd.value = false
    showPauseAd.value = false
    return
  }
  adsStore.load(AD_SLOT.player, 3)
  clearAdTimer()
  showAd.value = true
  adLeft.value = 5
  adTimer = window.setInterval(() => {
    adLeft.value -= 1
    if (adLeft.value <= 0) {
      adLeft.value = 0
      clearAdTimer()
    }
  }, 1000)
}

const onAdAction = () => {
  if (adLeft.value > 0) {
    router.push('/vip')
    return
  }
  showAd.value = false
  showPauseAd.value = false
  playerRef.value?.play()
}

const onUserPause = () => {
  if (isVip.value || showAd.value || showTrial.value) return
  showPauseAd.value = true
}

const onTrialEnd = () => {
  if (isVip.value || !item.value?.need_vip) return
  showPauseAd.value = false
  showTrial.value = true
  playerRef.value?.pause()
}

const closePauseAd = () => {
  showPauseAd.value = false
}

const goVip = () => {
  router.push('/vip')
}

const enterFs = () => {
  isFs.value = true
  document.documentElement.classList.add('video-fs')
}

const exitFs = () => {
  isFs.value = false
  document.documentElement.classList.remove('video-fs')
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => undefined)
  }
}

const toggleFs = () => {
  if (isFs.value) exitFs()
  else enterFs()
}

const onPlayerPlay = () => {
  showPauseAd.value = false
}
const tone = computed(() => (item.value?.id || 0) % 6)
const poster = computed(() => mediaUrl(item.value?.cover_url))
const posterSrc = useEncryptedSrc(poster)

const tags = computed(() => {
  const raw = (item.value?.description || '').trim()
  if (!raw) return []
  const parts = raw.split(/[,，|／/]/).map((s) => s.trim()).filter(Boolean)
  if (parts.length >= 2 && parts.every((s) => s.length <= 10)) return parts.slice(0, 8)
  return []
})

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

const open = (row: CoverItem) => {
  router.push(videoPath(row.id))
}

const back = () => {
  if (isFs.value) {
    exitFs()
    return
  }
  if (window.history.state?.back) {
    router.back()
    return
  }
  router.replace('/video')
}

const share = () => router.push('/invite')

const ensureAuth = async () => {
  if (getToken()) return true
  try {
    await userStore.ensureLogin()
    return true
  } catch {
    showToast('请先登录')
    return false
  }
}

const loadMarks = async () => {
  if (!getToken() || !item.value) return
  const id = item.value.id
  try {
    const [fav, like] = await Promise.all([
      fetchCollectList(COLLECT_FAV, MEDIA_VIDEO, 1, 100),
      fetchCollectList(COLLECT_LIKE, MEDIA_VIDEO, 1, 100),
    ])
    collected.value = (fav.list || []).some((row) => row.content_id === id)
    liked.value = (like.list || []).some((row) => row.content_id === id)
  } catch {
    collected.value = false
    liked.value = false
  }
}

const toggle = async (kind: 'like' | 'fav') => {
  if (!item.value || !(await ensureAuth())) return
  const isLike = kind === 'like'
  const next = isLike ? !liked.value : !collected.value
  try {
    await operateCollect(item.value.id, MEDIA_VIDEO, next, isLike ? COLLECT_LIKE : COLLECT_FAV)
    if (isLike) liked.value = next
    else collected.value = next
    showToast(next ? (isLike ? '已点赞' : '已收藏') : isLike ? '已取消点赞' : '已取消收藏')
  } catch (err) {
    toastError(err)
  }
}

const load = () => {
  const id = routeId(route.params.id)
  if (!id) return
  tab.value = route.query.tab === 'comment' || Number(route.query.comment) > 0 ? 'comment' : 'intro'
  liked.value = false
  collected.value = false
  commentCount.value = 0
  showPauseAd.value = false
  showTrial.value = false
  if (isVip.value) {
    showAd.value = false
    clearAdTimer()
  } else {
    startAdTimer()
  }
  fetchVideoDetail(id)
    .then((data) => {
      item.value = data
      commentCount.value = Number(data.comment_count || 0)
      pushBrowse({
        id: data.id,
        kind: 'video',
        title: data.title,
        cover: data.cover_url,
        tag: '视频',
      })
      return loadMarks()
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

watch(isVip, (vip) => {
  if (!vip) return
  showAd.value = false
  showPauseAd.value = false
  showTrial.value = false
  clearAdTimer()
})
watch(() => route.params.id, load, { immediate: true })
onActivated(() => {
  if (item.value?.need_vip) load()
})
onBeforeUnmount(() => {
  clearAdTimer()
  exitFs()
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.video-play {
  padding-bottom: 16px;
  background: $background-page;
}

.video-play.is-comment {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 0;
}

.player {
  position: relative;
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  background: #000;
}

.player.is-fs {
  position: fixed;
  inset: 0;
  z-index: 80;
  min-height: 100%;
  height: 100%;
}

.trial-cover {
  position: absolute;
  inset: 0;
  z-index: 6;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  color: #fff;

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
  }

  p {
    margin: 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.78);
  }
}

.trial-vip {
  margin-top: 10px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #7b4dff, #ff5c93);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  padding: 10px 22px;
}

.ad-cover {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: #2a2a2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-cover :deep(.ad-image) {
  position: absolute;
  inset: 0;
}

.ad-placeholder {
  color: rgba(255, 255, 255, 0.35);
  font-size: 14px;
}

.ad-skip {
  position: absolute;
  right: 10px;
  bottom: 12px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
}

.pause-ad {
  position: absolute;
  inset: 0 0 48px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.pause-ad-box {
  position: relative;
  width: 58%;
  max-width: 220px;
  aspect-ratio: 16 / 10;
  background: #3a3a40;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  pointer-events: auto;
}

.pause-ad-box :deep(.ad-image) {
  position: absolute;
  inset: 0;
}

.player.is-fs .pause-ad {
  inset: 0 0 56px;
}

.player.is-fs .pause-ad-box {
  width: 72%;
  max-width: 280px;
}

.pause-ad-vip {
  position: relative;
  z-index: 1;
  border: 0;
  border-radius: 999px;
  background: $primary-color;
  color: $on-accent;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
}

.pause-ad-close {
  position: absolute;
  top: 4px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: 0;
  background: transparent;
  color: #fff;
  font-size: 20px;
  line-height: 1;
}

.back-btn {
  position: absolute;
  top: var(--app-header-top);
  left: 8px;
  z-index: 4;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
}

.player :deep(.media) {
  max-height: none;
  aspect-ratio: 16 / 9;
  height: auto;
}

.player.is-fs :deep(.media) {
  width: 100%;
  height: 100%;
  max-height: none;
  aspect-ratio: auto;
  object-fit: contain;
}

.no-src {
  padding: 24px 16px;
  text-align: center;
}

@include media-tones;

.tab-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 14px 0;
  background: $background-page;
  border-bottom: 1px solid $line;
}

.tab {
  border: 0;
  background: transparent;
  color: $tab-idle;
  font-size: 15px;
  font-weight: 600;
  padding: 6px 0 10px;
  position: relative;

  &.active {
    color: $text-color;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 18px;
      height: 3px;
      border-radius: 2px;
      background: $primary-color;
      transform: translateX(-50%);
    }
  }
}

.line-btn {
  margin-left: auto;
  border: 0;
  background: $primary-color;
  color: $on-accent;
  font-size: 11px;
  font-weight: 700;
  border-radius: $radius-pill;
  padding: 5px 10px;
}

.intro {
  padding: 14px 14px 4px;
  background: $background-page;

  h2 {
    font-size: 16px;
    font-weight: 800;
    color: $text-color;
    line-height: 1.45;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  span {
    font-size: 12px;
    color: $primary-color;
    background: $primary-soft;
    border-radius: 999px;
    padding: 4px 10px;
  }
}

.meta {
  margin-top: 8px;
  font-size: 12px;
  color: $text-color-muted;
}

.actions {
  display: flex;
  justify-content: space-around;
  padding: 14px 8px 8px;
  background: $background-page;

  button {
    border: 0;
    background: transparent;
    color: $text-color-secondary;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 56px;

    svg {
      width: 22px;
      height: 22px;
    }

    span {
      font-size: 11px;
    }

    &.on {
      color: $primary-color;
    }
  }
}

.ad-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  padding: 8px 14px 12px;
  background: $background-page;
}

.ad-slot {
  aspect-ratio: 1;
  border-radius: 8px;
  background: $background-surface2;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 10px;
    color: $text-color-muted;
  }
}

.video-play.is-comment .player,
.video-play.is-comment .tab-row {
  flex-shrink: 0;
}
</style>
