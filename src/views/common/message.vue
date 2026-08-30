<template>
  <div class="page-shell sub-page msg-page">
    <PageHeader title="消息" fallback="/me">
      <button v-if="tabUnread" type="button" class="read-btn" @click="readAll">全部已读</button>
    </PageHeader>

    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="tab"
        :class="{ active: tab === item.key }"
        @click="select(item.key)"
      >
        {{ item.label }}
        <i v-if="unread[item.key] > 0" class="count">{{ badge(unread[item.key]) }}</i>
      </button>
    </div>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="pane">
          <p v-if="loading" class="empty">加载中…</p>
          <p v-else-if="empty" class="empty">当前页面暂无内容～</p>

          <template v-else-if="tab === 'sys'">
            <button
              v-for="m in sysList"
              :key="m.id"
              type="button"
              class="card"
              :class="{ unread: !m.is_read }"
              @click="openSys(m)"
            >
              <i v-if="!m.is_read" class="dot" />
              <div class="meta">
                <b>{{ m.title }}</b>
                <p>{{ m.content }}</p>
                <span>{{ m.created_at }}</span>
              </div>
            </button>
          </template>

          <template v-else>
            <button
              v-for="m in interactList"
              :key="m.id"
              type="button"
              class="row"
              :class="{ unread: !m.is_read }"
              @click="openInteract(m)"
            >
              <UserAvatar
                :src="mediaUrl(m.actor_avatar)"
                :sex="m.actor_sex"
                :size="44"
                :fallback="actorName(m)"
                :vip="m.actor_is_vip"
              />
              <div class="body">
                <div class="line">
                  <strong>{{ actorName(m) }}</strong>
                  <VipBadge :vip="m.actor_is_vip" />
                  <em>{{ actionText(m) }}</em>
                </div>
                <p v-if="m.snippet">{{ m.snippet }}</p>
                <span>{{ m.created_at }}</span>
              </div>
              <span class="view" aria-hidden="true">
                查看
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 5.5 15.5 12 9 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <i v-if="!m.is_read" class="dot side" />
            </button>
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import VipBadge from '@/components/VipBadge.vue'
import {
  fetchInteractMessages,
  fetchMessages,
  fetchUnreadCount,
  readInteractMessage,
  readMessage,
  type InteractItem,
  type MessageItem,
} from '@/api/ops'
import { useTabSlide } from '@/composables/useTabSlide'
import { useUserStore } from '@/stores/user'
import { comicPath, encodeId, postPath, videoPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

const tabs = [
  { key: 'comment', label: '评论' },
  { key: 'like', label: '点赞' },
  { key: 'sys', label: '站内消息' },
] as const

type TabKey = (typeof tabs)[number]['key']

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const keys = tabs.map((t) => t.key)
const initial = keys.includes(String(route.query.tab) as TabKey) ? String(route.query.tab) : 'comment'
const slide = useTabSlide(keys, initial)
const tab = computed(() => slide.current.value as TabKey)
const name = computed(() => slide.name.value)

const sysList = ref<MessageItem[]>([])
const interactList = ref<InteractItem[]>([])
const loading = ref(false)
const unread = ref({ sys: 0, comment: 0, like: 0 })

const tabUnread = computed(() => unread.value[tab.value] > 0)
const empty = computed(() => (tab.value === 'sys' ? !sysList.value.length : !interactList.value.length))

const select = (key: TabKey) => slide.select(key)
const badge = (n: number) => (n > 99 ? '99+' : String(n))

const actorName = (m: InteractItem) => m.actor_name?.trim() || (m.actor_id ? `用户${encodeId(m.actor_id)}` : '用户')

const actionText = (m: InteractItem) => {
  const n = m.actor_count || 1
  switch (m.sub_type) {
    case 'reply':
      return '回复了你的评论'
    case 'mention':
      return '回复了你'
    case 'comment_like':
      return n > 1 ? `等${n}人赞了你的评论` : '赞了你的评论'
    case 'post_like':
      return n > 1 ? `等${n}人赞了你的帖子` : '赞了你的帖子'
    default:
      return '评论了你的帖子'
  }
}

const loadUnread = async () => {
  const b = await fetchUnreadCount()
  unread.value = {
    sys: b.sys || 0,
    comment: b.comment || 0,
    like: b.like || 0,
  }
}

const load = async () => {
  loading.value = true
  sysList.value = []
  interactList.value = []
  try {
    if (!userStore.loggedIn) await userStore.ensureLogin()
    await loadUnread()
    if (tab.value === 'sys') {
      const a = await fetchMessages()
      sysList.value = a.list || []
    } else {
      const a = await fetchInteractMessages(tab.value)
      interactList.value = a.list || []
    }
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

const openSys = async (m: MessageItem) => {
  if (!m.is_read) {
    await readMessage(m.id)
    m.is_read = true
    unread.value.sys = Math.max(0, unread.value.sys - 1)
  }
  showToast(m.content || m.title)
}

const openInteract = async (m: InteractItem) => {
  if (!m.is_read) {
    await readInteractMessage(m.id)
    m.is_read = true
    unread.value[tab.value === 'like' ? 'like' : 'comment'] = Math.max(
      0,
      unread.value[tab.value === 'like' ? 'like' : 'comment'] - 1,
    )
  }
  if (m.media_type === 2 && m.content_id) {
    router.push(
      postPath(m.content_id, {
        comment: m.comment_id || undefined,
        page: m.page || 1,
      }),
    )
    return
  }
  if (m.media_type === 1 && m.content_id) {
    router.push(`${videoPath(m.content_id)}?tab=comment`)
    return
  }
  if (m.media_type === 4 && m.content_id) {
    router.push(`${comicPath(m.content_id)}?tab=comment`)
    return
  }
  showToast(m.snippet || actionText(m))
}

const readAll = async () => {
  try {
    if (tab.value === 'sys') {
      await readMessage(0, true)
    } else {
      await readInteractMessage(0, true, tab.value)
    }
    await load()
  } catch (err) {
    toastError(err)
  }
}

watch(tab, load)
onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.msg-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
}

.read-btn {
  border: 0;
  background: transparent;
  color: #ff3d7f;
  font-size: 13px;
  font-weight: 700;
  padding: 0 8px;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 4px 8px 0;
  border-bottom: 1px solid #22222b;
}

.tab {
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 14px 12px 8px;
  position: relative;

  &.active {
    color: #f5f5f8;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 22px;
      height: 3px;
      border-radius: 2px;
      background: #ff3d7f;
      transform: translateX(-50%);
    }
  }
}

.count {
  position: absolute;
  top: 4px;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #ff3d7f;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  font-style: normal;
  line-height: 16px;
  text-align: center;
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.pane {
  padding: 8px 16px 24px;
}

.empty {
  padding: 64px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  text-align: left;
  border: 0;
  background: #191920;
  border-radius: 14px;
  padding: 14px 12px;
  margin-bottom: 10px;
  color: inherit;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 12px 0;
  border-bottom: 1px solid #1c1c24;
  color: inherit;
}

.dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: #ff3d7f;
  flex-shrink: 0;

  &.side {
    margin-top: 18px;
  }
}

.meta {
  min-width: 0;
  flex: 1;

  b {
    display: block;
    font-size: 14px;
    font-weight: 700;
  }

  p {
    margin: 6px 0 4px;
    font-size: 13px;
    line-height: 1.5;
    color: #c8c8d0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  span {
    font-size: 11px;
    color: #8c8c9c;
  }
}

.body {
  min-width: 0;
  flex: 1;

  .line {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px;
  }

  strong {
    font-size: 14px;
    font-weight: 700;
  }

  em {
    font-style: normal;
    font-size: 13px;
    color: #8c8c9c;
  }

  p {
    margin: 4px 0 2px;
    font-size: 13px;
    line-height: 1.45;
    color: #c8c8d0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 11px;
    color: #8c8c9c;
  }
}

.view {
  flex-shrink: 0;
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #ff3d7f;
  font-weight: 700;

  svg {
    width: 14px;
    height: 14px;
  }
}

.unread .meta b,
.unread .body strong {
  color: #ff6699;
}
</style>
