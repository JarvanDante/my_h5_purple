<template>
  <div class="page-shell me-page">
    <header class="me-title">我的</header>

    <section class="profile">
      <img v-if="avatarSrc" class="avatar" :src="avatarSrc" alt="" />
      <div v-else class="avatar" />
      <div class="meta">
        <h1>{{ user?.nickname || '未登录' }}</h1>
        <button type="button" class="uid-box" @click="copyUid">编号: {{ uid }}</button>
      </div>
      <button type="button" class="checkin" @click="go('/checkin')">
        <span class="gift">🎁</span>
        签到
      </button>
    </section>

    <section class="hero-cards">
      <button type="button" class="hero vip" @click="go('/vip')">
        <div>
          <strong>会员中心</strong>
          <p>升级为VIP获取更多权益</p>
        </div>
        <i class="deco" />
      </button>
      <button type="button" class="hero wallet" @click="go('/wallet')">
        <div>
          <strong>金币钱包</strong>
          <p>余额 {{ user?.balance ?? 0 }}</p>
        </div>
        <i class="deco" />
      </button>
    </section>

    <section class="quick">
      <button v-for="item in quicks" :key="item.title" type="button" @click="onQuick(item)">
        <span class="q-icon" v-html="item.icon" />
        <span>{{ item.title }}</span>
      </button>
    </section>

    <section class="promo-grid">
      <button v-for="item in promos" :key="item.title" type="button" class="promo" @click="soon(item.title)">
        <div class="thumb" :class="`tone-${item.tone}`" />
        <span>{{ item.title }}</span>
      </button>
    </section>

    <section class="circle-row">
      <button v-for="item in circles" :key="item.title" type="button" @click="onCircle(item)">
        <span class="c-icon" :style="{ background: item.bg, color: item.color }">{{ item.mark }}</span>
        <span>{{ item.title }}</span>
      </button>
    </section>

    <section class="tools">
      <button v-for="item in tools" :key="item.title" type="button" @click="onTool(item)">
        <span class="t-icon" v-html="item.icon" />
        <span>{{ item.title }}</span>
      </button>
    </section>

    <aside v-if="showPromo" class="float-promo">
      <button type="button" class="close" @click="showPromo = false">×</button>
      <div class="float-art" />
      <p>同城约会</p>
      <button type="button" class="cta" @click="soon('同城约会')">立即约会</button>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showPromptDialog, showToast } from 'vant'
import { bindInviteCode } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { mediaUrl, toastError } from '@/utils/request'
import { publicUid } from '@/utils/userid'

defineOptions({ name: 'Me' })

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const uid = computed(() => publicUid(user.value) || '----')
const avatarSrc = computed(() => mediaUrl(user.value?.img))
const showPromo = ref(true)

const iconClock =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.7"/><path d="M12 8v4.2l2.6 1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
const iconStar =
  '<svg viewBox="0 0 24 24" fill="none"><path d="m12 4 2.2 5.4L20 10l-4 3.6.9 5.4L12 16.2 7.1 19l.9-5.4L4 10l5.8-.6L12 4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconBag =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M6.5 8h11l-.8 11H7.3L6.5 8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 8V6.6A3 3 0 0 1 12 3.6 3 3 0 0 1 15 6.6V8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
const iconGift =
  '<svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="10" width="15" height="10" rx="1.2" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 10h15M12 10v10M12 10c0-3 3.2-4.6 5-2.6 1 1.1-1.2 2.6-5 2.6ZM12 10c0-3-3.2-4.6-5-2.6-1 1.1 1.2 2.6 5 2.6Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
const iconBadge =
  '<svg viewBox="0 0 24 24" fill="none"><path d="m12 3 2.1 4.4 4.9.6-3.6 3.3.9 4.8L12 14.2 7.7 16.1l.9-4.8-3.6-3.3 4.9-.6L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
const iconLink =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M10 8.2H8.2A3.2 3.2 0 1 0 8.2 14H10M14 15.8h1.8A3.2 3.2 0 1 0 15.8 10H14M9.2 12h5.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
const iconApp =
  '<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="4.5" width="12" height="15" rx="2" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="16.2" r="1" fill="currentColor"/></svg>'
const iconHead =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M5.5 13v-1a6.5 6.5 0 1 1 13 0v1M5.5 13.5v3.2A1.8 1.8 0 0 0 7.3 18.5h.6M18.5 13.5v3.2a1.8 1.8 0 0 1-1.8 1.8h-.6M10 19.2h4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>'
const iconChat =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M6 16.5 4.5 19l3-1.1A8 8 0 1 0 6 16.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
const iconGear =
  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/><path d="m19 13.2-.9 1.6 1 1.6-1.6 1.6-1.6-1-1.6.9L13.2 19h-2.4L10.2 18l-1.6.9-1.6-1 1-1.6L6 13.2 5 12.6v-1.2L6 10.8l.9-1.6-1-1.6 1.6-1.6 1.6 1 1.6-.9L10.8 5h2.4L13.8 6l1.6-.9 1.6 1-1 1.6.9 1.6 1 .6v1.2l-1 .6Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>'

const quicks = [
  { title: '浏览记录', path: '', icon: iconClock },
  { title: '我的收藏', path: '/favorite', icon: iconStar },
  { title: '我的购买', path: '', icon: iconBag },
  { title: '邀请好友', path: 'invite', icon: iconGift },
]

const promos = [
  { title: '空降约爱', tone: 0 },
  { title: '同城约妹', tone: 1 },
  { title: '全国空降', tone: 2 },
  { title: '高端会所', tone: 3 },
  { title: '极品少妇', tone: 4 },
  { title: '学生兼职', tone: 5 },
  { title: '熟女约会', tone: 1 },
  { title: '包养信息', tone: 0 },
  { title: '外围模特', tone: 2 },
]

const circles = [
  { title: '我的帖子', mark: '帖', bg: '#fff3e6', color: '#f08a24', path: '/planet' },
  { title: '我的视频', mark: '▶', bg: '#ffe8ea', color: '#ee3a4a', path: '/video' },
  { title: '粉丝关注', mark: '♡', bg: '#ffe8f2', color: '#e85a9a', path: '' },
  { title: 'AI定制', mark: 'AI', bg: '#e8f1ff', color: '#3b7cff', path: '/ai' },
]

const tools = [
  { title: '账户凭证', key: 'credential', icon: iconBadge },
  { title: '绑定邀请', key: 'bind', icon: iconLink },
  { title: '应用中心', key: 'app', icon: iconApp },
  { title: '在线客服', key: 'kefu', icon: iconHead },
  { title: '官方群聊', key: 'group', icon: iconChat },
  { title: '设置', key: 'setting', icon: iconGear },
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

const onQuick = (item: { title: string; path: string }) => {
  if (item.path === 'invite') {
    copyText(uid.value, `邀请码 ${uid.value} 已复制`)
    return
  }
  if (item.path) {
    go(item.path)
    return
  }
  soon(item.title)
}

const onCircle = (item: { title: string; path: string }) => {
  if (item.path) {
    go(item.path)
    return
  }
  soon(item.title)
}

const onTool = async (item: { title: string; key: string }) => {
  if (item.key === 'bind') {
    try {
      const code = await showPromptDialog({
        title: '绑定邀请',
        message: '请输入好友编号',
      })
      await bindInviteCode(String(code).trim())
      showToast('绑定成功')
    } catch (err) {
      if (err === 'cancel' || err === undefined) return
      toastError(err)
    }
    return
  }
  if (item.key === 'credential') {
    copyText(uid.value, '编号已复制，完整凭证请到子后台查看')
    return
  }
  soon(item.title)
}

onMounted(() => {
  if (!userStore.loggedIn) {
    userStore.ensureLogin().catch(() => undefined)
  } else {
    userStore.refresh().catch(() => undefined)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.me-page {
  background: #fff;
  position: relative;
}

.me-title {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 600;
}

.profile {
  display: flex;
  align-items: center;
  padding: 4px 16px 14px;
  gap: 12px;
}

.avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(160deg, #fdb927, #8a6bb3);
  flex-shrink: 0;
}

.meta {
  flex: 1;
  min-width: 0;

  h1 {
    font-size: 18px;
    font-weight: 700;
    color: #222;
  }
}

.uid-box {
  margin-top: 6px;
  height: 22px;
  padding: 0 8px;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  background: #fff;
  color: #ff4d4f;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.checkin {
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #333;
  flex-shrink: 0;

  .gift {
    font-size: 22px;
    line-height: 1;
  }
}

.hero-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;
}

.hero {
  height: 76px;
  border: 0;
  border-radius: 12px;
  padding: 12px 12px 10px;
  text-align: left;
  color: #fff;
  position: relative;
  overflow: hidden;

  strong {
    display: block;
    font-size: 16px;
  }

  p {
    margin-top: 6px;
    font-size: 11px;
    opacity: 0.9;
  }

  &.vip {
    background: linear-gradient(120deg, #ff6b7a, #ff3d5a);
  }

  &.wallet {
    background: linear-gradient(120deg, #ffb347, #ff8a1f);
  }
}

.deco {
  position: absolute;
  right: -8px;
  bottom: -18px;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
}

.quick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 16px 8px 8px;

  button {
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #333;
  }
}

.q-icon,
.t-icon {
  width: 26px;
  height: 26px;
  color: #333;
  display: flex;

  :deep(svg) {
    width: 26px;
    height: 26px;
  }
}

.promo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 8px 12px 4px;
}

.promo {
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;

  span {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: #333;
  }
}

.thumb {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 10px;
}

.tone-0 { background: linear-gradient(180deg, #f3c9b8, #c47a6a); }
.tone-1 { background: linear-gradient(180deg, #e8b7c8, #b86b86); }
.tone-2 { background: linear-gradient(180deg, #d9c4b0, #a07858); }
.tone-3 { background: linear-gradient(180deg, #c9b8d9, #7a6aa0); }
.tone-4 { background: linear-gradient(180deg, #f0d0a8, #c4894a); }
.tone-5 { background: linear-gradient(180deg, #c8d8e8, #6a8aaa); }

.circle-row {
  margin: 12px;
  padding: 12px 4px;
  border-radius: 14px;
  background: #f3f6fb;
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  button {
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #333;
  }
}

.c-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.tools {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 4px 8px 24px;
  row-gap: 16px;

  button {
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #333;
  }
}

.float-promo {
  position: absolute;
  right: 12px;
  bottom: calc(#{$tabbar-height} + 18px);
  width: 92px;
  padding: 8px 8px 10px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  z-index: 8;
  text-align: center;

  p {
    margin: 6px 0 8px;
    font-size: 12px;
    font-weight: 600;
  }
}

.close {
  position: absolute;
  top: 2px;
  right: 4px;
  width: 18px;
  height: 18px;
  border: 0;
  background: transparent;
  color: #999;
  font-size: 16px;
  line-height: 1;
}

.float-art {
  height: 64px;
  border-radius: 8px;
  background: linear-gradient(180deg, #f3c9b8, #c47a6a);
}

.cta {
  width: 100%;
  height: 26px;
  border: 0;
  border-radius: 13px;
  background: #ff5a8a;
  color: #fff;
  font-size: 11px;
}
</style>
