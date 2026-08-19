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
      <p v-if="!pics.length" class="empty">{{ empty }}</p>
      <img
        v-for="(pic, i) in pics"
        :key="pic.url + i"
        :src="pic.url"
        class="pic"
        alt=""
        :data-index="i"
        draggable="false"
      />
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
          <span class="act-ico">☰</span>
          目录
        </button>
        <button type="button" class="act" :class="{ on: auto }" @click="toggleAuto">
          <span class="act-ico">▶</span>
          自动翻
        </button>
      </div>
    </footer>

    <div v-if="catalogOpen" class="sheet-mask" @click.stop="catalogOpen = false">
      <div class="sheet" @click.stop>
        <div class="sheet-head">
          <strong>目录</strong>
          <button type="button" @click="catalogOpen = false">关闭</button>
        </div>
        <button
          v-for="ch in chapters"
          :key="ch.id"
          type="button"
          class="sheet-item"
          :class="{ current: ch.id === chapterId, lock: !ch.playable }"
          @click="openChapter(ch)"
        >
          第{{ ch.seq }}话
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { fetchComicsChapters, readChapter, type ChapterItem } from '@/api/comics'
import { toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const rootRef = ref<HTMLElement | null>(null)
const chrome = ref(true)
const empty = ref('加载中…')
const pics = ref<{ url: string }[]>([])
const title = ref('')
const chapters = ref<ChapterItem[]>([])
const catalogOpen = ref(false)
const page = ref(1)
const auto = ref(false)
let observer: IntersectionObserver | null = null
let autoTimer = 0

const chapterId = computed(() => Number(route.params.chapterId))
const seq = computed(() => {
  const hit = chapters.value.find((c) => c.id === chapterId.value)
  if (hit?.seq) return hit.seq
  const m = title.value.match(/第\s*(\d+)\s*话/)
  return m ? Number(m[1]) : 1
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
  pics.value = data.pics || []
  if (!pics.value.length) empty.value = '本章暂无图片'
  const comicId = Number(route.params.id)
  if (comicId && !chapters.value.length) {
    const cat = await fetchComicsChapters(comicId)
    chapters.value = cat.list || []
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
    showToast('请先解锁该话')
    return
  }
  catalogOpen.value = false
  stopAuto()
  router.replace(`/comic/${route.params.id}/read/${ch.id}`)
}

const back = () => {
  stopAuto()
  router.replace(`/comic/${route.params.id}`)
}

watch(
  chapterId,
  () => {
    load().catch((err) => {
      empty.value = err instanceof Error ? err.message : '无法阅读'
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
  background: rgba(28, 16, 40, 0.92);
}

.top {
  top: 0;
  height: calc(46px + env(safe-area-inset-top, 0px));
  padding: env(safe-area-inset-top, 0px) 6px 0;
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

.pic {
  display: block;
  width: 100%;
  user-select: none;
  -webkit-user-drag: none;
  background: #111;
}

.bar {
  bottom: 0;
  padding: 8px 14px calc(10px + env(safe-area-inset-bottom, 0px));
}

.progress {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #ddd;

  input {
    flex: 1;
    accent-color: #f2c14b;
  }
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.act {
  border: 0;
  background: transparent;
  color: #eee;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;

  &.on {
    color: #f2c14b;
  }
}

.act-ico {
  width: 22px;
  height: 22px;
  border: 1px solid currentColor;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}

.sheet-mask {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  max-height: 70%;
  overflow: auto;
  background: #2a2130;
  border-radius: 14px 14px 0 0;
  padding: 12px 12px calc(12px + env(safe-area-inset-bottom, 0px));
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  button {
    border: 0;
    background: transparent;
    color: #bbb;
  }
}

.sheet-item {
  width: 100%;
  height: 44px;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  color: #eee;
  text-align: left;

  &.current {
    color: #f2c14b;
  }

  &.lock {
    color: #777;
  }
}
</style>
