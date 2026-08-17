<template>
  <div class="page-shell">
    <header class="home-header">
      <div class="channel-row">
        <h1 class="site-name">星球</h1>
        <div class="channel-tabs">
          <button
            v-for="item in tabs"
            :key="item"
            type="button"
            class="sub-item"
            :class="{ active: tab === item }"
            @click="select(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </header>
    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab">
          <p v-if="!list.length" class="empty">暂无帖子，子后台「社区管理 → 帖子」审核通过后显示</p>
          <article v-for="post in list" :key="post.id" class="post soft-card" @click="goPost(post.id)">
            <div class="avatar" :class="`tone-${post.id % 5}`" />
            <div class="main">
              <h3>{{ post.title }}</h3>
              <p>{{ post.content }}</p>
              <img v-if="post.pics?.[0]" class="pic" :src="mediaUrl(post.pics[0])" alt="" />
              <div v-else class="pic" :class="`tone-${post.id % 5}`" />
              <div class="bar">
                <span>♡ {{ post.like_count }}</span>
                <span>💬 {{ post.comment_count }}</span>
              </div>
            </div>
          </article>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTabSlide } from '@/composables/useTabSlide'
import { fetchPostList, type PostItem } from '@/api/ops'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Planet' })

const router = useRouter()
const tabs = ['广场', '关注', '最新']
const slide = useTabSlide(tabs)
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const list = ref<PostItem[]>([])
const select = (item: string) => slide.select(item)

const load = () => {
  const sort = tab.value === '广场' || tab.value === '关注' ? 'hot' : 'new'
  fetchPostList(sort, 1, 20)
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
}

const goPost = (id: number) => {
  router.push(`/planet/${id}`)
}

watch(tab, load)
onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 60vh;
}

.home-header .channel-row {
  gap: 10px;
}

.home-header .site-name {
  font-size: 18px;
}

.post {
  display: flex;
  gap: 10px;
  margin-bottom: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.main {
  flex: 1;
  min-width: 0;

  h3 {
    font-size: 14px;
  }

  p {
    margin: 6px 0 8px;
    font-size: 14px;
    line-height: 1.5;
    color: #333;
  }
}

.empty {
  padding: 24px 12px;
  color: #999;
  font-size: 13px;
}

.pic {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.bar {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #999;
  font-size: 12px;
}

@include media-tones;
</style>
