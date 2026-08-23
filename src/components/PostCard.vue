<template>
  <article class="post-card" :class="{ detail, compact: hideUser }">
    <div v-if="!hideUser" class="user-row">
      <UserAvatar
        class="avatar"
        :src="avatarSrc"
        :sex="post.sex"
        :size="40"
        :fallback="name"
        @click.stop="onProfile"
      />
      <div class="user-meta" @click.stop="onProfile">
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

    <div class="body" @click="onBody">
      <p class="text">
        <span v-if="essence" class="flag essence">精华</span>
        <span v-if="top" class="flag top"><LineIcon name="pin" />置顶</span>
        <span v-if="post.title" class="title">{{ post.title }}</span>
        <span v-if="post.content" class="body-text">{{ post.title && !detail ? ' ' : '' }}{{ post.content }}</span>
      </p>
      <p v-if="hideUser" class="posted">发布时间 {{ formatTime(post.created_at) }}</p>

      <div v-if="detail && (pics.length || videoSrc)" class="gallery">
        <button
          v-for="(pic, i) in pics"
          :key="pic"
          type="button"
          class="shot"
          @click.stop="previewPics(i)"
        >
          <EncryptedImage :src="pic" alt="" />
          <span class="zoom"><LineIcon name="search" /></span>
        </button>
        <div v-if="videoSrc" class="shot video" @click.stop="playVideo">
          <video
            ref="videoEl"
            :src="videoSrc"
            playsinline
            preload="metadata"
            :controls="videoPlaying"
            @ended="videoPlaying = false"
          />
          <span v-if="!videoPlaying" class="play" />
        </div>
      </div>

      <div v-else-if="mediaSlots.length" class="media" :class="`n-${mediaSlots.length}`">
        <div
          v-for="(slot, i) in mediaSlots"
          :key="`${slot.type}-${i}`"
          class="cell"
          :class="slot.type"
          @click.stop="onMediaClick"
        >
          <EncryptedImage v-if="slot.type === 'image'" :src="slot.src" alt="" />
          <template v-else>
            <video :src="slot.src" playsinline preload="metadata" />
            <span class="play" />
          </template>
        </div>
      </div>

      <div v-if="displayTopics.length" class="topics">
        <span v-for="item in displayTopics" :key="item">{{ item }}</span>
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
        <template v-if="detail">分享</template>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { showImagePreview } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import LineIcon from '@/components/LineIcon.vue'
import type { PostItem } from '@/api/ops'
import { resolveMediaSrc } from '@/utils/aesbnc'
import { encodeId } from '@/utils/idcrypt'
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
    hideUser?: boolean
  }>(),
  { topics: () => [], essence: false, top: false, followed: false, liked: false, mine: false, detail: false, hideUser: false },
)

const emit = defineEmits<{
  open: [id: number]
  profile: [userId: number]
  follow: [userId: number]
  like: [id: number]
  comment: [id: number]
  share: [id: number]
}>()

type MediaSlot = { type: 'image' | 'video'; src: string }

const name = computed(() => props.post.nickname?.trim() || `用户${encodeId(props.post.user_id)}`)
const avatarSrc = computed(() => mediaUrl(props.post.img))
const pics = computed(() => (props.post.pics || []).map((p) => mediaUrl(p)).filter(Boolean))
const videoSrc = computed(() => mediaUrl(props.post.video_url))
const displayTopics = computed(() => (props.post.topics?.length ? props.post.topics : props.topics))

/** 左大图 + 右上第二张 + 右下视频(或除前两张外的最后一张)。 */
const mediaSlots = computed<MediaSlot[]>(() => {
  const images = pics.value
  const video = videoSrc.value
  const slots: MediaSlot[] = []
  if (images[0]) slots.push({ type: 'image', src: images[0] })
  if (images[1]) slots.push({ type: 'image', src: images[1] })
  if (video) {
    slots.push({ type: 'video', src: video })
  } else if (images.length > 2) {
    slots.push({ type: 'image', src: images[images.length - 1] })
  }
  return slots
})

const formatTime = (raw: string) => {
  if (!raw) return ''
  return raw.replace(/^\d{4}-/, '').slice(0, 11)
}

const videoEl = ref<HTMLVideoElement | null>(null)
const videoPlaying = ref(false)

const onProfile = () => {
  emit('profile', props.post.user_id)
}

const onBody = () => {
  if (!props.detail) emit('open', props.post.id)
}

const onMediaClick = () => {
  if (!props.detail) emit('open', props.post.id)
}

const previewPics = async (index: number) => {
  const urls = (await Promise.all(pics.value.map((p) => resolveMediaSrc(p)))).filter(Boolean)
  if (!urls.length) return
  showImagePreview({ images: urls, startPosition: index })
}

const playVideo = () => {
  if (videoPlaying.value) return
  videoPlaying.value = true
  videoEl.value?.play().catch(() => {
    videoPlaying.value = false
  })
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;
@use '@/styles/tones.scss' as *;

.post-card {
  background: #1c1c22;
  padding: 14px 14px 10px;
  border-bottom: 1px solid #2a2a32;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar,
.user-meta {
  cursor: pointer;
}

.avatar {
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: #f2f2f5;
    line-height: 1.25;
  }

  span {
    font-size: 11px;
    color: #9a9a9a;
  }
}

.follow {
  border: 0;
  background: #ff3d7f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border-radius: 14px;
  padding: 5px 12px;
  line-height: 1.2;
  flex-shrink: 0;

  &.on {
    background: #331020;
    color: #ff6699;
  }
}

.body {
  margin-top: 10px;
}

.text {
  font-size: 15px;
  line-height: 1.55;
  color: #e8e8ee;
  word-break: break-word;

  .post-card:not(.detail) & {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .post-card.detail & {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.title {
  font-weight: 700;
}

.posted {
  margin-top: 6px;
  font-size: 11px;
  color: #9a9a9a;
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

.media {
  margin-top: 10px;
  display: grid;
  gap: 5px;

  &.n-1 {
    grid-template-columns: 1fr;

    .cell {
      aspect-ratio: 16 / 10;
      max-height: 280px;
    }
  }

  &.n-2 {
    grid-template-columns: 2fr 1fr;
    aspect-ratio: 2.05 / 1;
  }

  &.n-3 {
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    aspect-ratio: 2.05 / 1;

    .cell:first-child {
      grid-row: 1 / span 2;
    }
  }
}

.cell {
  position: relative;
  min-width: 0;
  min-height: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #ececec;

  :deep(img),
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.gallery {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shot {
  position: relative;
  width: 100%;
  border: 0;
  padding: 0;
  background: #111;
  border-radius: 6px;
  overflow: hidden;
  display: block;

  :deep(img) {
    width: 100%;
    height: auto;
    display: block;
    object-fit: contain;
    vertical-align: top;
  }

  video {
    width: 100%;
    max-height: 70vh;
    display: block;
    background: #000;
  }
}

.zoom {
  position: absolute;
  left: 8px;
  bottom: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  :deep(.line-icon) {
    width: 14px;
    height: 14px;
  }
}

.play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 14px 0 14px 22px;
    border-color: transparent transparent transparent #fff;
    filter: drop-shadow(0 1px 6px rgba(0, 0, 0, 0.45));
    margin-left: 4px;
  }
}

.topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  span {
    font-size: 12px;
    color: #ff6699;
    background: #331020;
    border-radius: $radius-pill;
    padding: 4px 10px;
    line-height: 1.2;
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
