<template>
  <div class="cmt-panel">
    <section class="comments">
      <div class="cmt-head">
        <h3>评论 <em>({{ total }})</em></h3>
        <div class="sorts">
          <button type="button" :class="{ on: sort === 0 }" @click="setSort(0)">最新</button>
          <button type="button" :class="{ on: sort === 1 }" @click="setSort(1)">最热</button>
        </div>
      </div>

      <CommentRow v-if="showOfficial" :item="official" official />

      <p v-if="loading" class="empty">加载中…</p>
      <p v-else-if="!comments.length" class="empty">还没有评论，来说两句吧～</p>
      <div v-for="row in comments" :key="row.id" class="thread">
        <CommentRow :item="row" :focus="row.id === focusId" @reply="startReply" @like="onLike" />
        <div v-if="row.replies?.length" class="replies">
          <CommentRow
            v-for="reply in row.replies"
            :key="reply.id"
            nested
            :thread-id="row.id"
            :item="reply"
            :focus="reply.id === focusId"
            @reply="startReply"
            @like="onLike"
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
            @keyup.enter="submit"
          />
          <button v-if="showEmoji" type="button" class="emo" aria-label="表情" @click="emojiOpen = !emojiOpen">☺</button>
        </div>
        <label class="icon" aria-label="图片">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5" width="17" height="14" rx="2.2" stroke="currentColor" stroke-width="1.6" />
            <circle cx="8.6" cy="10" r="1.4" fill="currentColor" />
            <path d="m7.6 16.2 3.4-3.6 2.4 2.4 2.2-2.6 3.2 3.8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
          </svg>
          <input type="file" accept="image/*" hidden @change="onPick" />
        </label>
        <button type="button" class="send" :disabled="busy || (!draft.trim() && !pic)" aria-label="发送" @click="submit">
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
      <div v-if="showEmoji && emojiOpen" class="emojis">
        <button v-for="face in faces" :key="face" type="button" @click="insertEmoji(face)">{{ face }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { showToast } from 'vant'
import CommentRow from '@/components/CommentRow.vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import { addComment, fetchComments, likeComment, type CommentItem } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { IMAGE_MAX_BYTES } from '@/utils/fileSize'
import { encodeId } from '@/utils/idcrypt'
import { toastError } from '@/utils/request'
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

const props = withDefaults(
  defineProps<{
    contentId: number
    mediaType: number
    showOfficial?: boolean
    showEmoji?: boolean
    focusId?: number
  }>(),
  { showOfficial: false, showEmoji: true, focusId: 0 },
)

const emit = defineEmits<{
  'update:count': [n: number]
}>()

const userStore = useUserStore()
const comments = ref<CommentItem[]>([])
const total = ref(0)
const sort = ref(0)
const loading = ref(false)
const draft = ref('')
const pic = ref('')
const busy = ref(false)
const emojiOpen = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const replyTo = ref<{ id: number; nickname: string } | null>(null)
const focusId = ref(props.focusId || 0)

const displayName = (item: CommentItem) => item.nickname?.trim() || `用户${encodeId(item.user_id)}`

const syncCount = (n: number) => {
  total.value = Math.max(0, n)
  emit('update:count', total.value)
}

const load = async () => {
  if (!props.contentId) return
  loading.value = true
  try {
    const data = await fetchComments(props.contentId, 1, 40, sort.value, props.mediaType)
    comments.value = data.list || []
    const listed = comments.value.reduce((sum, row) => sum + 1 + (row.replies?.length || 0), 0)
    syncCount(Math.max(data.total || 0, listed))
    if (focusId.value > 0) {
      await nextTick()
      document.getElementById(`comment-${focusId.value}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

const setSort = async (next: number) => {
  if (sort.value === next) return
  sort.value = next
  focusId.value = 0
  await load()
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
  emojiOpen.value = false
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

const onPick = async (e: Event) => {
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
    pic.value = (await uploadPostMedia(file, 'image')).url
  } catch (err) {
    toastError(err)
  }
}

const patchLike = (id: number, likedNow: boolean, n: number) => {
  const apply = (row: CommentItem) => {
    if (row.id === id) {
      row.liked = likedNow
      row.like_count = n
    }
    row.replies?.forEach(apply)
  }
  comments.value.forEach(apply)
}

const onLike = async (item: CommentItem) => {
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

const submit = async () => {
  let text = draft.value.trim()
  if ((!text && !pic.value) || !props.contentId) return
  const parentId = replyTo.value?.id || 0
  if (replyTo.value) {
    const prefix = `@${replyTo.value.nickname}`
    if (text === prefix || text === `${prefix} `) text = ''
    else if (text.startsWith(`${prefix} `)) text = text.slice(prefix.length).trim()
  }
  busy.value = true
  try {
    await userStore.ensureLogin()
    const res = await addComment(props.contentId, text, parentId, pic.value ? [pic.value] : [], props.mediaType)
    draft.value = ''
    pic.value = ''
    replyTo.value = null
    emojiOpen.value = false
    if (res.status === 0) {
      showToast('已提交，审核通过后显示')
      return
    }
    showToast('评论成功')
    syncCount(total.value + 1)
    await load()
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

watch(
  () => [props.contentId, props.mediaType, props.focusId] as const,
  ([id, , nextFocus]) => {
    comments.value = []
    draft.value = ''
    pic.value = ''
    replyTo.value = null
    emojiOpen.value = false
    focusId.value = nextFocus || 0
    if (id) void load()
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.cmt-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0d0d12;
  color: #f5f5f8;
}

.comments {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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
  flex-shrink: 0;
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
</style>
