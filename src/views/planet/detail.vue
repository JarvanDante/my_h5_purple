<template>
  <div class="page-shell planet-detail">
    <PageHeader title="帖子详情" />
    <PostCard
      v-if="post"
      :post="post"
      :topics="post.topics || []"
      :followed="followed"
      :liked="liked"
      :mine="post.user_id === myId"
      detail
      @follow="onFollow"
      @like="onLike"
      @share="onShare"
    />
    <section class="comments">
      <h3>评论 {{ comments.length }}</h3>
      <p v-if="!comments.length" class="empty">还没有评论</p>
      <article v-for="item in comments" :key="item.id" class="comment">
        <strong>用户{{ item.user_id }}</strong>
        <p>{{ item.content }}</p>
        <span>{{ item.created_at }}</span>
      </article>
      <div class="reply">
        <input v-model="draft" type="text" maxlength="200" placeholder="写评论…" @keyup.enter="submitComment" />
        <button type="button" :disabled="busy" @click="submitComment">发送</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import PostCard from '@/components/PostCard.vue'
import { COLLECT_LIKE, MEDIA_POST, fetchCollectList, operateCollect } from '@/api/collect'
import { addComment, fetchComments, fetchPostDetail, type CommentItem, type PostItem } from '@/api/ops'
import { fetchFollows, toggleFollow } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { getToken, toastError } from '@/utils/request'

const route = useRoute()
const userStore = useUserStore()
const post = ref<PostItem | null>(null)
const comments = ref<CommentItem[]>([])
const followed = ref(false)
const liked = ref(false)
const draft = ref('')
const busy = ref(false)
const myId = computed(() => userStore.user?.id || 0)

const load = async () => {
  const id = Number(route.params.id)
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
    await addComment(post.value.id, text)
    draft.value = ''
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
  background: #f3f3f3;
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}

.comments {
  margin-top: 8px;
  background: #fff;
  padding: 14px 14px 80px;

  h3 {
    font-size: 15px;
    color: #222;
    margin-bottom: 10px;
  }
}

.empty {
  color: #999;
  font-size: 13px;
  padding: 16px 0;
}

.comment {
  padding: 10px 0;
  border-bottom: 1px solid #f3f3f3;

  strong {
    font-size: 13px;
    color: #333;
  }

  p {
    margin: 6px 0 4px;
    font-size: 14px;
    color: #222;
    line-height: 1.5;
  }

  span {
    font-size: 11px;
    color: #aaa;
  }
}

.reply {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 8px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #eee;

  input {
    flex: 1;
    height: 36px;
    border: 0;
    border-radius: $radius-pill;
    background: #f3f3f3;
    padding: 0 14px;
    font-size: 14px;
    outline: none;
  }

  button {
    border: 0;
    background: #ffd400;
    color: #222;
    font-weight: 700;
    border-radius: $radius-pill;
    padding: 0 14px;
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
