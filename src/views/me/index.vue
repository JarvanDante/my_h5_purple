<template>
  <div class="page-shell me-page">
    <header class="me-top">
      <button type="button" class="icon-btn" aria-label="消息" @click="go('/message')">
        <span v-html="iconChat" />
        <i v-if="unread > 0" class="dot" />
      </button>
      <div class="top-right">
        <button type="button" class="icon-btn" aria-label="客服" @click="soon('在线客服')">
          <span v-html="iconHead" />
        </button>
        <button type="button" class="icon-btn" aria-label="设置" @click="go('/settings')">
          <span v-html="iconGear" />
        </button>
      </div>
    </header>

    <section class="profile">
      <button type="button" class="avatar-wrap" @click="onAvatar">
        <UserAvatar :src="avatarSrc" :sex="user?.sex" :size="58" />
      </button>
      <div class="meta">
        <div class="name-row">
          <h1 @click="onName">{{ user?.nickname || '未登录' }}</h1>
          <VipBadge :vip="isVip" size="md" />
        </div>
        <button type="button" class="uid-line" @click="copyUid">
          ID {{ uid }}
          <em>复制</em>
        </button>
      </div>
      <button type="button" class="welfare" @click="go('/lottery')">
        <span v-html="iconGift" />
        福利
      </button>
    </section>

    <section class="vip-banner" @click="go('/vip')">
      <div class="vip-copy">
        <strong>VIP限时特惠 畅享全场</strong>
        <p>
          新用户升级会员特惠
          <span class="timer">
            <b>{{ clock.h }}</b>
            <i>:</i>
            <b>{{ clock.m }}</b>
            <i>:</i>
            <b>{{ clock.s }}</b>
          </span>
        </p>
      </div>
      <button type="button">开通会员 ›</button>
    </section>

    <section class="stats">
      <button type="button" @click="go('/coupon')">
        <strong>{{ user?.credit ?? 0 }}</strong>
        <span>观影券</span>
      </button>
      <button type="button" @click="go('/ai')">
        <strong>0</strong>
        <span>AI脱衣次数</span>
      </button>
      <button type="button" @click="go('/ai/works')">
        <strong>0</strong>
        <span>AI换脸次数</span>
      </button>
    </section>

    <section class="hero-cards">
      <button type="button" class="hero vip" @click="go('/vip')">
        <div>
          <strong>会员中心</strong>
          <p>{{ vipCardText }}</p>
        </div>
        <span class="hero-ico" v-html="iconCrown" />
      </button>
      <button type="button" class="hero wallet" @click="go('/wallet')">
        <div>
          <strong>金币钱包</strong>
          <p>余额 {{ coinText }}</p>
        </div>
        <span class="hero-ico" v-html="iconCoin" />
      </button>
    </section>

    <AdIconGrid />

    <section class="quick">
      <button v-for="item in quicks" :key="item.title" type="button" @click="onQuick(item)">
        <span class="q-icon" v-html="item.icon" />
        <span>{{ item.title }}</span>
      </button>
    </section>

    <section class="menu-list">
      <button v-for="item in menus" :key="item.title" type="button" @click="onMenu(item)">
        <span class="m-icon" v-html="item.icon" />
        <span class="m-title">{{ item.title }}</span>
        <i class="chev">›</i>
      </button>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AdIconGrid from '@/components/AdIconGrid.vue'
import { fetchUnreadCount } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import UserAvatar from '@/components/UserAvatar.vue'
import VipBadge from '@/components/VipBadge.vue'
import { mediaUrl } from '@/utils/request'
import { publicUid } from '@/utils/userid'

defineOptions({ name: 'Me' })

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const uid = computed(() => publicUid(user.value) || '----')
const avatarSrc = computed(() => mediaUrl(user.value?.img))
const isVip = computed(() => {
  if (user.value?.is_vip) return true
  const name = user.value?.group_name || ''
  if (!name || name === '普通用户') return false
  const end = Number(user.value?.group_end_time || 0)
  return !end || end * 1000 > Date.now()
})
const vipCardText = computed(() => {
  if (!isVip.value) return '开通会员'
  const name = user.value?.group_name || 'VIP'
  const end = Number(user.value?.group_end_time || 0)
  if (!end) return name
  return `${name}${new Date(end * 1000).getFullYear()}-`
})
const coinText = computed(() => {
  const n = Number(user.value?.balance ?? 0)
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
})
const clock = ref({ h: '00', m: '00', s: '00' })
const unread = ref(0)
let timer = 0

const loadUnread = async () => {
  try {
    if (!userStore.loggedIn) await userStore.ensureLogin()
    const res = await fetchUnreadCount()
    unread.value = res.count || 0
  } catch {
    unread.value = 0
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
const tickClock = () => {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const sec = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
  clock.value = {
    h: pad(Math.floor(sec / 3600)),
    m: pad(Math.floor((sec % 3600) / 60)),
    s: pad(sec % 60),
  }
}

const iconClock =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4.2l2.6 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M8.2 5.2 6.8 3.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
const iconStar =
  '<svg viewBox="0 0 24 24" fill="none"><path d="m12 4 2.2 5.4L20 10l-4 3.6.9 5.4L12 16.2 7.1 19l.9-5.4L4 10l5.8-.6L12 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconBag =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M6.5 8h11l-.8 11H7.3L6.5 8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8V6.6A3 3 0 0 1 12 3.6 3 3 0 0 1 15 6.6V8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
const iconGift =
  '<svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10" width="15" height="10" rx="1.2" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 10h15M12 10v10M12 10c0-3 3.2-4.6 5-2.6 1 1.1-1.2 2.6-5 2.6ZM12 10c0-3-3.2-4.6-5-2.6-1 1.1 1.2 2.6 5 2.6Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
const iconHeart =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 19.2s-6.6-4.1-8.4-8.1A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8.4 3.7c-1.8 4-8.4 8.1-8.4 8.1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
const iconBadge =
  '<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="3.8" width="12" height="16.4" rx="1.6" stroke="currentColor" stroke-width="1.6"/><path d="m8.8 12.2 2.2 2.2 4.2-4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconLink =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M8 12h8M10 9H8.2A3.2 3.2 0 1 0 8.2 15H10M14 15h1.8A3.2 3.2 0 1 0 15.8 9H14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
const iconApp =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.8 19 8v8l-7 4.2L5 16V8l7-4.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconHead =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M5.6 12.4V11a6.4 6.4 0 0 1 12.8 0v1.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4" y="11.6" width="3.6" height="6.4" rx="1.7" stroke="currentColor" stroke-width="1.8"/><rect x="16.4" y="11.6" width="3.6" height="6.4" rx="1.7" stroke="currentColor" stroke-width="1.8"/><path d="M20 15.6v2.2A2.2 2.2 0 0 1 17.8 20H16.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
const iconChat =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12.1 3.6c4.4 0 7.9 3.1 7.9 7 0 3.8-3.5 7-7.9 7-.9 0-1.8-.1-2.6-.4L5.2 19.4l1.4-3.3C5.2 14.8 4.2 13 4.2 10.6c0-3.9 3.5-7 7.9-7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="8.5" cy="10.6" r="1.05" fill="currentColor"/><circle cx="12.1" cy="10.6" r="1.05" fill="currentColor"/><circle cx="15.7" cy="10.6" r="1.05" fill="currentColor"/></svg>'
const iconGear =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.8 13.99 7.2 17.94 6.06 16.8 10.01 20.4 12 16.8 13.99 17.94 17.94 13.99 16.8 12 20.4 10.01 16.8 6.06 17.94 7.2 13.99 3.6 12 7.2 10.01 6.06 6.06 10.01 7.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.35" stroke="currentColor" stroke-width="1.7"/></svg>'
const iconDots =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="8.2" cy="8.2" r="2.1" stroke="currentColor" stroke-width="1.6"/><circle cx="15.8" cy="8.2" r="2.1" stroke="currentColor" stroke-width="1.6"/><circle cx="8.2" cy="15.8" r="2.1" stroke="currentColor" stroke-width="1.6"/><circle cx="15.8" cy="15.8" r="2.1" stroke="currentColor" stroke-width="1.6"/></svg>'
const iconSmile =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M8.6 10.2h.01M15.4 10.2h.01M8.8 14c.8 1.4 2.1 2 3.2 2s2.4-.6 3.2-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
const iconShare =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M14.5 7.5 19 4.8v6.4L14.5 8.6M19 8H9.2A4.2 4.2 0 0 0 5 12.2V19" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const iconGroup =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="10" cy="9" r="3" stroke="currentColor" stroke-width="1.6"/><path d="M4.8 18.2c.6-2.6 2.6-4 5.2-4s4.6 1.4 5.2 4M16.6 8.2c1.4.2 2.4 1.2 2.4 2.6 0 1.3-.9 2.3-2.1 2.6M17.4 16.4c1.6.2 2.8 1 3.2 2.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
const iconCrown =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M4.5 16.5 6 8.5l6 5 6-5 1.5 8H4.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 8.5 8.2 5.8 12 8.2 15.8 5.8 18 8.5" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconCoin =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="7.2" stroke="currentColor" stroke-width="1.7"/><path d="M10.2 8.8h4.2c1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8H10.8v2.8h4.4M12 8.8V7.6M12 16.8v1.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'

const quicks = [
  { title: '我的购买', path: '/purchase', icon: iconBag },
  { title: '我的收藏', path: '/favorite', icon: iconStar },
  { title: '我的关注', path: '/follow', icon: iconHeart },
  { title: '浏览记录', path: '/history', icon: iconClock },
]

const menus = [
  { title: '创作中心', key: 'create', icon: iconDots },
  { title: '意见反馈', key: 'feedback', icon: iconSmile },
  { title: '邀请分享', key: 'invite', icon: iconShare },
  { title: '兑换中心', key: 'redeem', icon: iconLink },
  { title: '官方社群', key: 'group', icon: iconGroup },
  { title: '福利应用', key: 'app', icon: iconApp },
  { title: '账号凭证', key: 'credential', icon: iconBadge },
]

const go = (path: string) => {
  router.push(path)
}

const soon = (name: string) => {
  showToast(`${name} 稍后接入`)
}

const copyText = async (text: string, ok: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast(ok)
  } catch {
    showToast(text)
  }
}

const copyUid = () => {
  if (!uid.value || uid.value === '----') return
  copyText(uid.value, '编号已复制')
}

const onName = () => {
  if (!userStore.loggedIn) go('/account/login')
}

const onAvatar = () => {
  go(userStore.loggedIn ? '/settings/avatar' : '/account/login')
}

const onQuick = (item: { title: string; path: string }) => {
  if (item.path) {
    go(item.path)
    return
  }
  soon(item.title)
}

const onMenu = (item: { title: string; key: string }) => {
  const paths: Record<string, string> = {
    redeem: '/redeem',
    create: '/creator',
    feedback: '/feedback',
    invite: '/invite',
    group: '/community',
    app: '/apps',
    credential: '/credential',
  }
  if (paths[item.key]) {
    go(paths[item.key])
    return
  }
  soon(item.title)
}

onMounted(() => {
  tickClock()
  timer = window.setInterval(tickClock, 1000)
  if (!userStore.loggedIn) {
    userStore.ensureLogin().catch(() => undefined)
  } else {
    userStore.refresh().catch(() => undefined)
  }
  loadUnread()
})

onActivated(loadUnread)

onUnmounted(() => {
  window.clearInterval(timer)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.me-page {
  position: relative;
  padding: 0 16px calc(#{$tabbar-height} + 28px + env(safe-area-inset-bottom, 0px));
  background: $background-page;
}

.me-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-top: var(--app-header-top);
}

.top-right {
  display: flex;
  gap: 8px;
}

.icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #f2f2f5;
  display: flex;
  align-items: center;
  justify-content: center;

  :deep(svg) {
    width: 24px;
    height: 24px;
  }
}

.dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff3b5c;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 0 16px;
}

.avatar-wrap {
  width: 58px;
  height: 58px;
  padding: 0;
  border: 0;
  background: transparent;
  flex-shrink: 0;
}

.avatar,
:deep(.avatar) {
  display: block;
}

.meta {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 6px;

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
  }
}

.vip-gem {
  width: 16px;
  height: 16px;
  flex-shrink: 0;

  :deep(svg) {
    width: 16px;
    height: 16px;
    display: block;
  }

  &.dim {
    opacity: 0.35;
    filter: grayscale(0.4);
  }
}

.uid-line {
  margin-top: 6px;
  border: 0;
  background: transparent;
  color: #8d8d96;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  em {
    font-style: normal;
    color: #c8c8d0;
    font-size: 11px;
  }
}

.welfare {
  flex-shrink: 0;
  height: 28px;
  border: 0;
  border-radius: 14px 0 0 14px;
  margin-right: -16px;
  padding: 0 10px 0 8px;
  background: #2a2230;
  color: #ffb14a;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  :deep(svg) {
    width: 14px;
    height: 14px;
  }
}

.vip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 72px;
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(90deg, #2a1c28, #1a1420);
}

.vip-copy {
  min-width: 0;

  strong {
    display: block;
    color: #ff5c93;
    font-size: 15px;
    font-weight: 700;
  }

  p {
    margin-top: 8px;
    color: #b8a090;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.timer {
  display: inline-flex;
  align-items: center;
  gap: 3px;

  b {
    min-width: 20px;
    height: 18px;
    border-radius: 3px;
    background: #3a2a28;
    color: #f2d2b0;
    font-size: 10px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  i {
    font-style: normal;
    color: #c8a888;
  }
}

.vip-banner > button {
  flex-shrink: 0;
  height: 30px;
  border: 0;
  border-radius: 999px;
  padding: 0 12px;
  background: #ff5c93;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 18px 0 16px;

  button {
    border: 0;
    background: transparent;
    color: #fff;

    & + button {
      border-left: 1px solid #2a2a32;
    }
  }

  strong {
    display: block;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
  }

  span {
    display: block;
    margin-top: 6px;
    color: #8d8d96;
    font-size: 11px;
  }
}

.hero-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.hero {
  height: 78px;
  border: 0;
  border-radius: 12px;
  padding: 14px 12px;
  text-align: left;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;

  strong {
    display: block;
    font-size: 16px;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    letter-spacing: 0;
    opacity: 0.82;
  }

  &.vip {
    background: linear-gradient(135deg, #3a2a6a, #1c1630);
    box-shadow: inset 0 0 24px rgba(120, 90, 255, 0.18);
  }

  &.wallet {
    background: linear-gradient(135deg, #2a2438, #16141c);
    box-shadow: inset 0 0 24px rgba(255, 92, 147, 0.12);
  }
}

.hero-ico {
  width: 34px;
  height: 34px;
  color: #ffd27a;

  :deep(svg) {
    width: 34px;
    height: 34px;
  }
}

.quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 18px 0 10px;

  button {
    border: 0;
    background: transparent;
    color: #f2f2f5;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}

.q-icon,
.m-icon {
  width: 22px;
  height: 22px;
  color: #f2f2f5;

  :deep(svg) {
    width: 22px;
    height: 22px;
  }
}

.menu-list {
  overflow: hidden;
}

.menu-list button {
  width: 100%;
  height: 44px;
  border: 0;
  background: transparent;
  color: #f2f2f5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 2px;
  font-size: 14px;
}

.m-title {
  flex: 1;
  text-align: left;
}

.chev {
  color: #6a6a74;
  font-style: normal;
  font-size: 18px;
}
</style>
