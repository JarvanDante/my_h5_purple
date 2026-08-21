<template>
  <div class="page-shell planet-page">
    <header class="planet-header">
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
        <button type="button" class="search-btn" aria-label="搜索" @click="go('/search')">
          <LineIcon name="search" />
        </button>
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
          <p v-else-if="!list.length" class="empty">暂无帖子，审核通过后显示</p>
          <PostCard
            v-for="(post, idx) in list"
            :key="post.id"
            :post="post"
            :topics="topicsOf(post)"
            :essence="idx === 0 && tab === '推荐'"
            :top="idx === 0"
            :followed="followed.has(post.user_id)"
            :liked="liked.has(post.id)"
            :mine="post.user_id === myId"
            @open="goPost"
            @follow="onFollow"
            @like="onLike"
            @comment="goPost"
            @share="onShare"
          />
        </div>
      </transition>
    </div>

    <button type="button" class="fab" aria-label="发帖" @click="openCompose">+</button>

    <div v-if="showCompose" class="compose-mask" @click.self="showCompose = false">
      <div class="compose">
        <h3>发帖</h3>
        <input v-model="draftTitle" type="text" maxlength="64" placeholder="标题" />
        <textarea v-model="draftContent" rows="5" maxlength="1000" placeholder="说点什么…" />
        <div class="draft-pics">
          <EncryptedImage v-for="(pic, i) in draftPics" :key="i" :src="pic" alt="" />
          <label v-if="draftPics.length < 3" class="add-pic">
            +
            <input type="file" accept="image/*" hidden @change="onPickPic" />
          </label>
        </div>
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
import PostCard from '@/components/PostCard.vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import LineIcon from '@/components/LineIcon.vue'
import { COLLECT_LIKE, MEDIA_POST, operateCollect } from '@/api/collect'
import { createPost, fetchPostList, type PostItem } from '@/api/ops'
import { fetchFollows, toggleFollow } from '@/api/user'
import { fetchVideoList } from '@/api/video'
import { useTabSlide } from '@/composables/useTabSlide'
import { useUserStore } from '@/stores/user'
import { videoPath } from '@/utils/idcrypt'
import { getToken, mediaUrl, toastError, uploadMedia } from '@/utils/request'

defineOptions({ name: 'Planet' })

const router = useRouter()
const userStore = useUserStore()
const tabs = ['关注', '推荐', '活动专区', '日常专区', '星球']
const slide = useTabSlide(tabs, '推荐')
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const list = ref<PostItem[]>([])
const ads = ref<{ id: string; title: string; cover?: string; tone: number }[]>([])
const followed = ref(new Set<number>())
const liked = ref(new Set<number>())
const showCompose = ref(false)
const composeBusy = ref(false)
const draftTitle = ref('')
const draftContent = ref('')
const draftPics = ref<string[]>([])
const myId = computed(() => userStore.user?.id || 0)

const hint = computed(() => {
  if (tab.value === '关注') return '关注的人发布后会显示在这里'
  return ''
})

const select = (item: string) => slide.select(item)
const go = (path: string) => router.push(path)
const goPost = (id: number) => router.push(`/planet/${id}`)
const openVideo = (id: string) => router.push(videoPath(id))

const topicsOf = (post: PostItem) => {
  if (tab.value === '活动专区') return ['活动公告', '最新公告']
  if (tab.value === '日常专区') return ['日常']
  if (post.title.includes('活动') || post.content.includes('活动')) return ['活动公告']
  return ['广场', tab.value]
}

const load = () => {
  if (hint.value) {
    list.value = []
    return
  }
  const sort = tab.value === '日常专区' ? 'new' : 'hot'
  fetchPostList(sort, 1, 20)
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
}

const loadFollows = async () => {
  if (!getToken()) return
  try {
    const data = await fetchFollows(1, 80)
    followed.value = new Set((data.list || []).map((u) => u.id))
  } catch {
    followed.value = new Set()
  }
}

const onFollow = async (userId: number) => {
  try {
    await userStore.ensureLogin()
    const { followed: next } = await toggleFollow(userId)
    const nextSet = new Set(followed.value)
    if (next) nextSet.add(userId)
    else nextSet.delete(userId)
    followed.value = nextSet
    showToast(next ? '已关注' : '已取消关注')
  } catch (err) {
    toastError(err)
  }
}

const onLike = async (id: number) => {
  try {
    await userStore.ensureLogin()
    const next = !liked.value.has(id)
    await operateCollect(id, MEDIA_POST, next, COLLECT_LIKE)
    const nextSet = new Set(liked.value)
    if (next) nextSet.add(id)
    else nextSet.delete(id)
    liked.value = nextSet
    const row = list.value.find((p) => p.id === id)
    if (row) row.like_count = Math.max(0, row.like_count + (next ? 1 : -1))
  } catch (err) {
    toastError(err)
  }
}

const onShare = async (id: number) => {
  const url = `${location.origin}/planet/${id}`
  try {
    if (navigator.share) {
      await navigator.share({ url })
      return
    }
    await navigator.clipboard.writeText(url)
    showToast('链接已复制')
  } catch {
    showToast('分享取消')
  }
}

const openCompose = async () => {
  try {
    await userStore.ensureLogin()
    draftTitle.value = ''
    draftContent.value = ''
    draftPics.value = []
    showCompose.value = true
  } catch (err) {
    toastError(err)
  }
}

const onPickPic = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  try {
    const data = await uploadMedia(file, 'image')
    draftPics.value = [...draftPics.value, mediaUrl(data.url)]
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
    await createPost(title, draftContent.value.trim(), draftPics.value)
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
  loadFollows()
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

.planet-page {
  background: #f3f3f3;
}

.planet-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #6b1c2e;
  padding: env(safe-area-inset-top, 0px) 8px 0 12px;
}

.channel-row {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 46px;
}

.channel-tabs {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-end;
  gap: 18px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.channel-item {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  padding: 0 0 10px;
  position: relative;

  &.active {
    color: #fff;
    font-size: 17px;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 4px;
      width: 18px;
      height: 3px;
      border-radius: 2px;
      background: #fff;
      transform: translateX(-50%);
    }
  }
}

.search-btn {
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  color: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(.line-icon) {
    width: 20px;
    height: 20px;
  }
}

.ad-strip {
  display: flex;
  gap: 10px;
  padding: 12px 12px 8px;
  overflow-x: auto;
  background: #fff;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.ad-card {
  width: 92px;
  flex-shrink: 0;
}

.ad-cover {
  width: 92px;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
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
  color: #222;
}

.ad-tag {
  display: inline-block;
  margin-top: 3px;
  font-size: 10px;
  color: #9a9a9a;
  background: #f3f3f3;
  border-radius: 3px;
  padding: 1px 5px;
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.feed {
  padding: 8px 0 72px;
  background: #f3f3f3;
}

.empty {
  padding: 48px 16px;
  color: #999;
  font-size: 13px;
  text-align: center;
  background: #fff;
}

.fab {
  position: fixed;
  right: 16px;
  bottom: calc(#{$tabbar-height} + 20px);
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 50%;
  background: #ffd400;
  color: #222;
  font-size: 34px;
  line-height: 1;
  font-weight: 400;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
  z-index: 20;
}

.compose-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.45);
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
    color: #222;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid #eee;
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 14px;
    margin-bottom: 8px;
    outline: none;
    resize: none;
    color: #222;
  }
}

.draft-pics {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;

  :deep(img) {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 8px;
  }
}

.add-pic {
  width: 64px;
  height: 64px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  color: #bbb;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
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
    background: #f3f3f3;
    color: #666;
    font-size: 14px;
  }

  .ok {
    background: #ffd400;
    color: #222;
    font-weight: 700;
  }
}

@media (min-width: $desktop-preview-min) {
  .fab {
    right: calc(50% - #{$phone-max-width} / 2 + 16px);
  }
}

@include media-tones;
</style>
