<template>
  <article class="post-card" :class="{ detail }" @click="onOpen">
    <div class="user-row">
      <div class="avatar" :class="`tone-${post.user_id % 6}`">
        <EncryptedImage v-if="avatarSrc" :src="avatarSrc" alt="" />
        <span v-else>{{ name.slice(0, 1) }}</span>
      </div>
      <div class="user-meta">
        <strong>{{ name }}</strong>
        <span>发布时间 {{ formatTime(post.created_at) }}</span>
      </div>
      <button
        v-if="!mine"
        type="button"
        class="follow"
        :class="{ on: followed }"
        @click.stop="$emit('follow', post.user_id)"
      >
        {{ followed ? '已关注' : '+关注' }}
      </button>
    </div>

    <div class="body">
      <p class="text">
        <span v-if="essence" class="flag essence">精华</span>
        <span v-if="top" class="flag top"><LineIcon name="pin" />置顶</span>
        <span v-if="post.title" class="title">{{ post.title }}</span>
        <span v-if="post.content">{{ post.title ? ' ' : '' }}{{ post.content }}</span>
      </p>

      <div v-if="pics.length" class="pics" :class="`n-${Math.min(pics.length, 3)}`">
        <EncryptedImage v-for="(pic, i) in pics.slice(0, 3)" :key="i" :src="pic" alt="" />
      </div>

      <div v-if="topics.length" class="topics">
        <span v-for="item in topics" :key="item">{{ item }}</span>
      </div>
    </div>

    <div class="bar">
      <span><LineIcon name="eye" />{{ post.view_count ?? 0 }}</span>
      <button type="button" @click.stop="$emit('comment', post.id)">
        <LineIcon name="comment" />{{ post.comment_count }}
      </button>
      <button type="button" :class="{ on: liked }" @click.stop="$emit('like', post.id)">
        <LineIcon name="heart" />{{ post.like_count }}
      </button>
      <button type="button" aria-label="分享" @click.stop="$emit('share', post.id)">
        <LineIcon name="share" />
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EncryptedImage from '@/components/EncryptedImage.vue'
import LineIcon from '@/components/LineIcon.vue'
import type { PostItem } from '@/api/ops'
import { mediaUrl } from '@/utils/request'

const props = withDefaults(
  defineProps<{
    post: PostItem
    topics?: string[]
    essence?: boolean
    top?: boolean
    followed?: boolean
    liked?: boolean
    mine?: boolean
    detail?: boolean
  }>(),
  { topics: () => [], essence: false, top: false, followed: false, liked: false, mine: false, detail: false },
)

const emit = defineEmits<{
  open: [id: number]
  follow: [userId: number]
  like: [id: number]
  comment: [id: number]
  share: [id: number]
}>()

const name = computed(() => props.post.nickname?.trim() || `用户${props.post.user_id}`)
const avatarSrc = computed(() => mediaUrl(props.post.img))
const pics = computed(() => (props.post.pics || []).map((p) => mediaUrl(p)).filter(Boolean))

const formatTime = (raw: string) => {
  if (!raw) return ''
  return raw.replace(/^\d{4}-/, '').slice(0, 11)
}

const onOpen = () => {
  if (!props.detail) emit('open', props.post.id)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.post-card {
  background: #fff;
  padding: 14px 14px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  color: #fff;
  font-size: 15px;
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

.user-meta {
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: #222;
    line-height: 1.25;
  }

  span {
    font-size: 11px;
    color: #9a9a9a;
  }
}

.follow {
  border: 0;
  background: #ffd400;
  color: #222;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  padding: 5px 10px;
  line-height: 1.2;
  flex-shrink: 0;

  &.on {
    background: #f2f2f2;
    color: #888;
  }
}

.body {
  margin-top: 10px;
}

.text {
  font-size: 15px;
  line-height: 1.55;
  color: #222;
  word-break: break-word;

  .post-card:not(.detail) & {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.title {
  font-weight: 700;
}

.flag {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-right: 6px;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;
  vertical-align: 1px;
  color: #fff;

  :deep(.line-icon) {
    width: 10px;
    height: 10px;
  }

  &.essence {
    background: #ff8a1f;
  }

  &.top {
    background: #e23b3b;
  }
}

.pics {
  margin-top: 10px;
  display: grid;
  gap: 6px;

  &.n-1 {
    grid-template-columns: 1fr;

    :deep(img) {
      width: 100%;
      max-height: 280px;
      object-fit: contain;
      background: #f7f7f7;
      border-radius: 4px;
    }
  }

  &.n-2,
  &.n-3 {
    grid-template-columns: repeat(3, 1fr);

    :deep(img) {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 4px;
    }
  }
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  span {
    font-size: 12px;
    color: #ff7a1a;
    background: #fff6ec;
    border-radius: $radius-pill;
    padding: 3px 10px;
  }
}

.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 2px 8px 2px 0;
  color: #b0b0b0;
  font-size: 13px;

  span,
  button {
    flex: 1;
    border: 0;
    background: transparent;
    color: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
    padding: 4px 0;
    font-size: 13px;
  }

  button.on {
    color: #e23b3b;
  }

  :deep(.line-icon) {
    width: 16px;
    height: 16px;
  }
}

@include media-tones;
</style>
