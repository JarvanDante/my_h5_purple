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
    <section class="comments">
      <h3>评论 <em>{{ comments.length }}</em></h3>
      <p v-if="!comments.length" class="empty">还没有评论，来说两句吧～</p>
      <article v-for="item in comments" :key="item.id" class="comment">
        <i class="avatar">{{ encodeId(item.user_id).slice(-1) || '?' }}</i>
        <div class="meta">
          <strong>用户{{ encodeId(item.user_id) }}</strong>
          <p>{{ item.content }}</p>
          <span>{{ item.created_at }}</span>
        </div>
      </article>
      <div class="reply">
        <input v-model="draft" type="text" maxlength="200" placeholder="请输入评论" @keyup.enter="submitComment" />
        <button type="button" :disabled="busy || !draft.trim()" @click="submitComment">
          {{ busy ? '发送中' : '发送' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import PostCard from '@/components/PostCard.vue'
import { COLLECT_LIKE, MEDIA_POST, fetchCollectList, operateCollect } from '@/api/collect'
import { addComment, fetchComments, fetchPostDetail, type CommentItem, type PostItem } from '@/api/ops'
import { fetchFollows, toggleFollow } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { encodeId, postPath, routeId, userPath } from '@/utils/idcrypt'
import { getToken, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const post = ref<PostItem | null>(null)
const comments = ref<CommentItem[]>([])
const followed = ref(false)
const liked = ref(false)
const draft = ref('')
const busy = ref(false)
const myId = computed(() => userStore.user?.id || 0)
const goUser = (userId: number) => router.push(userPath(userId))

const load = async () => {
  const id = routeId(route.params.id)
  if (!id) return
  try {
    const data = await fetchPostDetail(id)
    post.value = data.post
    const c = await fetchComments(id, 1, 30)
    comments.value = c.list || []
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

const submitComment = async () => {
  const text = draft.value.trim()
  if (!text || !post.value) return
  busy.value = true
  try {
    await userStore.ensureLogin()
    const res = await addComment(post.value.id, text)
    draft.value = ''
    if (res.status === 0) {
      showToast('已提交，审核通过后显示')
      return
    }
    showToast('评论成功')
    post.value.comment_count += 1
    const c = await fetchComments(post.value.id, 1, 30)
    comments.value = c.list || []
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
  padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
}

.comments {
  margin-top: 8px;
  padding: 16px 16px 24px;

  h3 {
    font-size: 15px;
    font-weight: 800;
    color: #f5f5f8;
    margin-bottom: 12px;

    em {
      font-style: normal;
      color: #ff3d7f;
    }
  }
}

.empty {
  padding: 36px 8px;
  text-align: center;
  color: #8c8c9c;
  font-size: 13px;
}

.comment {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #22222b;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #331020;
  color: #ff6699;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-style: normal;
}

.meta {
  min-width: 0;
  flex: 1;

  strong {
    display: block;
    font-size: 13px;
    color: #c8c8d0;
  }

  p {
    margin: 6px 0 4px;
    font-size: 14px;
    color: #f5f5f8;
    line-height: 1.55;
    word-break: break-word;
  }

  span {
    font-size: 11px;
    color: #8c8c9c;
  }
}

.reply {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  gap: 8px;
  padding: 8px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  background: #0b0b0d;
  border-top: 1px solid #22222b;

  input {
    flex: 1;
    height: 38px;
    border: 0;
    border-radius: 19px;
    background: #191920;
    color: #f5f5f8;
    padding: 0 14px;
    font-size: 14px;
    outline: none;

    &::placeholder {
      color: #8c8c9c;
    }
  }

  button {
    height: 38px;
    border: 0;
    background: #ff3d7f;
    color: #fff;
    font-weight: 700;
    border-radius: 19px;
    padding: 0 16px;

    &:disabled {
      opacity: 0.45;
    }
  }
}

@media (min-width: $desktop-preview-min) {
  .reply {
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: $phone-max-width;
  }
}
</style>
