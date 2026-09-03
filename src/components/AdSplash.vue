<template>
  <div v-if="visible && list.length" class="ad-splash" @click.stop>
    <div
      ref="track"
      class="hero-track"
      @scroll.passive="onScroll"
      @scrollend="settleClone"
    >
      <div v-for="(item, i) in slides" :key="`${item.creative_id}-${i}`" class="hero-slide">
        <AdImage :ad="item" :mark="false" />
      </div>
    </div>
    <form class="gate" @submit.prevent="onEnter" @click.stop>
      <p class="gate-title">安全验证</p>
      <button type="button" class="pic" :disabled="picBusy" @click.stop="loadCaptcha">
        <img v-if="image" :src="image" alt="验证码" />
        <span v-else>{{ picBusy ? '加载中' : '点击刷新' }}</span>
      </button>
      <p class="gate-hint">看不清？点图换一张</p>
      <input
        v-model="code"
        type="text"
        maxlength="4"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        placeholder="请输入验证码"
      />
    </form>
    <button
      type="button"
      class="enter"
      :disabled="left > 0 || busy"
      @click.stop="onEnter"
    >
      {{ left > 0 ? `${left}s` : '进入' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { showToast } from 'vant'
import { fetchCaptcha, verifyCaptcha } from '@/api/captcha'
import { AD_SLOT, type AdItem } from '@/api/ads'
import AdImage from '@/components/AdImage.vue'
import { useAdsStore } from '@/stores/ads'
import { toastError } from '@/utils/request'

const HOLD_MS = 2000
const SLIDE_MS = 1000

const adsStore = useAdsStore()
adsStore.splashOpen = true
const track = ref<HTMLElement>()
const visible = ref(false)
const left = ref(5)
const list = ref<AdItem[]>([])
const index = ref(0)
const captchaId = ref('')
const image = ref('')
const code = ref('')
const busy = ref(false)
const picBusy = ref(false)

const slides = computed(() =>
  list.value.length > 1 ? [...list.value, list.value[0]] : list.value,
)

let countTimer = 0
let slideTimer = 0
let anim = 0
let jumping = false
let sliding = false

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const atClone = () => {
  const el = track.value
  const n = list.value.length
  if (!el?.clientWidth || n <= 1) return false
  return el.scrollLeft >= n * el.clientWidth - 4
}

const onScroll = () => {
  const el = track.value
  if (sliding || jumping || !el?.clientWidth) return
  const n = list.value.length
  const i = Math.round(el.scrollLeft / el.clientWidth)
  index.value = n && i >= n ? n - 1 : i
}

const snapHome = (then?: () => void) => {
  const el = track.value
  if (!el) return
  jumping = true
  sliding = false
  window.cancelAnimationFrame(anim)
  el.style.scrollSnapType = 'none'
  el.style.scrollBehavior = 'auto'
  el.scrollTo({ left: 0, behavior: 'auto' })
  index.value = 0
  requestAnimationFrame(() => {
    el.style.scrollSnapType = ''
    el.style.scrollBehavior = ''
    jumping = false
    then?.()
  })
}

const settleClone = () => {
  if (sliding || jumping) return
  if (atClone()) snapHome()
}

const scrollToIndex = (next: number) => {
  const el = track.value
  if (!el?.clientWidth) return
  window.cancelAnimationFrame(anim)
  sliding = true
  const from = el.scrollLeft
  const to = next * el.clientWidth
  const started = performance.now()
  el.style.scrollSnapType = 'none'
  const step = (now: number) => {
    const t = Math.min(1, (now - started) / SLIDE_MS)
    el.scrollLeft = from + (to - from) * easeInOut(t)
    if (t < 1) {
      anim = requestAnimationFrame(step)
      return
    }
    sliding = false
    const n = list.value.length
    if (next >= n) {
      adsStore.impression(list.value[0])
      snapHome(() => scheduleNext())
      return
    }
    el.style.scrollSnapType = ''
    adsStore.impression(list.value[next])
    scheduleNext()
  }
  anim = requestAnimationFrame(step)
}

const goNext = () => {
  const el = track.value
  const n = list.value.length
  if (sliding || jumping || !el?.clientWidth || n <= 1) return
  const cur = Math.min(index.value, n - 1)
  const next = cur + 1
  if (next < n) index.value = next
  scrollToIndex(next)
}

const stopSlide = () => {
  window.clearTimeout(slideTimer)
  slideTimer = 0
}

const scheduleNext = (delay = HOLD_MS) => {
  stopSlide()
  if (list.value.length <= 1 || !visible.value) return
  slideTimer = window.setTimeout(goNext, delay)
}

const close = () => {
  visible.value = false
  adsStore.splashOpen = false
  window.clearInterval(countTimer)
  stopSlide()
  window.cancelAnimationFrame(anim)
}

const loadCaptcha = async () => {
  if (picBusy.value) return
  picBusy.value = true
  try {
    const data = await fetchCaptcha()
    captchaId.value = data.id
    image.value = data.image
    code.value = ''
  } catch (err) {
    captchaId.value = ''
    image.value = ''
    toastError(err)
  } finally {
    picBusy.value = false
  }
}

const onEnter = async () => {
  if (left.value > 0 || busy.value) return
  const text = code.value.trim()
  if (!text) {
    showToast('请输入验证码')
    return
  }
  if (!captchaId.value) {
    showToast('请先刷新验证码')
    await loadCaptcha()
    return
  }
  busy.value = true
  try {
    await verifyCaptcha(captchaId.value, text)
    close()
  } catch (err) {
    toastError(err)
    code.value = ''
    await loadCaptcha()
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  await adsStore.load(AD_SLOT.splash, 10)
  const hits = adsStore.listOf(AD_SLOT.splash)
  if (!hits.length) {
    adsStore.splashOpen = false
    return
  }
  list.value = hits
  visible.value = true
  adsStore.splashOpen = true
  adsStore.impression(hits[0])
  countTimer = window.setInterval(() => {
    if (left.value <= 1) {
      left.value = 0
      window.clearInterval(countTimer)
      return
    }
    left.value -= 1
  }, 1000)
  await nextTick()
  scheduleNext()
  loadCaptcha()
})

onUnmounted(() => {
  window.clearInterval(countTimer)
  stopSlide()
  window.cancelAnimationFrame(anim)
  adsStore.splashOpen = false
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.ad-splash {
  position: fixed;
  inset: 0;
  z-index: 1120;
  background: #0b0b0d;
  overflow: hidden;
}

.hero-track {
  display: flex;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.hero-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  scroll-snap-align: start;

  :deep(.ad-image) {
    width: 100%;
    height: 100%;
  }
}

.gate {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: min(248px, calc(100% - 56px));
  padding: 16px 14px 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  background: rgba(12, 10, 16, 0.92);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(18px);
  transform: translate(-50%, -50%);
}

.gate-title {
  margin: 0 0 2px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  text-align: center;
}

.gate-hint {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 11px;
  line-height: 1;
  text-align: center;
}

.gate input {
  width: 100%;
  height: 44px;
  border: 1px solid rgba(255, 92, 147, 0.38);
  border-radius: 12px;
  padding: 0 12px;
  background: #191920;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 8px;
  text-align: center;

  &::placeholder {
    color: rgba(255, 255, 255, 0.42);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0;
  }
}

.pic {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 72px;
  border: 0;
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
  background: #f4f0e8;
  color: #6e6e78;
  font-size: 12px;

  &:disabled {
    opacity: 0.7;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #f4f0e8;
  }
}

.enter {
  position: absolute;
  right: 12px;
  top: calc(12px + env(safe-area-inset-top, 0px));
  z-index: 2;
  min-width: 52px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  padding: 6px 12px;

  &:disabled {
    opacity: 0.85;
  }
}

@media (min-width: $desktop-preview-min) {
  .ad-splash {
    left: 50%;
    right: auto;
    width: 100%;
    max-width: $phone-max-width;
    transform: translateX(-50%);
  }
}
</style>
