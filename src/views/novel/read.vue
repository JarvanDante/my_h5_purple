<template>
  <div class="reader">
    <header v-show="chrome" class="top" @click.stop>
      <button type="button" class="icon-btn" aria-label="返回" @click="back">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <h1>{{ headTitle }}</h1>
      <button type="button" class="icon-btn" aria-label="字号" @click="cycleFont">
        <span class="font-ico">A</span>
      </button>
    </header>

    <div ref="rootRef" class="scroll" @click="toggleChrome">
      <p v-if="!paragraphs.length && !showVipGate" class="empty">{{ empty }}</p>
      <div v-else-if="!paragraphs.length && showVipGate" class="vip-gate">
        <h3>开通VIP 畅看全集</h3>
        <p>免广告 · 无限观看</p>
        <button type="button" @click.stop="goVip">开通会员</button>
      </div>
      <article v-else class="article" :style="{ fontSize: `${fontSize}px` }">
        <h2>{{ chapterTitle }}</h2>
        <p v-if="wordCount" class="words">{{ wordCount }}字</p>
        <audio v-if="audioUrl" class="audio" :src="audioUrl" controls @click.stop />
        <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
        <div v-if="showVipGate" class="vip-gate">
          <h3>开通VIP 畅看全集</h3>
          <p>免广告 · 无限观看</p>
          <button type="button" @click.stop="goVip">开通会员</button>
        </div>
      </article>
    </div>

    <footer v-show="chrome" class="bar" @click.stop>
      <div class="actions">
        <button type="button" class="act" :disabled="!prevId" @click="goChapter(prevId)">上一章</button>
        <button type="button" class="act" @click="catalogOpen = true">
          <span class="act-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 7h14M5 12h14M5 17h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </span>
          目录
        </button>
        <button type="button" class="act" :disabled="!nextId" @click="goChapter(nextId)">下一章</button>
      </div>
    </footer>

    <div v-if="vipPromptOpen" class="vip-mask" @click.stop>
      <div class="vip-pop">
        <button type="button" class="vip-x" aria-label="关闭" @click.stop="vipPromptOpen = false">×</button>
        <h3>开通VIP 畅看全集</h3>
        <p>免广告 · 无限观看</p>
        <button type="button" class="vip-go" @click.stop="goVip">立即充值</button>
      </div>
    </div>

    <div v-if="catalogOpen" class="drawer-mask" @click.stop="catalogOpen = false">
      <aside class="drawer" @click.stop>
        <div class="drawer-head">
          <strong class="ellipsis">{{ novelTitle || '目录' }}</strong>
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
            <span class="thumb" :style="coverSrc ? { backgroundImage: `url(${coverSrc})` } : undefined" />
            <span class="name">{{ chapterName(ch) }}</span>
            <span class="go" :class="{ last: ch.id === chapterId }">
              {{ ch.id === chapterId ? '上次' : ch.playable ? '阅读' : '锁' }}
            </span>
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import {
  chapterName,
  fetchNovelChapters,
  fetchNovelDetail,
  readNovelChapter,
  type NovelChapter,
} from '@/api/novel'
import { useEncryptedSrc } from '@/composables/useEncryptedSrc'
import { useUserStore } from '@/stores/user'
import { novelPath, novelReadPath, routeId } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

const FONT_KEY = 'h5_novel_font'
const FONT_STEPS = [16, 18, 20]

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isVip = computed(() => userStore.isVip)
const needVip = ref(false)
const showVipGate = computed(() => !isVip.value && needVip.value)
const vipPromptOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const chrome = ref(true)
const empty = ref('加载中…')
const content = ref('')
const chapterTitle = ref('')
const novelTitle = ref('')
const cover = ref('')
const coverSrc = useEncryptedSrc(cover)
const chapters = ref<NovelChapter[]>([])
const catalogOpen = ref(false)
const wordCount = ref(0)
const audioUrl = ref('')
const prevId = ref(0)
const nextId = ref(0)
const asc = ref(true)
const fontSize = ref(Number(localStorage.getItem(FONT_KEY)) || 18)

const chapterId = computed(() => routeId(route.params.chapterId))
const headTitle = computed(() => {
  const hit = chapters.value.find((c) => c.id === chapterId.value)
  if (hit) return chapterName(hit)
  return chapterTitle.value || '阅读'
})
const paragraphs = computed(() =>
  content.value
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean),
)
const sortedChapters = computed(() => {
  const list = [...chapters.value]
  list.sort((a, b) => (asc.value ? a.seq - b.seq : b.seq - a.seq))
  return list
})

const load = async () => {
  empty.value = '加载中…'
  content.value = ''
  audioUrl.value = ''
  const data = await readNovelChapter(chapterId.value)
  chapterTitle.value = data.title || chapterName({ seq: data.seq, title: data.title })
  content.value = data.content || ''
  wordCount.value = data.word_count || 0
  audioUrl.value = mediaUrl(data.audio_url)
  prevId.value = data.prev_id || 0
  nextId.value = data.next_id || 0
  if (!content.value) empty.value = '本章暂无正文'
  const novelId = routeId(route.params.id) || data.novel_id
  if (novelId) {
    const [cat, detail] = await Promise.all([
      fetchNovelChapters(novelId),
      fetchNovelDetail(novelId).catch(() => null),
    ])
    chapters.value = cat.list || []
    novelTitle.value = cat.title || detail?.title || ''
    needVip.value = Boolean(detail?.need_vip || detail?.is_vip)
    if (detail?.cover) cover.value = mediaUrl(detail.cover)
  }
  rootRef.value?.scrollTo({ top: 0 })
}

const cycleFont = () => {
  const i = FONT_STEPS.indexOf(fontSize.value)
  fontSize.value = FONT_STEPS[(i + 1) % FONT_STEPS.length]
  localStorage.setItem(FONT_KEY, String(fontSize.value))
}

const toggleChrome = () => {
  if (catalogOpen.value) return
  chrome.value = !chrome.value
}

const goChapter = (id: number) => {
  if (!id) return
  router.replace(novelReadPath(routeId(route.params.id), id))
}

const openChapter = (ch: NovelChapter) => {
  if (!ch.playable) {
    if (needVip.value) {
      goVip()
      return
    }
    showToast('请先解锁该章')
    return
  }
  catalogOpen.value = false
  goChapter(ch.id)
}

const goVip = () => {
  router.push('/vip')
}

const back = () => {
  const prev = typeof window.history.state?.back === 'string' ? window.history.state.back : ''
  if (prev && prev !== route.fullPath) {
    router.back()
    return
  }
  router.replace(novelPath(routeId(route.params.id)))
}

watch(isVip, (vip) => {
  if (vip) vipPromptOpen.value = false
})

watch(
  chapterId,
  () => {
    vipPromptOpen.value = !isVip.value
    load().catch((err) => {
      const msg = err instanceof Error ? err.message : '无法阅读'
      empty.value = msg
      if (/会员|VIP|开通/i.test(msg)) needVip.value = true
      toastError(err)
    })
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.reader {
  position: relative;
  height: 100%;
  overflow: hidden;
  background: #16141c;
  color: #efe8dc;
}

.scroll {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior-x: none;
  padding: calc(52px + var(--app-header-top)) 18px 96px;
}

.article {
  max-width: 42em;
  margin: 0 auto;
  line-height: 1.9;
  letter-spacing: 0.02em;

  h2 {
    margin: 0 0 6px;
    font-size: 1.15em;
    font-weight: 700;
    color: #fff7ea;
  }

  .words {
    margin: 0 0 16px;
    font-size: 12px;
    color: #8c8478;
  }

  .audio {
    display: block;
    width: 100%;
    margin-bottom: 16px;
  }

  p {
    margin: 0 0 1em;
    text-indent: 2em;
  }
}

.top,
.bar {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 8;
  background: rgba(20, 16, 28, 0.92);
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

.font-ico {
  font-size: 16px;
  font-weight: 800;
}

h1 {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.empty {
  padding: 72px 16px;
  text-align: center;
  color: #9aa;
}

.vip-gate {
  margin: 28px 0;
  padding: 24px 16px;
  border-radius: 12px;
  background: #1d1a24;
  text-align: center;

  h3 {
    margin: 0 0 8px;
    font-size: 16px;
  }

  p {
    margin: 0 0 16px;
    color: #8c8c9c;
    font-size: 13px;
    text-indent: 0;
  }

  button {
    height: 40px;
    padding: 0 28px;
    border: 0;
    border-radius: 20px;
    background: linear-gradient(90deg, $primary-color, #ff8a5c);
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }
}

.vip-mask {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.vip-pop {
  position: relative;
  width: min(78vw, 300px);
  padding: 32px 22px 24px;
  border-radius: 14px;
  background: #16161c;
  text-align: center;
  color: #fff;

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 800;
  }

  p {
    margin: 0 0 18px;
    color: #8c8c9c;
    font-size: 13px;
  }
}

.vip-x {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  background: transparent;
  color: #fff;
  font-size: 18px;
  line-height: 1;
}

.vip-go {
  height: 40px;
  padding: 0 28px;
  border: 0;
  border-radius: 20px;
  background: linear-gradient(90deg, $primary-color, #ff8a5c);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.bar {
  bottom: 0;
  padding: 8px 16px calc(10px + env(safe-area-inset-bottom, 0px));
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.act {
  border: 0;
  background: transparent;
  color: #f2f2f5;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  &:disabled {
    color: #666;
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
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
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
