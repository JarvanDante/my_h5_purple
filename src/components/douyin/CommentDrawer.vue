<template>
  <Teleport to="body">
    <div v-if="open" class="mask" @click="close">
      <div class="sheet" @click.stop>
        <i class="handle" />
        <header class="head">
          <h3>{{ count }} 条评论</h3>
        </header>

        <div class="list">
          <p v-if="loading" class="empty">加载中…</p>
          <p v-else-if="!comments.length" class="empty">还没有评论，来说两句吧～</p>
          <div v-for="item in comments" :key="item.id" class="thread">
            <CommentRow :item="item" @reply="startReply" @like="onLike" />
            <button
              v-if="replyN(item) && !opened.has(item.id)"
              type="button"
              class="more"
              @click="expand(item.id)"
            >
              展开 {{ replyN(item) }} 条回复
            </button>
            <div v-else-if="item.replies?.length" class="replies">
              <CommentRow
                v-for="reply in item.replies"
                :key="reply.id"
                nested
                :thread-id="item.id"
                :item="reply"
                @reply="startReply"
                @like="onLike"
              />
            </div>
          </div>
        </div>

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
                :placeholder="replyTo ? `@${replyTo.nickname}` : '请在此输入评论...'"
                @keyup.enter="submit"
              />
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
        </div>
      </div>
    </div>
  </Teleport>
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

const props = withDefaults(
  defineProps<{
    open: boolean
    contentId: number
    mediaType?: number
    count?: number
  }>(),
  { mediaType: 1, count: 0 },
)

const emit = defineEmits<{
  close: []
  'update:count': [n: number]
}>()

const userStore = useUserStore()
const comments = ref<CommentItem[]>([])
const loading = ref(false)
const draft = ref('')
const pic = ref('')
const busy = ref(false)
const inputEl = ref<HTMLInputElement | null>(null)
const replyTo = ref<{ id: number; nickname: string } | null>(null)
const opened = ref(new Set<number>())
const count = ref(props.count)

const replyN = (item: CommentItem) => item.reply_count || item.replies?.length || 0

const expand = (id: number) => {
  const next = new Set(opened.value)
  next.add(id)
  opened.value = next
}

const close = () => emit('close')

const displayName = (item: CommentItem) => item.nickname?.trim() || `用户${encodeId(item.user_id)}`

const syncCount = (n: number) => {
  count.value = Math.max(0, n)
  emit('update:count', count.value)
}

const load = async () => {
  if (!props.contentId) return
  loading.value = true
  try {
    const data = await fetchComments(props.contentId, 1, 40, 0, props.mediaType)
    comments.value = data.list || []
    const listed = comments.value.reduce((sum, row) => sum + 1 + (row.replies?.length || 0), 0)
    syncCount(Math.max(data.total || 0, listed, props.count || 0))
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

const startReply = async (item: CommentItem) => {
  replyTo.value = { id: item.id, nickname: displayName(item) }
  draft.value = `@${displayName(item)} `
  await nextTick()
  inputEl.value?.focus()
}

const clearReply = () => {
  replyTo.value = null
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

const onPick = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (!file) return
  if (file.size > IMAGE_MAX_BYTES) {
    showToast('图片太大')
    return
  }
  try {
    await userStore.ensureLogin()
    pic.value = (await uploadPostMedia(file, 'image')).url
  } catch (err) {
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
    if (res.status === 0) {
      showToast('已提交，审核通过后显示')
      return
    }
    showToast('评论成功')
    syncCount(count.value + 1)
    await load()
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

watch(
  () => [props.open, props.contentId] as const,
  ([show, id]) => {
    if (!show || !id) return
    count.value = props.count || 0
    opened.value = new Set()
    comments.value = []
    draft.value = ''
    pic.value = ''
    replyTo.value = null
    load()
  },
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.mask {
  position: fixed;
  inset: 0;
  z-index: 120;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  max-height: 72vh;
  background: #111116;
  border-radius: 16px 16px 0 0;
  color: #f5f5f8;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}

.handle {
  display: block;
  width: 36px;
  height: 4px;
  margin: 8px auto 0;
  border-radius: 99px;
  background: #ff5c93;
}

.head {
  padding: 10px 16px 6px;

  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
  }
}

.list {
  flex: 1;
  min-height: 180px;
  overflow-y: auto;
  padding: 0 16px 8px;
}

.empty {
  padding: 36px 12px;
  text-align: center;
  color: #8c8c9c;
  font-size: 13px;
}

.replies {
  margin: 0 0 0 46px;
  padding-left: 8px;
}

.more {
  appearance: none;
  display: inline-flex;
  align-items: center;
  margin: 0 0 8px 46px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 12px;
}

.more::before {
  content: '';
  width: 18px;
  height: 1px;
  margin-right: 8px;
  background: #3a3a44;
}

.composer {
  flex-shrink: 0;
  padding: 8px 12px 4px;
  border-top: 1px solid #22222b;
}

.hint {
  margin: 0 0 6px;
  font-size: 12px;
  color: #8c8c9c;

  button {
    border: 0;
    background: transparent;
    color: #ff5c93;
    margin-left: 8px;
  }
}

.bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field {
  flex: 1;
  min-width: 0;
  height: 38px;
  border-radius: 19px;
  background: #1c1c24;
  padding: 0 14px;

  input {
    width: 100%;
    height: 100%;
    border: 0;
    background: transparent;
    color: #f5f5f8;
    font-size: 14px;
    outline: none;
  }
}

.icon,
.send {
  appearance: none;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: #7b4dff;
  color: #fff;
  display: grid;
  place-items: center;
  padding: 0;

  svg {
    width: 18px;
    height: 18px;
  }
}

.icon {
  background: transparent;
  color: #c8c8d0;
}

.send:disabled {
  opacity: 0.35;
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
  }
}

@media (min-width: $desktop-preview-min) {
  .sheet {
    max-width: $phone-max-width;
    margin: 0 auto;
  }
}
</style>
