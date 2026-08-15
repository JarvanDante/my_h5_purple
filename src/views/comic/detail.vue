<template>
  <div class="page-shell sub-page">
    <PageHeader :title="item?.title || '作品详情'" />
    <div class="hero" :class="`tone-${tone}`" />
    <section v-if="item" class="info">
      <h2>{{ item.title }}</h2>
      <p>{{ item.author }} · {{ item.view_count }}阅读 · {{ item.chapter_count }}话</p>
      <div class="tags">
        <span v-if="item.is_vip">VIP</span>
        <span v-if="item.price">{{ item.price }}金币</span>
        <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
      </div>
      <p class="intro">{{ item.intro }}</p>
      <p v-if="item.reason" class="reason">{{ item.reason }}</p>
      <button v-if="item.need_pay" type="button" class="read-btn" @click="buy">购买整部</button>
      <button v-else type="button" class="read-btn" @click="startFirst">开始阅读</button>
    </section>
    <section class="chapters">
      <h3>目录</h3>
      <button
        v-for="ch in chapters"
        :key="ch.id"
        type="button"
        class="chapter"
        :class="{ lock: !ch.playable }"
        @click="openChapter(ch)"
      >
        {{ ch.title }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { buyComics, fetchComicsChapters, fetchComicsDetail, type ChapterItem, type ComicsDetail } from '@/api/comics'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const item = ref<ComicsDetail | null>(null)
const chapters = ref<ChapterItem[]>([])
const tone = computed(() => (item.value?.id || 0) % 6)

const load = async () => {
  const id = Number(route.params.id)
  const [d, c] = await Promise.all([fetchComicsDetail(id), fetchComicsChapters(id)])
  item.value = d
  chapters.value = c.list || []
}

const buy = async () => {
  if (!item.value) return
  try {
    const res = await buyComics(item.value.id)
    await userStore.refresh()
    showToast(`购买成功，余额 ${res.balance}`)
    await load()
  } catch (err) {
    toastError(err)
  }
}

const openChapter = (ch: ChapterItem) => {
  if (!ch.playable) {
    showToast(item.value?.need_vip ? '请先开通 VIP' : '请先购买')
    return
  }
  router.push(`/comic/${route.params.id}/read/${ch.id}`)
}

const startFirst = () => {
  const first = chapters.value.find((c) => c.playable) || chapters.value[0]
  if (first) openChapter(first)
}

onMounted(() => {
  load().catch(toastError)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.hero {
  height: 180px;
}

.tone-0 { background: linear-gradient(160deg, #d9c7ee, #8a6bb3); }
.tone-1 { background: linear-gradient(160deg, #c7d8ee, #6b8ab3); }
.tone-2 { background: linear-gradient(160deg, #eec7d4, #b36b86); }
.tone-3 { background: linear-gradient(160deg, #c7eee0, #6bb39a); }
.tone-4 { background: linear-gradient(160deg, #eee3c7, #b39a6b); }
.tone-5 { background: linear-gradient(160deg, #c7e4ee, #6ba0b3); }

.info,
.chapters {
  background: #fff;
  padding: 16px;
}

h2 {
  font-size: 18px;
}

.info p {
  margin-top: 6px;
  color: #888;
  font-size: 12px;
}

.intro {
  color: #555 !important;
  line-height: 1.6;
}

.reason {
  color: #c2410c !important;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;

  span {
    background: #f3ecfb;
    color: $primary-color;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 10px;
  }
}

.read-btn {
  width: 100%;
  height: 40px;
  margin-top: 14px;
  border: 0;
  border-radius: 20px;
  background: $primary-color;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.chapters {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  h3 {
    grid-column: 1 / -1;
    font-size: 14px;
    margin-bottom: 4px;
  }
}

.chapter {
  height: 36px;
  border: 1px solid #eee;
  background: #fafafa;
  border-radius: 6px;
  font-size: 12px;
  color: #333;

  &.lock {
    color: #bbb;
  }
}
</style>
