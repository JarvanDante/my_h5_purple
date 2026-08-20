<template>
  <div class="page-shell planet-page">
    <header class="home-header">
      <div class="channel-row">
        <div class="channel-tabs">
          <button
            v-for="item in tabs"
            :key="item"
            type="button"
            class="channel-item"
            :class="{ active: tab === item }"
            @click="select(item)"
          >
            {{ item }}
          </button>
        </div>
        <button type="button" class="search-btn" aria-label="搜索" @click="go('/search')">⌕</button>
      </div>
    </header>

    <section v-if="ads.length" class="ad-strip">
      <article v-for="ad in ads" :key="ad.id" class="ad-card" @click="openVideo(ad.id)">
        <div class="ad-cover" :class="`tone-${ad.tone}`">
          <EncryptedImage v-if="ad.cover" :src="ad.cover" alt="" />
        </div>
        <p class="ad-title ellipsis">{{ ad.title }}</p>
        <span class="ad-tag">广告</span>
      </article>
    </section>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="feed">
          <p v-if="hint" class="empty">{{ hint }}</p>
          <p v-else-if="!list.length" class="empty">暂无帖子，子后台「社区管理 → 帖子」审核通过后显示</p>
          <article v-for="(post, idx) in list" :key="post.id" class="post" @click="goPost(post.id)">
            <div class="user-row">
              <div class="avatar" :class="`tone-${post.user_id % 6}`" />
              <div class="user-meta">
                <strong>用户{{ post.user_id }}</strong>
                <span>发布时间 {{ formatTime(post.created_at) }}</span>
              </div>
              <button type="button" class="follow" @click.stop="soon('关注')">+关注</button>
            </div>
            <div class="flags">
              <span v-if="idx === 0 && tab === '推荐'" class="flag">精华</span>
              <span v-if="idx === 0" class="flag top">置顶</span>
            </div>
            <h3>{{ post.title }}</h3>
            <p class="content">{{ post.content }}</p>
            <EncryptedImage v-if="post.pics?.[0]" class="pic" :src="mediaUrl(post.pics[0])" alt="" />
            <div v-else-if="!post.content" class="pic" :class="`tone-${post.id % 6}`" />
            <div class="topics">
              <span>广场</span>
              <span>{{ tab }}</span>
            </div>
            <div class="bar">
              <span>♡ {{ post.like_count }}</span>
              <span>💬 {{ post.comment_count }}</span>
            </div>
          </article>
        </div>
      </transition>
    </div>

    <button type="button" class="fab" aria-label="发帖" @click="openCompose">+</button>

    <div v-if="showCompose" class="compose-mask" @click.self="showCompose = false">
      <div class="compose">
        <h3>发帖</h3>
        <input v-model="draftTitle" type="text" maxlength="64" placeholder="标题" />
        <textarea v-model="draftContent" rows="5" maxlength="1000" placeholder="说点什么…" />
        <div class="compose-actions">
          <button type="button" @click="showCompose = false">取消</button>
          <button type="button" class="ok" :disabled="composeBusy" @click="submitPost">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useTabSlide } from '@/composables/useTabSlide'
import { createPost, fetchPostList, type PostItem } from '@/api/ops'
import { fetchVideoList } from '@/api/video'
import { useUserStore } from '@/stores/user'
import { videoPath } from '@/utils/idcrypt'
import EncryptedImage from '@/components/EncryptedImage.vue'
import { mediaUrl, toastError } from '@/utils/request'

defineOptions({ name: 'Planet' })

const router = useRouter()
const userStore = useUserStore()
const tabs = ['推荐', '关注', '活动', '日常']
const slide = useTabSlide(tabs)
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const list = ref<PostItem[]>([])
const ads = ref<{ id: string; title: string; cover?: string; tone: number }[]>([])
const showCompose = ref(false)
const composeBusy = ref(false)
const draftTitle = ref('')
const draftContent = ref('')

const hint = computed(() => {
  if (tab.value === '关注') return '关注的人发布后会显示在这里'
  if (tab.value === '活动') return '暂无活动，签到和福利可在「我的」查看'
  return ''
})

const select = (item: string) => slide.select(item)
const go = (path: string) => router.push(path)
const goPost = (id: number) => router.push(`/planet/${id}`)
const openVideo = (id: string) => router.push(videoPath(id))
const soon = (name: string) => showToast(`${name} 稍后接入`)

const formatTime = (raw: string) => {
  if (!raw) return ''
  return raw.replace(/^\d{4}-/, '').slice(0, 11)
}

const load = () => {
  if (hint.value) {
    list.value = []
    return
  }
  const sort = tab.value === '日常' ? 'new' : 'hot'
  fetchPostList(sort, 1, 20)
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
}

const openCompose = async () => {
  try {
    await userStore.ensureLogin()
    draftTitle.value = ''
    draftContent.value = ''
    showCompose.value = true
  } catch (err) {
    toastError(err)
  }
}

const submitPost = async () => {
  const title = draftTitle.value.trim()
  if (!title) {
    showToast('请填写标题')
    return
  }
  composeBusy.value = true
  try {
    await createPost(title, draftContent.value.trim())
    showCompose.value = false
    showToast('已提交，审核通过后显示')
  } catch (err) {
    toastError(err)
  } finally {
    composeBusy.value = false
  }
}

watch(tab, load)
onMounted(() => {
  load()
  fetchVideoList(1, 4, '', 1)
    .then((data) => {
      ads.value = (data.list || []).slice(0, 4).map((v) => ({
        id: String(v.id),
        title: v.title,
        cover: mediaUrl(v.cover_url),
        tone: v.id % 6,
      }))
    })
    .catch(() => undefined)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.home-header .channel-row {
  gap: 8px;
}

.search-btn {
  width: 36px;
  height: 36px;
  border: 0;
  background: $primary-soft;
  color: $primary-color-deep;
  border-radius: 50%;
  font-size: 16px;
  flex-shrink: 0;
}

.ad-strip {
  display: flex;
  gap: 10px;
  padding: 12px 12px 4px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.ad-card {
  width: 108px;
  flex-shrink: 0;
}

.ad-cover {
  width: 108px;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.ad-title {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: $ink;
}

.ad-tag {
  display: inline-block;
  margin-top: 4px;
  font-size: 10px;
  color: $text-color-muted;
  background: $background-page;
  border-radius: 6px;
  padding: 1px 6px;
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.feed {
  padding: 8px 0 72px;
}

.empty {
  padding: 28px 16px;
  color: $text-color-muted;
  font-size: 13px;
  text-align: center;
}

.post {
  background: #fff;
  margin: 0 0 8px;
  padding: 14px 12px 12px;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 14px;
    color: $ink;
  }

  span {
    font-size: 11px;
    color: $text-color-muted;
  }
}

.follow {
  border: 0;
  background: $accent-yellow;
  color: $ink;
  font-size: 12px;
  font-weight: 800;
  border-radius: $radius-pill;
  padding: 5px 10px;
  flex-shrink: 0;
}

.flags {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}

.flag {
  font-size: 10px;
  color: $primary-color-deep;
  background: $primary-soft;
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 700;

  &.top {
    color: #c48a12;
    background: #fff4d4;
  }
}

h3 {
  margin-top: 8px;
  font-size: 15px;
  color: $ink;
}

.content {
  margin-top: 6px;
  font-size: 14px;
  line-height: 1.55;
  color: $text-color;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pic,
:deep(.pic) {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 10px;
}

.topics {
  display: flex;
  gap: 8px;
  margin-top: 10px;

  span {
    font-size: 11px;
    color: $primary-color-deep;
    background: $primary-soft;
    border-radius: $radius-pill;
    padding: 3px 8px;
  }
}

.bar {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  color: $text-color-muted;
  font-size: 12px;
}

.fab {
  position: fixed;
  right: 16px;
  bottom: calc(#{$tabbar-height} + 18px);
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 50%;
  background: $accent-yellow;
  color: $ink;
  font-size: 28px;
  line-height: 1;
  font-weight: 500;
  box-shadow: $shadow-card;
  z-index: 20;
}

.compose-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(44, 27, 34, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.compose {
  width: 100%;
  max-width: $phone-max-width;
  background: #fff;
  border-radius: 16px 16px 0 0;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));

  h3 {
    text-align: center;
    margin: 0 0 12px;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid $line;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    margin-bottom: 8px;
    outline: none;
    resize: none;
  }
}

.compose-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;

  button {
    flex: 1;
    height: 40px;
    border: 0;
    border-radius: $radius-pill;
    background: $background-page;
    color: $text-color-secondary;
    font-size: 14px;
  }

  .ok {
    background: $primary-color;
    color: #fff;
    font-weight: 700;
  }
}

@include media-tones;
</style>
