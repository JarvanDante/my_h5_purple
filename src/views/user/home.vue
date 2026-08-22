<template>
  <div class="page-shell user-home">
    <PageHeader :title="name || '用户主页'" fallback="/planet" />

    <section v-if="user" class="head">
      <div class="avatar" :class="`tone-${user.id % 6}`">
        <EncryptedImage v-if="avatarSrc" :src="avatarSrc" alt="" />
        <span v-else>{{ name.slice(0, 1) }}</span>
      </div>
      <div class="meta">
        <strong>{{ name }}</strong>
        <p>粉丝 {{ user.fans ?? 0 }}　关注 {{ user.follow ?? 0 }}</p>
      </div>
      <button
        v-if="!mine"
        type="button"
        class="follow"
        :class="{ on: followed }"
        @click="onFollow"
      >
        {{ followed ? '已关注' : '+关注' }}
      </button>
    </section>

    <div class="feed">
      <p v-if="!list.length" class="empty">暂无帖子</p>
      <PostCard
        v-for="post in list"
        :key="post.id"
        :post="post"
        hide-user
        :liked="liked.has(post.id)"
        mine
        @open="goPost"
        @like="onLike"
        @comment="goPost"
        @share="onShare"
      />
      <p v-if="list.length" class="end">没有更多了</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import PostCard from '@/components/PostCard.vue'
import { COLLECT_LIKE, MEDIA_POST, operateCollect } from '@/api/collect'
import { fetchPostList, type PostItem } from '@/api/ops'
import { fetchUserHome, toggleFollow, type PublicUser } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const user = ref<PublicUser | null>(null)
const followed = ref(false)
const list = ref<PostItem[]>([])
const liked = ref(new Set<number>())
const uid = computed(() => Number(route.params.id) || 0)
const mine = computed(() => uid.value > 0 && uid.value === (userStore.user?.id || 0))
const name = computed(() => user.value?.nickname?.trim() || (uid.value ? `用户${uid.value}` : ''))
const avatarSrc = computed(() => mediaUrl(user.value?.img))

const goPost = (id: number) => router.push(`/planet/${id}`)

const load = async () => {
  if (!uid.value) return
  try {
    await userStore.ensureLogin()
    const home = await fetchUserHome(uid.value)
    user.value = home.user
    followed.value = home.is_followed
    const data = await fetchPostList('new', 1, 20, uid.value)
    list.value = data.list || []
  } catch (err) {
    toastError(err)
  }
}

const onFollow = async () => {
  if (!uid.value) return
  try {
    await userStore.ensureLogin()
    const { followed: next } = await toggleFollow(uid.value)
    followed.value = next
    if (user.value) {
      user.value.fans = Math.max(0, (user.value.fans || 0) + (next ? 1 : -1))
    }
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

watch(uid, load)
onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.user-home {
  background: #f3f3f3;
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.meta {
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: #222;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: #9a9a9a;
  }
}

.follow {
  border: 0;
  background: #ff3d7f;
  color: #1a0a12;
  font-size: 12px;
  font-weight: 700;
  border-radius: 14px;
  padding: 5px 12px;
  flex-shrink: 0;

  &.on {
    background: #24242e;
    color: #8c8c9c;
  }
}

.feed {
  margin-top: 8px;
  background: #fff;
  padding-bottom: 24px;
}

.empty,
.end {
  padding: 28px 16px;
  text-align: center;
  color: #bbb;
  font-size: 13px;
}

@include media-tones;
</style>
