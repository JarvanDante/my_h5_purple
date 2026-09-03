<template>
  <div class="reader">
    <header v-show="chrome" class="top" @click.stop>
      <button type="button" class="icon-btn" aria-label="返回" @click="back">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1>第{{ seq }}话</h1>
      <button type="button" class="icon-btn" aria-label="刷新" @click="reload">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M20 12a8 8 0 1 1-2.2-5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          <path d="M20 5v5h-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </header>

    <div ref="rootRef" class="scroll" @click="toggleChrome">
      <p v-if="!pics.length && !showVipGate" class="empty">{{ empty }}</p>
      <div v-else-if="!pics.length && showVipGate" class="vip-gate">
        <h3>开通VIP 畅看全集</h3>
        <p>免广告 · 无限观看</p>
        <button type="button" @click.stop="goVip">开通会员</button>
      </div>
      <template v-for="(pic, i) in pics" :key="pic.url + i">
        <EncryptedImage :src="pic.url" class="pic" alt="" :data-index="i" draggable="false" />
        <div v-if="i === midVipIndex && showVipGate" class="vip-gate">
          <h3>开通VIP 畅看全集</h3>
          <p>免广告 · 无限观看</p>
          <button type="button" @click.stop="goVip">开通会员</button>
        </div>
      </template>
    </div>

    <footer v-show="chrome" class="bar" @click.stop>
      <div class="progress">
        <span>{{ page }}</span>
        <input
          type="range"
          min="1"
          :max="Math.max(pics.length, 1)"
          :value="page"
          :disabled="!pics.length"
          @input="onSeek"
        />
        <span>{{ pics.length }}</span>
      </div>
      <div class="actions">
        <button type="button" class="act" @click="catalogOpen = true">
          <span class="act-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 7h14M5 12h14M5 17h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          目录
        </button>
        <button type="button" class="act" :class="{ on: auto }" @click="toggleAuto">
          <span class="act-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 6.5v11l10-5.5L8 6.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
            </svg>
          </span>
          自动翻
        </button>
      </div>
    </footer>

    <div v-if="catalogOpen" class="drawer-mask" @click.stop="catalogOpen = false">
      <aside class="drawer" @click.stop>
        <div class="drawer-head">
          <strong class="ellipsis">{{ comicTitle || '目录' }}</strong>
          <button type="button" class="sort-btn" @click="asc = !asc">
            <span>{{ asc ? '1' : 'N' }}</span>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M8 8.5 12 4.5 16 8.5M8 15.5 12 19.5 16 15.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <div class="drawer-list">
          <button
            v-for="ch in sortedChapters"
            :key="ch.id"
            type="button"
            class="drawer-item"
            :class="{ current: ch.id === chapterId, lock: !ch.playable }"
            @click="openChapter(ch)"
          >
            <span class="thumb">
              <EncryptedImage v-if="cover" :src="cover" alt="" />
            </span>
            <span class="name">第{{ String(ch.seq).padStart(2, '0') }}话</span>
            <span class="go" :class="{ last: ch.id === chapterId }">
              {{ ch.id === chapterId ? '上次' : ch.playable ? '观看' : '锁' }}
            </span>
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import {
  fetchComicsChapters,
  fetchComicsDetail,
  readChapter,
  type ChapterItem,
} from '@/api/comics'
import EncryptedImage from '@/components/EncryptedImage.vue'
import { useUserStore } from '@/stores/user'
import { comicPath, comicReadPath, routeId } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isVip = computed(() => userStore.isVip)
const needVip = ref(false)
const showVipGate = computed(() => !isVip.value && needVip.value)
const rootRef = ref<HTMLElement | null>(null)
const chrome = ref(true)
const empty = ref('加载中…')
const pics = ref<{ url: string }[]>([])
const title = ref('')
const comicTitle = ref('')
const cover = ref('')
const chapters = ref<ChapterItem[]>([])
const catalogOpen = ref(false)
const page = ref(1)
const auto = ref(false)
const asc = ref(false)
let observer: IntersectionObserver | null = null
let autoTimer = 0

const chapterId = computed(() => routeId(route.params.chapterId))
const seq = computed(() => {
  const hit = chapters.value.find((c) => c.id === chapterId.value)
  if (hit?.seq) return hit.seq
  const m = title.value.match(/第\s*(\d+)\s*话/)
  return m ? Number(m[1]) : 1
})
const midVipIndex = computed(() => {
  if (!showVipGate.value || pics.value.length < 4) return -1
  return Math.floor(pics.value.length / 2) - 1
})
const sortedChapters = computed(() => {
  const list = [...chapters.value]
  list.sort((a, b) => (asc.value ? a.seq - b.seq : b.seq - a.seq))
  return list
})

const bindObserver = async () => {
  observer?.disconnect()
  await nextTick()
  const root = rootRef.value
  if (!root) return
  observer = new IntersectionObserver(
    (entries) => {
      const vis = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!vis) return
      const i = Number((vis.target as HTMLElement).dataset.index)
      if (!Number.isNaN(i)) page.value = i + 1
    },
    { root, threshold: [0.35, 0.6] },
  )
  root.querySelectorAll<HTMLElement>('.pic').forEach((el) => observer?.observe(el))
}

const load = async () => {
  empty.value = '加载中…'
  pics.value = []
  page.value = 1
  const data = await readChapter(chapterId.value)
  title.value = data.title
  pics.value = (data.pics || []).map((p) => ({ ...p, url: mediaUrl(p.url) }))
  if (!pics.value.length) empty.value = '本章暂无图片'
  const comicId = routeId(route.params.id)
  if (comicId) {
    const [cat, detail] = await Promise.all([
      fetchComicsChapters(comicId),
      fetchComicsDetail(comicId).catch(() => null),
    ])
    chapters.value = cat.list || []
    comicTitle.value = cat.title || detail?.title || ''
    needVip.value = Boolean(detail?.need_vip || detail?.is_vip)
    if (detail?.cover) cover.value = mediaUrl(detail.cover)
  }
  await bindObserver()
  rootRef.value?.scrollTo({ top: 0 })
}

const reload = () => {
  load().catch(toastError)
}

const toggleChrome = () => {
  if (catalogOpen.value) return
  chrome.value = !chrome.value
}

const onSeek = (e: Event) => {
  const i = Number((e.target as HTMLInputElement).value) - 1
  const el = rootRef.value?.querySelectorAll<HTMLElement>('.pic')[i]
  el?.scrollIntoView({ behavior: 'auto', block: 'start' })
  page.value = i + 1
}

const stopAuto = () => {
  auto.value = false
  if (autoTimer) {
    window.clearInterval(autoTimer)
    autoTimer = 0
  }
}

const toggleAuto = () => {
  if (auto.value) {
    stopAuto()
    return
  }
  auto.value = true
  chrome.value = false
  autoTimer = window.setInterval(() => {
    const el = rootRef.value
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      stopAuto()
      chrome.value = true
      return
    }
    el.scrollBy({ top: 2 })
  }, 16)
}

const openChapter = (ch: ChapterItem) => {
  if (!ch.playable) {
    if (needVip.value) {
      goVip()
      return
    }
    showToast('请先解锁该话')
    return
  }
  catalogOpen.value = false
  stopAuto()
  router.replace(comicReadPath(routeId(route.params.id), ch.id))
}

const goVip = () => {
  stopAuto()
  router.push('/vip')
}

const back = () => {
  stopAuto()
  const prev = typeof window.history.state?.back === 'string' ? window.history.state.back : ''
  if (prev && prev !== route.fullPath) {
    router.back()
    return
  }
  router.replace(comicPath(routeId(route.params.id)))
}

watch(
  chapterId,
  () => {
    load().catch((err) => {
      const msg = err instanceof Error ? err.message : '无法阅读'
      empty.value = msg
      if (/会员|VIP|开通/i.test(msg)) needVip.value = true
      toastError(err)
    })
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopAuto()
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.reader {
  position: relative;
  height: 100%;
  overflow: hidden;
  background: #1c1c24;
  color: #fff;
}

.scroll {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior-x: none;
  padding-bottom: 88px;
}

.top,
.bar {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 8;
  background: rgba(20, 16, 28, 0.88);
}

.top {
  top: 0;
  height: calc(42px + var(--app-header-top));
  padding: var(--app-header-top) 6px 0;
  display: flex;
  align-items: center;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

h1 {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
}

.empty {
  padding: 72px 16px;
  text-align: center;
  color: #9aa;
}

.pic,
:deep(.pic) {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  background: #111;
}

.vip-gate {
  margin: 16px;
  padding: 28px 20px;
  border-radius: 12px;
  background: #16161c;
  text-align: center;

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 800;
  }

  p {
    margin: 0 0 16px;
    color: #8c8c9c;
    font-size: 13px;
  }

  button {
    height: 40px;
    padding: 0 28px;
    border: 0;
    border-radius: 20px;
    background: linear-gradient(90deg, #ff5c93, #ff8a5c);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }
}

.bar {
  bottom: 0;
  padding: 8px 16px calc(10px + env(safe-area-inset-bottom, 0px));
}

.progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ddd;

  input {
    flex: 1;
    accent-color: #ffd84d;
  }
}

.actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 56px;
  margin-top: 12px;
}

.act {
  border: 0;
  background: transparent;
  color: #f2f2f5;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  &.on {
    color: #ffd84d;
  }
}

.act-ico {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
}

.act.on .act-ico {
  background: rgba(255, 216, 77, 0.18);
}

.drawer-mask {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.45);
}

.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(82%, 320px);
  background: #fff;
  color: #1a1a1f;
  display: flex;
  flex-direction: column;
  animation: slide-in 0.22s ease;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-head {
  flex-shrink: 0;
  height: 48px;
  padding: 0 12px 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1ecee;

  strong {
    flex: 1;
    min-width: 0;
    font-size: 15px;
    font-weight: 700;
  }
}

.sort-btn {
  width: 36px;
  height: 32px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  font-size: 12px;
  font-weight: 700;

  svg {
    width: 14px;
    height: 14px;
  }
}

.drawer-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.drawer-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 12px;
  border: 0;
  border-bottom: 1px solid #f4f0f2;
  background: #fff;
  text-align: left;
}

.thumb {
  width: 40px;
  height: 52px;
  border-radius: 4px;
  overflow: hidden;
  background: #f1ecee;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
}

.go {
  flex-shrink: 0;
  height: 26px;
  padding: 0 12px;
  border-radius: 13px;
  border: 1px solid #e07a2f;
  color: #e07a2f;
  font-size: 12px;
  line-height: 24px;
}

.drawer-item.current .name {
  color: #e07a2f;
}

.drawer-item.lock .name {
  color: #bbb;
}

.go.last {
  background: #fff1e4;
}
</style>
