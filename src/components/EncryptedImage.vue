<template>
  <img v-if="displaySrc" ref="el" :src="displaySrc" v-bind="$attrs" />
  <div v-else-if="lazy" ref="el" class="enc-lazy" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { resolveMediaSrc } from '@/utils/aesbnc'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src?: string
    lazy?: boolean
    root?: HTMLElement | null
  }>(),
  { lazy: false, root: null },
)

const el = ref<HTMLElement | null>(null)
const displaySrc = ref('')
let io: IntersectionObserver | null = null
let seq = 0

const stopObserve = () => {
  io?.disconnect()
  io = null
}

const load = async (url: string) => {
  const n = ++seq
  try {
    const src = await resolveMediaSrc(url)
    if (n === seq) displaySrc.value = src
  } catch {
    if (n === seq) displaySrc.value = ''
  }
}

const bind = async () => {
  stopObserve()
  const url = props.src
  if (!url) {
    displaySrc.value = ''
    return
  }
  if (!props.lazy) {
    await load(url)
    return
  }
  await nextTick()
  const node = el.value
  if (!node) {
    await load(url)
    return
  }
  io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      stopObserve()
      load(url)
    },
    {
      root: props.root || null,
      rootMargin: '240px 0px 1600px 0px',
      threshold: 0.01,
    },
  )
  io.observe(node)
}

watch(
  () => [props.src, props.lazy, props.root] as const,
  () => {
    displaySrc.value = ''
    bind()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  seq += 1
  stopObserve()
})
</script>

<style scoped>
img,
.enc-lazy {
  display: block;
  width: 100%;
  max-width: 100%;
}

.enc-lazy {
  min-height: 72vh;
  background: #111;
}
</style>
