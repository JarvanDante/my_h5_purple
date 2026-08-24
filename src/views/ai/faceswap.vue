<template>
  <div class="page-shell sub-page face-list">
    <header class="bar">
      <button type="button" class="back" aria-label="返回" @click="back">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M15 5 8 12l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <div class="modes">
        <button type="button" class="on">AI图片换脸</button>
        <button type="button" @click="soon('视频换脸')">AI视频换脸</button>
      </div>
      <button type="button" class="pill" @click="router.push('/ai/works')">我的作品</button>
    </header>

    <nav v-if="cats.length > 1" class="cats">
      <button
        v-for="cat in cats"
        :key="cat"
        type="button"
        :class="{ on: cat === activeCat }"
        @click="activeCat = cat"
      >
        {{ cat }}
      </button>
    </nav>

    <div class="toolbar">
      <div>
        <strong>选择模板</strong>
        <span>点击后进行下一步</span>
      </div>
      <button type="button" class="ghost" @click="goMake()">自定义图片</button>
    </div>

    <section v-if="shown.length" class="grid">
      <button v-for="tpl in shown" :key="tpl.id" type="button" class="tpl" @click="goMake(tpl.id)">
        <em>{{ tpl.cost_gold }}金币</em>
        <EncryptedImage v-if="coverOf(tpl)" :src="coverOf(tpl)" alt="" />
        <span v-else class="ph">{{ tpl.name }}</span>
      </button>
    </section>
    <p v-else class="empty">还没有模板，先用「自定义图片」上传底图</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import {
  AI_BIZ_FACE_SWAP,
  fetchAiTemplates,
  templateCategories,
  templateTargetUrl,
  type AiTemplate,
} from '@/api/aitask'
import { toastError } from '@/utils/request'

defineOptions({ name: 'AiFaceSwap' })

const router = useRouter()
const list = ref<AiTemplate[]>([])
const activeCat = ref('精选推荐')

const withCover = computed(() => list.value.filter((tpl) => Boolean(coverOf(tpl))))

const cats = computed(() => {
  const set = new Set<string>(['精选推荐'])
  for (const tpl of withCover.value) {
    for (const cat of templateCategories(tpl)) set.add(cat)
  }
  return [...set]
})

const shown = computed(() => {
  if (activeCat.value === '精选推荐') {
    const featured = withCover.value.filter((tpl) => templateCategories(tpl).includes('精选推荐'))
    return featured.length ? featured : withCover.value
  }
  return withCover.value.filter((tpl) => templateCategories(tpl).includes(activeCat.value))
})

const coverOf = (tpl: AiTemplate) => templateTargetUrl(tpl)

const soon = (name: string) => showToast(`${name} 稍后接入`)

const back = () => {
  if (window.history.state?.back) router.back()
  else router.replace('/ai')
}

const goMake = (templateId?: number) => {
  router.push({
    path: '/ai/faceswap/make',
    query: templateId ? { template_id: String(templateId) } : {},
  })
}

onMounted(async () => {
  try {
    const data = await fetchAiTemplates(AI_BIZ_FACE_SWAP)
    list.value = data.list || []
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.face-list {
  padding-bottom: 24px;
}

.bar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: calc(46px + var(--app-header-top));
  padding: var(--app-header-top) 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  background: $background-page;
  box-shadow: 0 1px 0 rgba(255, 92, 147, 0.35);
}

.back {
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: $text-color;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
  }
}

.modes {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 14px;

  button {
    border: 0;
    background: transparent;
    color: $text-color-secondary;
    font-size: 14px;
    font-weight: 600;
    padding: 6px 0;
  }

  .on {
    color: $text-color;
    box-shadow: inset 0 -2px 0 $primary-color;
  }
}

.pill {
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: $radius-pill;
  background: $primary-color;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.cats {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  padding: 10px 14px 0;

  button {
    flex-shrink: 0;
    border: 0;
    background: transparent;
    color: $text-color-secondary;
    font-size: 13px;
    padding: 4px 0;
  }

  .on {
    color: $text-color;
    font-weight: 700;
    box-shadow: inset 0 -2px 0 $primary-color;
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 8px;

  strong {
    display: block;
    font-size: 15px;
  }

  span {
    font-size: 11px;
    color: $text-color-secondary;
  }
}

.ghost {
  height: 30px;
  padding: 0 12px;
  border: 1px solid $line;
  border-radius: $radius-pill;
  background: transparent;
  color: $text-color;
  font-size: 12px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;
}

.tpl {
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #16161c;
  min-height: 220px;

  em {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 1;
    padding: 2px 6px;
    border-radius: 6px;
    background: $danger-color;
    color: #fff;
    font-size: 11px;
    font-style: normal;
    font-weight: 700;
  }

  :deep(img) {
    width: 100%;
    height: 220px;
    object-fit: cover;
  }
}

.ph {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 220px;
  padding: 12px;
  color: $text-color-secondary;
  font-size: 14px;
}

.empty {
  padding: 40px 16px;
  text-align: center;
  color: $text-color-secondary;
  font-size: 13px;
}
</style>
