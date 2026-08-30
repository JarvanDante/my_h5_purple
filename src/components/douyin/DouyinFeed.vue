<template>
  <div class="dy-feed" :class="{ overlay }">
    <button v-if="overlay" type="button" class="back" aria-label="返回" @click="$emit('close')">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <p v-if="loading && !items.length" class="dy-empty">加载中…</p>
    <p v-else-if="!items.length" class="dy-empty">{{ empty }}</p>

    <div v-else ref="scroller" class="scroller" @scroll.passive="onScroll">
      <section v-for="(item, idx) in items" :key="item.id" class="slide">
        <div class="stage">
          <EncryptedImage v-if="item.cover_url" class="poster" :src="mediaUrl(item.cover_url)" alt="" />
          <HlsPlayer
            v-if="Math.abs(idx - current) <= 1 && item.source_url"
            :ref="(el) => setPlayer(idx, el)"
            :src="playSrc(item)"
            :poster="mediaUrl(item.cover_url)"
            :controls="false"
            fit="cover"
            :muted="muted"
            :autoplay="idx === current && !showTrial"
            :trial-sec="!isVip && item.need_vip ? item.preview_sec || 5 : 0"
            @click="togglePlay"
            @play="paused = false"
            @user-pause="paused = true"
            @ended="idx === current && onTrialEnd(item)"
            @timeupdate="(cur, dur) => idx === current && onTime(cur, dur)"
          />
          <div v-if="!isVip && showTrial && idx === current && item.need_vip" class="trial-cover">
            <h3>试看结束</h3>
            <p>开通会员 全站视频免费看</p>
            <button type="button" class="trial-vip" @click.stop="goVip">开通会员免费看</button>
          </div>
          <button v-if="muted && idx === current" type="button" class="unmute" @click.stop="muted = false">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 10v4h3.2L12 18V6L7.2 10H4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <path d="m16 9 5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
            解除静音
          </button>
          <button v-if="paused && idx === current && !showTrial" type="button" class="play-ico" @click.stop="togglePlay">
            <svg viewBox="0 0 64 64" fill="none">
              <path d="M24 18v28l24-14-24-14Z" fill="#fff" />
            </svg>
          </button>
        </div>

        <aside class="side">
          <div v-if="item.up_user_id" class="up">
            <button type="button" class="up-face" @click.stop="goUp(item)">
              <UserAvatar :src="upAvatar(item)" :size="46" :sex="upSex(item)" :fallback="handle(item)" />
            </button>
            <button v-if="showPlus(item)" type="button" class="plus" aria-label="关注" @click.stop="onFollow(item)">+</button>
          </div>
          <button type="button" class="side-btn" :class="{ on: liked.has(item.id) }" @click="toggleMark(item, 'like')">
            <svg viewBox="0 0 28 28" fill="none">
              <path
                d="M14 23s-8-5-8-10.3A4.3 4.3 0 0 1 14 9.2a4.3 4.3 0 0 1 8 3.5C22 18 14 23 14 23Z"
                :fill="liked.has(item.id) ? '#ff5c93' : 'none'"
                stroke="currentColor"
                stroke-width="1.7"
              />
            </svg>
            <span>赞</span>
          </button>
          <button type="button" class="side-btn" :class="{ on: collected.has(item.id) }" @click="toggleMark(item, 'fav')">
            <svg viewBox="0 0 28 28" fill="none">
              <path
                d="M14 20.2 7.6 23.4l1.2-7L3.8 11.6l7.1-1L14 4.2l3.1 6.4 7.1 1-5 4.8 1.2 7L14 20.2Z"
                :fill="collected.has(item.id) ? '#ffd36a' : 'none'"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linejoin="round"
              />
            </svg>
            <span>收藏</span>
          </button>
          <button type="button" class="side-btn" @click.stop="openComments(item)">
            <svg viewBox="0 0 28 28" fill="none">
              <path d="M6 7.5h16v10.4h-6.6L6 22V7.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
            </svg>
            <span>{{ formatViews(commentN(item)) || '0' }}</span>
          </button>
          <button type="button" class="side-btn" @click.stop="openShare(item)">
            <svg viewBox="0 0 28 28" fill="none">
              <path d="M8 14h12M16 10l4 4-4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>分享</span>
          </button>
          <button type="button" class="side-btn" :class="{ warn: muted }" @click="muted = !muted">
            <svg v-if="muted" viewBox="0 0 28 28" fill="none">
              <path d="M5 11v6h3.6L14 21.5V6.5L8.6 11H5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <path d="m18 10 6 8M24 10l-6 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
            <svg v-else viewBox="0 0 28 28" fill="none">
              <path d="M5 11v6h3.6L14 21.5V6.5L8.6 11H5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              <path d="M18 11.2a4.4 4.4 0 0 1 0 5.6M21 8.8a8 8 0 0 1 0 10.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
            <span>{{ muted ? '静音' : '声音' }}</span>
          </button>
        </aside>

        <div class="info">
          <button v-if="!isVip" type="button" class="vip" @click="goVip">开通会员 畅享完整版</button>
          <p class="name" :class="{ link: item.up_user_id }" @click="item.up_user_id && goUp(item)">
            @{{ handle(item) }}
            <VipBadge :vip="item.up_is_vip" />
          </p>
          <p class="desc">{{ item.title }}</p>
          <p v-if="item.description" class="desc dim">{{ item.description }}</p>
          <div class="stats">
            <span>{{ formatDuration(item.duration) || '--:--' }}</span>
            <span>线路一</span>
          </div>
          <div v-if="tagsOf(item).length" class="chips">
            <span v-for="tag in tagsOf(item)" :key="tag">#{{ tag }}</span>
          </div>
        </div>

        <div class="progress">
          <span>{{ clock(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="Math.max(duration, 0.1)"
            step="0.1"
            :value="currentTime"
            @input="onSeek"
          />
          <span>{{ clock(duration || item.duration) }}</span>
        </div>
      </section>
    </div>

    <CommentDrawer
      :open="drawerOpen"
      :content-id="drawerId"
      :count="drawerCount"
      @close="drawerOpen = false"
      @update:count="onDrawerCount"
    />
    <ShareSheet :open="!!shareItem" :item="shareItem" @close="shareItem = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import HlsPlayer from '@/components/HlsPlayer.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import VipBadge from '@/components/VipBadge.vue'
import CommentDrawer from '@/components/douyin/CommentDrawer.vue'
import ShareSheet from '@/components/douyin/ShareSheet.vue'
import type { DouyinItem } from '@/api/douyin'
import { COLLECT_FAV, COLLECT_LIKE, fetchCollectList, MEDIA_VIDEO, operateCollect } from '@/api/collect'
import { toggleFollow } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { formatDuration, formatViews } from '@/utils/format'
import { userPath } from '@/utils/idcrypt'
import { getToken, mediaUrl, toastError } from '@/utils/request'
import {
  applyMark,
  beginMark,
  collectedIds,
  endMark,
  isMarkPending,
  keepDirty,
  likedIds,
  markKey,
  mergeMarks,
} from '@/components/douyin/marks'

type PlayerEx = { play: () => void; pause: () => void; toggle: () => void; seek: (sec: number) => void }

const props = withDefaults(
  defineProps<{
    items: DouyinItem[]
    loading?: boolean
    empty?: string
    start?: number
    overlay?: boolean
    presetLiked?: boolean
    presetCollected?: boolean
  }>(),
  { empty: '暂无内容', start: 0, overlay: false, presetLiked: false, presetCollected: false },
)

defineEmits<{
  close: []
}>()

const router = useRouter()
const userStore = useUserStore()
const isVip = computed(() => userStore.isVip)
const scroller = ref<HTMLElement | null>(null)
const current = ref(0)
const muted = ref(true)
const paused = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const liked = likedIds
const collected = collectedIds
const followedUp = ref(new Set<number>())
const unfollowedUp = ref(new Set<number>())
const players = new Map<number, PlayerEx>()

const setPlayer = (idx: number, el: unknown) => {
  const inst = el as PlayerEx | null
  if (inst) players.set(idx, inst)
  else players.delete(idx)
}

const tagsOf = (item: DouyinItem) => {
  const raw = item.categories?.length ? item.categories : (item.category || '').split(/[,，]/)
  return raw.map((s) => s.trim()).filter(Boolean).slice(0, 4)
}

const isMine = (item: DouyinItem) => {
  const uid = item.up_user_id || 0
  return uid > 0 && uid === (userStore.user?.id || 0)
}

const upAvatar = (item: DouyinItem) => {
  if (item.up_avatar) return mediaUrl(item.up_avatar)
  if (isMine(item)) return mediaUrl(userStore.user?.img)
  return ''
}

const upSex = (item: DouyinItem) => (isMine(item) ? userStore.user?.sex : 0)

const handle = (item: DouyinItem) => {
  const nick = (item.up_nickname || '').trim()
  if (nick) return nick
  if (isMine(item) && userStore.user?.nickname) return userStore.user.nickname
  return (item.title || '抖音').replace(/\s+/g, '').slice(0, 8) || '抖音'
}

const isFollowed = (item: DouyinItem) => {
  const uid = item.up_user_id || 0
  if (!uid) return true
  if (unfollowedUp.value.has(uid)) return false
  if (followedUp.value.has(uid)) return true
  return Boolean(item.followed)
}

const showPlus = (item: DouyinItem) => {
  const uid = item.up_user_id || 0
  if (!uid) return false
  if (uid === (userStore.user?.id || 0)) return false
  return !isFollowed(item)
}

const goUp = (item: DouyinItem) => {
  if (!item.up_user_id) return
  router.push(userPath(item.up_user_id))
}

const onFollow = async (item: DouyinItem) => {
  if (!item.up_user_id || !(await ensureAuth())) return
  try {
    const { followed } = await toggleFollow(item.up_user_id)
    const on = new Set(followedUp.value)
    const off = new Set(unfollowedUp.value)
    if (followed) {
      on.add(item.up_user_id)
      off.delete(item.up_user_id)
    } else {
      on.delete(item.up_user_id)
      off.add(item.up_user_id)
    }
    followedUp.value = on
    unfollowedUp.value = off
  } catch (err) {
    toastError(err)
  }
}

const playSrc = (item: DouyinItem) => mediaUrl(item.source_url)

const clock = (sec: number) => formatDuration(Math.floor(sec || 0)) || '00:00'

const playCurrent = async () => {
  await nextTick()
  players.forEach((p, idx) => {
    if (idx === current.value) void p.play()
    else p.pause()
  })
}

const togglePlay = () => {
  if (showTrial.value) return
  players.get(current.value)?.toggle()
}

const showTrial = ref(false)
const onTrialEnd = (item: DouyinItem) => {
  if (isVip.value || !item.need_vip) return
  showTrial.value = true
  players.get(current.value)?.pause()
}

const onTime = (cur: number, dur: number) => {
  currentTime.value = cur
  duration.value = dur
}

const onSeek = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value)
  players.get(current.value)?.seek(val)
  currentTime.value = val
}

const onScroll = () => {
  const box = scroller.value
  if (!box) return
  const next = Math.round(box.scrollTop / Math.max(box.clientHeight, 1))
  if (next === current.value) return
  current.value = next
  currentTime.value = 0
  duration.value = 0
  showTrial.value = false
  playCurrent()
}

const goVip = () => router.push('/vip')

const drawerOpen = ref(false)
const drawerId = ref(0)
const drawerCount = ref(0)
const commentExtra = ref(new Map<number, number>())

const commentN = (item: DouyinItem) => commentExtra.value.get(item.id) ?? item.comment_count ?? 0

const openComments = (item: DouyinItem) => {
  drawerId.value = item.id
  drawerCount.value = commentN(item)
  drawerOpen.value = true
}

const onDrawerCount = (n: number) => {
  drawerCount.value = n
  if (!drawerId.value) return
  const next = new Map(commentExtra.value)
  next.set(drawerId.value, n)
  commentExtra.value = next
  const row = props.items.find((x) => x.id === drawerId.value)
  if (row) row.comment_count = n
}

const shareItem = ref<DouyinItem | null>(null)

const openShare = (item: DouyinItem) => {
  shareItem.value = item
}

const ensureAuth = async () => {
  try {
    await userStore.ensureLogin()
    return true
  } catch {
    showToast('请先登录')
    return false
  }
}

let marksTick = 0

const seedMarks = () => {
  const ids = props.items.map((x) => x.id)
  if (props.presetLiked) mergeMarks('like', ids)
  if (props.presetCollected) mergeMarks('fav', ids)
}

const toggleMark = async (item: DouyinItem, kind: 'like' | 'fav') => {
  if (!(await ensureAuth())) return
  const key = markKey(kind, item.id)
  if (isMarkPending(key)) return
  const src = kind === 'like' ? liked.value : collected.value
  const next = !src.has(item.id)
  beginMark(key)
  applyMark(kind, item.id, next)
  try {
    await operateCollect(item.id, MEDIA_VIDEO, next, kind === 'like' ? COLLECT_LIKE : COLLECT_FAV)
  } catch (err) {
    applyMark(kind, item.id, !next)
    endMark(key, true)
    toastError(err)
    return
  }
  endMark(key)
}

const loadMarks = async () => {
  if (!getToken() || !props.items.length) return
  const tick = ++marksTick
  try {
    const [fav, like] = await Promise.all([
      fetchCollectList(COLLECT_FAV, MEDIA_VIDEO, 1, 100),
      fetchCollectList(COLLECT_LIKE, MEDIA_VIDEO, 1, 100),
    ])
    if (tick !== marksTick) return
    const nextFav = new Set((fav.list || []).map((r) => r.content_id))
    const nextLike = new Set((like.list || []).map((r) => r.content_id))
    keepDirty('fav', nextFav)
    keepDirty('like', nextLike)
    collected.value = nextFav
    liked.value = nextLike
  } catch {
    if (tick !== marksTick) return
  }
}

const jumpStart = async () => {
  await nextTick()
  const box = scroller.value
  if (!box) return
  const idx = Math.min(Math.max(props.start || 0, 0), Math.max(props.items.length - 1, 0))
  current.value = idx
  box.scrollTop = idx * box.clientHeight
  playCurrent()
}

watch(
  () => props.items.map((x) => x.id).join(','),
  () => {
    seedMarks()
    loadMarks()
    jumpStart()
  },
)

onMounted(() => {
  seedMarks()
  loadMarks()
  jumpStart()
})
</script>

<style scoped lang="scss">
.dy-feed {
  position: relative;
  flex: 1;
  min-height: 0;
  height: 100%;
  background: #050506;
}

.dy-feed.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  z-index: 80;
  padding-top: var(--app-header-top, 0px);
  background: #050506;

  .unmute {
    top: 10px;
    right: 12px;
  }
}

.back {
  position: absolute;
  top: calc(var(--app-header-top, 12px) + 8px);
  left: 10px;
  z-index: 5;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  display: grid;
  place-items: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

.scroller {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  overscroll-behavior: contain;
}

.slide {
  position: relative;
  height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}

.trial-cover {
  position: absolute;
  inset: 0;
  z-index: 8;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
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

.stage {
  position: absolute;
  inset: 0;
  background: #000;

  :deep(.poster),
  :deep(img) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  :deep(.media) {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.unmute,
.play-ico {
  position: absolute;
  border: 0;
  color: #fff;
}

.unmute {
  top: 12px;
  right: 12px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px 0 10px;
  border-radius: 999px;
  background: rgba(20, 20, 24, 0.72);
  font-size: 12px;

  svg {
    width: 16px;
    height: 16px;
  }
}

.play-ico {
  left: 50%;
  top: 46%;
  z-index: 4;
  width: 64px;
  height: 64px;
  margin: -32px 0 0 -32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.28);

  svg {
    width: 42px;
    height: 42px;
  }
}

.side {
  position: absolute;
  right: 8px;
  bottom: 92px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.up {
  position: relative;
  width: 48px;
  height: 54px;
  margin-bottom: 2px;
}

.up-face {
  appearance: none;
  display: block;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #1a1a1f;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);

  :deep(.user-avatar) {
    display: block;
  }
}

.plus {
  appearance: none;
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 1;
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
  transform: translateX(-50%);
  border: 0;
  border-radius: 50%;
  background: #fe2c55;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  line-height: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

.side-btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.55);

  svg {
    width: 28px;
    height: 28px;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.45));
  }

  &.on {
    color: #ffd0df;
  }

  &.warn {
    color: #ffd36a;
  }
}

.info {
  position: absolute;
  left: 12px;
  right: 64px;
  bottom: 46px;
  z-index: 3;
  color: #fff;
}

.vip {
  display: inline-flex;
  align-items: center;
  height: 28px;
  margin-bottom: 8px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff5c93, #c45cff);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.name {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;

  &.link {
    cursor: pointer;
  }
}

.desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  &.dim {
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.72);
    -webkit-line-clamp: 1;
  }
}

.stats {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
}

.chips {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    font-size: 11px;
  }
}

.progress {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 10px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 10px;

  input[type='range'] {
    flex: 1;
    height: 3px;
    accent-color: #ff5c93;
  }
}

.dy-empty {
  padding: 80px 20px;
  text-align: center;
  color: #8a8a94;
  font-size: 13px;
}
</style>
