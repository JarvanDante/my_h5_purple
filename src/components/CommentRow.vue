<template>
  <article class="cmt" :class="{ nested, official }">
    <UserAvatar class="face" :src="avatar" :size="nested ? 28 : 36" :fallback="name" />
    <div class="body">
      <p class="who">
        <strong>{{ name }}</strong>
        <i v-if="item.is_vip || official" class="vip" aria-label="VIP">◆</i>
      </p>
      <p class="text">
        <em v-if="mention" class="at">@{{ mention }}:</em>{{ item.content }}
      </p>
      <button v-if="pic" type="button" class="shot" @click="preview">
        <EncryptedImage :src="pic" alt="" />
      </button>
      <p v-if="official" class="sys">此评论系统生成,无法回复</p>
      <div v-else class="ops">
        <span>{{ time }}</span>
        <button type="button" aria-label="回复" @click="$emit('reply', item)">
          <LineIcon name="comment" />
        </button>
        <button type="button" class="up" :class="{ on: item.liked }" @click="$emit('like', item)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7.2 21H5.1A1.1 1.1 0 0 1 4 19.9v-7.8A1.1 1.1 0 0 1 5.1 11h2.1l3.2-6.2A1.8 1.8 0 0 1 12 3.8c1 0 1.7.9 1.5 1.8L12.8 8H19a2 2 0 0 1 2 2.3l-1.1 7A2.2 2.2 0 0 1 17.7 21H7.2Z"
              :fill="item.liked ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
            />
          </svg>
          {{ item.like_count || 0 }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { showImagePreview } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import LineIcon from '@/components/LineIcon.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import type { CommentItem } from '@/api/ops'
import { encodeId } from '@/utils/idcrypt'
import { mediaUrl } from '@/utils/request'

const props = withDefaults(
  defineProps<{
    item: CommentItem
    nested?: boolean
    official?: boolean
    threadId?: number
  }>(),
  { nested: false, official: false, threadId: 0 },
)

defineEmits<{
  reply: [item: CommentItem]
  like: [item: CommentItem]
}>()

const name = computed(() => props.item.nickname?.trim() || (props.item.user_id ? `用户${encodeId(props.item.user_id)}` : '用户'))
const avatar = computed(() => mediaUrl(props.item.img))
const pic = computed(() => mediaUrl(props.item.pics?.[0] || ''))
const mention = computed(() => {
  const parentId = props.item.parent_id || 0
  const rootId = props.threadId || props.item.root_id || 0
  if (!props.nested || !parentId || !rootId || parentId === rootId) return ''
  return props.item.reply_nickname?.trim() || (props.item.reply_user_id ? `用户${encodeId(props.item.reply_user_id)}` : '')
})

const time = computed(() => {
  const raw = props.item.created_at || ''
  if (!raw) return ''
  const t = new Date(raw.replace(' ', 'T'))
  if (Number.isNaN(t.getTime())) return raw.replace(/^\d{4}-/, '').slice(0, 11)
  const diff = Date.now() - t.getTime()
  if (diff < 60_000) return '刚刚'
  const mm = String(t.getMonth() + 1).padStart(2, '0')
  const dd = String(t.getDate()).padStart(2, '0')
  const hh = String(t.getHours()).padStart(2, '0')
  const mi = String(t.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
})

const preview = () => {
  if (pic.value) showImagePreview([pic.value])
}
</script>

<style scoped lang="scss">
.cmt {
  display: flex;
  gap: 10px;
  padding: 12px 0;
}

.nested {
  padding: 10px 0;

  & + & {
    border-top: 1px solid #2a2a34;
  }
}

.face {
  flex-shrink: 0;
}

.body {
  min-width: 0;
  flex: 1;
}

.who {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;

  strong {
    font-size: 13px;
    font-weight: 700;
    color: #c8c8d0;
  }
}

.vip {
  font-style: normal;
  font-size: 11px;
  color: #f5c14a;
  line-height: 1;
}

.text {
  margin: 6px 0 0;
  font-size: 14px;
  color: #f5f5f8;
  line-height: 1.55;
  word-break: break-word;
}

.at {
  font-style: normal;
  color: #ff5c93;
  margin-right: 2px;
}

.shot {
  display: block;
  margin-top: 8px;
  padding: 0;
  border: 0;
  background: #191920;
  border-radius: 8px;
  overflow: hidden;
  max-width: 168px;

  :deep(img) {
    display: block;
    width: 100%;
    height: auto;
  }
}

.sys {
  margin: 6px 0 0;
  font-size: 11px;
  color: #8c8c9c;
}

.ops {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  color: #8c8c9c;
  font-size: 11px;

  button {
    appearance: none;
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  :deep(.line-icon) {
    width: 14px;
    height: 14px;
  }

  .up {
    margin-left: auto;

    svg {
      width: 15px;
      height: 15px;
    }

    &.on {
      color: #ff5c93;
    }
  }
}
</style>
