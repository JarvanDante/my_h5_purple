<template>
  <div class="page-shell sub-page planet-detail">
    <PageHeader title="帖子详情" fallback="/planet" />
    <PostCard
      v-if="post"
      :post="post"
      :topics="post.topics || []"
      :followed="followed"
      :liked="liked"
      :mine="post.user_id === myId"
      detail
      @profile="goUser"
      @follow="onFollow"
      @like="onLike"
      @share="onShare"
    />

    <section class="ad-slot" aria-hidden="true">
      <span>同城约会</span>
    </section>

    <section class="comments">
      <div class="cmt-head">
        <h3>评论 <em>({{ displayCount }})</em></h3>
        <div class="sorts">
          <button type="button" :class="{ on: sort === 0 }" @click="setSort(0)">最新</button>
          <button type="button" :class="{ on: sort === 1 }" @click="setSort(1)">最热</button>
        </div>
      </div>

      <CommentRow :item="official" official />

      <p v-if="!comments.length" class="empty">还没有评论，来说两句吧～</p>
      <div v-for="item in comments" :key="item.id" class="thread">
        <CommentRow :item="item" :focus="item.id === focusId" @reply="startReply" @like="onCommentLike" />
        <div v-if="item.replies?.length" class="replies">
          <CommentRow
            v-for="reply in item.replies"
            :key="reply.id"
            nested
            :thread-id="item.id"
            :item="reply"
            :focus="reply.id === focusId"
            @reply="startReply"
            @like="onCommentLike"
          />
        </div>
      </div>
      <p v-if="comments.length" class="end">没有更多了</p>
    </section>

    <div class="composer">
      <p v-if="replyTo" class="hint">
        回复 {{ replyTo.nickname }}
        <button type="button" @click="clearReply">取消</button>
      </p>
      <div class="bar">
        <div class="field">
          <input
            ref="inputEl"
            v-model="draft"
            type="text"
            maxlength="200"
            :placeholder="replyTo ? `@${replyTo.nickname}` : '请输入评论'"
            @keyup.enter="submitComment"
          />
          <button type="button" class="emo" aria-label="表情" @click="showEmoji = !showEmoji">☺</button>
        </div>
        <label class="icon" aria-label="图片">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5" width="17" height="14" rx="2.2" stroke="currentColor" stroke-width="1.6" />
            <circle cx="8.6" cy="10" r="1.4" fill="currentColor" />
            <path d="m7.6 16.2 3.4-3.6 2.4 2.4 2.2-2.6 3.2 3.8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
          <input type="file" accept="image/*" hidden @change="onPickImage" />
        </label>
        <button type="button" class="send" :disabled="busy || (!draft.trim() && !pic)" aria-label="发送" @click="submitComment">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4.2 12 20 4.8 14.6 20 11.8 13.6 4.2 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            <path d="m11.8 13.6 8.2-8.8" stroke="currentColor" stroke-width="1.6" />
          </svg>
        </button>
      </div>
      <div v-if="pic" class="preview">
        <EncryptedImage :src="pic" alt="" />
        <button type="button" @click="pic = ''">×</button>
      </div>
      <div v-if="showEmoji" class="emojis">
        <button v-for="face in faces" :key="face" type="button" @click="insertEmoji(face)">{{ face }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import CommentRow from '@/components/CommentRow.vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import PostCard from '@/components/PostCard.vue'
import { COLLECT_LIKE, MEDIA_POST, fetchCollectList, operateCollect } from '@/api/collect'
import {
  addComment,
  fetchComments,
  fetchPostDetail,
  likeComment,
  type CommentItem,
  type PostItem,
} from '@/api/ops'
import { fetchFollows, toggleFollow } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { IMAGE_MAX_BYTES } from '@/utils/fileSize'
import { encodeId, routeId, userPath } from '@/utils/idcrypt'
import { getToken, toastError } from '@/utils/request'
import { uploadPostMedia } from '@/utils/storage-upload'

const faces = ['😀', '😁', '😂', '🤣', '😊', '😍', '😘', '😜', '👍', '🙏', '🔥', '❤️']

const official: CommentItem = {
  id: 0,
  user_id: 0,
  nickname: '官方客服',
  content: '为了保障您的资金安全，请勿轻信兼职、博彩、裸聊、投资、借贷等各类网络兼职信息，如遇此类情况请及时向平台反馈。',
  like_count: 0,
  created_at: new Date().toISOString(),
  is_vip: true,
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const post = ref<PostItem | null>(null)
const comments = ref<CommentItem[]>([])
const total = ref(0)
const sort = ref(0)
const followed = ref(false)
const liked = ref(false)
const draft = ref('')
const pic = ref('')
const busy = ref(false)
const showEmoji = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const replyTo = ref<{ id: number; nickname: string } | null>(null)
const focusId = ref(0)
const commentPage = ref(1)
const myId = computed(() => userStore.user?.id || 0)
const goUser = (userId: number) => router.push(userPath(userId))
const jumpSize = 15

const displayName = (item: CommentItem) => item.nickname?.trim() || `用户${encodeId(item.user_id)}`
const listedCount = (list: CommentItem[]) => list.reduce((sum, row) => sum + 1 + (row.replies?.length || 0), 0)
const displayCount = computed(() => Math.max(total.value, post.value?.comment_count || 0))

const loadComments = async () => {
  const id = post.value?.id || routeId(route.params.id)
  if (!id) return
  const locating = focusId.value > 0
  const page = locating ? commentPage.value : 1
  const size = locating ? jumpSize : 40
  const c = await fetchComments(id, page, size, locating ? 0 : sort.value)
  comments.value = c.list || []
  total.value = Math.max(c.total || 0, listedCount(comments.value), post.value?.comment_count || 0)
}

const scrollToComment = async () => {
  const id = focusId.value
  if (!id) return
  await nextTick()
  const el = document.getElementById(`comment-${id}`)
  if (!el) {
    showToast('该评论已删除')
    return
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const load = async () => {
  const id = routeId(route.params.id)
  if (!id) return
  try {
    const data = await fetchPostDetail(id)
    post.value = data.post
    const qComment = Number(route.query.comment || 0)
    const qPage = Number(route.query.page || 1)
    if (qComment > 0) {
      focusId.value = qComment
      commentPage.value = qPage > 0 ? qPage : 1
      sort.value = 0
    }
    await loadComments()
    if (qComment > 0) await scrollToComment()
    if (getToken() && post.value) {
      await userStore.ensureLogin()
      const [follows, likes] = await Promise.all([
        fetchFollows(1, 80),
        fetchCollectList(COLLECT_LIKE, MEDIA_POST, 1, 80),
      ])
      followed.value = (follows.list || []).some((u) => u.id === post.value?.user_id)
      liked.value = (likes.list || []).some((row) => row.content_id === id)
    }
  } catch (err) {
    toastError(err)
  }
}

const setSort = async (next: number) => {
  if (sort.value === next && !focusId.value) return
  sort.value = next
  focusId.value = 0
  commentPage.value = 1
  try {
    await loadComments()
  } catch (err) {
    toastError(err)
  }
}

const startReply = async (item: CommentItem) => {
  try {
    await userStore.ensureLogin()
  } catch {
    showToast('请先登录')
    return
  }
  const nickname = displayName(item)
  replyTo.value = { id: item.id, nickname }
  draft.value = `@${nickname} `
  showEmoji.value = false
  await nextTick()
  inputEl.value?.focus()
}

const clearReply = () => {
  replyTo.value = null
}

const insertEmoji = (face: string) => {
  draft.value += face
  inputEl.value?.focus()
}

const onPickImage = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    await userStore.ensureLogin()
  } catch {
    showToast('请先登录')
    return
  }
  if (file.size > IMAGE_MAX_BYTES) {
    showToast('图片不能超过1M')
    return
  }
  try {
    const data = await uploadPostMedia(file, 'image')
    pic.value = data.url
  } catch (err) {
    toastError(err)
  }
}

const onFollow = async () => {
  if (!post.value) return
  try {
    await userStore.ensureLogin()
    const { followed: next } = await toggleFollow(post.value.user_id)
    followed.value = next
    showToast(next ? '已关注' : '已取消关注')
  } catch (err) {
    toastError(err)
  }
}

const onLike = async () => {
  if (!post.value) return
  try {
    await userStore.ensureLogin()
    const next = !liked.value
    await operateCollect(post.value.id, MEDIA_POST, next, COLLECT_LIKE)
    liked.value = next
    post.value.like_count = Math.max(0, post.value.like_count + (next ? 1 : -1))
  } catch (err) {
    toastError(err)
  }
}

const onShare = async () => {
  const url = location.href
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

const patchLike = (id: number, likedNow: boolean, count: number) => {
  const apply = (row: CommentItem) => {
    if (row.id === id) {
      row.liked = likedNow
      row.like_count = count
    }
    row.replies?.forEach(apply)
  }
  comments.value.forEach(apply)
}

const onCommentLike = async (item: CommentItem) => {
  try {
    await userStore.ensureLogin()
    const next = !item.liked
    item.liked = next
    item.like_count = Math.max(0, (item.like_count || 0) + (next ? 1 : -1))
    const res = await likeComment(item.id, next)
    patchLike(item.id, res.liked, res.like_count)
  } catch (err) {
    item.liked = !item.liked
    item.like_count = Math.max(0, (item.like_count || 0) + (item.liked ? 1 : -1))
    toastError(err)
  }
}

const submitComment = async () => {
  let text = draft.value.trim()
  if ((!text && !pic.value) || !post.value) return
  const parentId = replyTo.value?.id || 0
  if (replyTo.value) {
    const prefix = `@${replyTo.value.nickname}`
    if (text === prefix || text === `${prefix} `) text = ''
    else if (text.startsWith(`${prefix} `)) text = text.slice(prefix.length).trim()
  }
  busy.value = true
  try {
    await userStore.ensureLogin()
    const res = await addComment(post.value.id, text, parentId, pic.value ? [pic.value] : [])
    draft.value = ''
    pic.value = ''
    replyTo.value = null
    showEmoji.value = false
    if (res.status === 0) {
      showToast('已提交，审核通过后显示')
      return
    }
    showToast('评论成功')
    post.value.comment_count += 1
    await loadComments()
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.planet-detail {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px));
}

.ad-slot {
  margin: 8px 12px 0;
  height: 72px;
  border-radius: 10px;
  background: linear-gradient(90deg, #3a2a55, #5a3a6a 50%, #2a3a55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.comments {
  margin-top: 4px;
  padding: 12px 16px 24px;
}

.cmt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;

  h3 {
    font-size: 15px;
    font-weight: 800;
    color: #f5f5f8;
    margin: 0;

    em {
      font-style: normal;
      color: #8c8c9c;
      font-weight: 600;
    }
  }
}

.sorts {
  display: flex;
  gap: 14px;

  button {
    border: 0;
    background: transparent;
    color: #8c8c9c;
    font-size: 13px;
    padding: 0;

    &.on {
      color: #f5f5f8;
      font-weight: 700;
    }
  }
}

.thread {
  border-bottom: 1px solid #22222b;
}

.replies {
  margin: 0 0 4px 46px;
  padding: 0;
  border-top: 1px solid #2a2a34;
}

.empty,
.end {
  padding: 20px 8px;
  text-align: center;
  color: #8c8c9c;
  font-size: 13px;
}

.composer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 8px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  background: #0b0b0d;
  border-top: 1px solid #22222b;
}

.hint {
  display: flex;
  justify-content: space-between;
  margin: 0 0 6px;
  font-size: 12px;
  color: #8c8c9c;

  button {
    border: 0;
    background: transparent;
    color: #ff5c93;
  }
}

.bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field {
  flex: 1;
  position: relative;

  input {
    width: 100%;
    height: 38px;
    border: 0;
    border-radius: 19px;
    background: #191920;
    color: #f5f5f8;
    padding: 0 36px 0 14px;
    font-size: 14px;
    outline: none;

    &::placeholder {
      color: #8c8c9c;
    }
  }
}

.emo {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

.icon,
.send {
  appearance: none;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #c8c8d0;
  display: grid;
  place-items: center;
  padding: 0;

  svg {
    width: 22px;
    height: 22px;
  }
}

.send:disabled {
  opacity: 0.4;
}

.preview {
  position: relative;
  width: 56px;
  height: 56px;
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 18px;
    height: 18px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 12px;
    line-height: 18px;
  }
}

.emojis {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;

  button {
    border: 0;
    background: #191920;
    border-radius: 8px;
    font-size: 20px;
    width: 36px;
    height: 36px;
  }
}

@media (min-width: $desktop-preview-min) {
  .composer {
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: $phone-max-width;
  }
}
</style>
