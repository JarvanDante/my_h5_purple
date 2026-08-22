<template>
  <div class="page-shell me-page">
    <header class="home-header">
      <div class="channel-row">
        <h1 class="site-name">我的</h1>
        <button type="button" class="checkin-btn" @click="go('/checkin')">
          <span>🎁</span>
          签到
        </button>
      </div>
    </header>

    <section class="soft-card profile">
      <EncryptedImage v-if="avatarSrc" class="avatar" :src="avatarSrc" alt="" />
      <div v-else class="avatar" />
      <div class="meta">
        <h1>{{ user?.nickname || '未登录' }}</h1>
        <button type="button" class="uid-box" @click="copyUid">
          <span>编号</span>
          <strong>{{ uid }}</strong>
          <em>复制</em>
        </button>
      </div>
    </section>

    <section class="account-row">
      <button type="button" @click="go('/account/password')">
        {{ user?.has_password ? '修改密码' : '设置密码' }}
      </button>
      <button type="button" @click="go('/account/login')">账号登录</button>
    </section>

    <section class="hero-cards">
      <button type="button" class="hero vip" @click="go('/vip')">
        <div>
          <strong>会员中心</strong>
          <p>开通 VIP 解锁更多内容</p>
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

    <section class="soft-card quick">
      <button v-for="item in quicks" :key="item.title" type="button" @click="onQuick(item)">
        <span class="q-icon" v-html="item.icon" />
        <span>{{ item.title }}</span>
      </button>
    </section>

    <section class="soft-card circle-row">
      <button v-for="item in circles" :key="item.title" type="button" @click="onCircle(item)">
        <span class="c-icon" :style="{ background: item.bg, color: item.color }">{{ item.mark }}</span>
        <span>{{ item.title }}</span>
      </button>
    </section>

    <section class="soft-card tools">
      <button v-for="item in tools" :key="item.title" type="button" @click="onTool(item)">
        <span class="t-icon" v-html="item.icon" />
        <span>{{ item.title }}</span>
      </button>
    </section>

    <div v-if="showBind" class="bind-mask" @click.self="showBind = false">
      <div class="bind-card">
        <h3>绑定邀请</h3>
        <p>请输入好友编号</p>
        <input v-model="bindCode" type="text" maxlength="16" placeholder="如 000C" />
        <div class="bind-actions">
          <button type="button" @click="showBind = false">取消</button>
          <button type="button" class="ok" :disabled="bindBusy" @click="submitBind">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { bindInviteCode } from '@/api/user'
import { useUserStore } from '@/stores/user'
import EncryptedImage from '@/components/EncryptedImage.vue'
import { mediaUrl, toastError } from '@/utils/request'
import { publicUid } from '@/utils/userid'

defineOptions({ name: 'Me' })

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const uid = computed(() => publicUid(user.value) || '----')
const avatarSrc = computed(() => mediaUrl(user.value?.img))
const showBind = ref(false)
const bindCode = ref('')
const bindBusy = ref(false)

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

const circles = [
  { title: '我的帖子', mark: '帖', bg: '#fff3e6', color: '#f08a24', path: '/planet' },
  { title: '我的视频', mark: '▶', bg: '#fde2f0', color: '#c5303a', path: '/video' },
  { title: '粉丝关注', mark: '♡', bg: '#fde2f0', color: '#f7659f', path: '' },
  { title: 'AI定制', mark: 'AI', bg: '#e8f1ff', color: '#3b7cff', path: '/ai' },
]

const tools = [
  { title: '兑换码', key: 'redeem', icon: iconGift },
  { title: '优惠券', key: 'coupon', icon: iconBag },
  { title: '抽奖', key: 'lottery', icon: iconStar },
  { title: '站内消息', key: 'message', icon: iconChat },
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
  copyText(uid.value, '用户名已复制')
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

const onTool = (item: { title: string; key: string }) => {
  const paths: Record<string, string> = {
    redeem: '/redeem',
    coupon: '/coupon',
    lottery: '/lottery',
    message: '/message',
  }
  if (paths[item.key]) {
    go(paths[item.key])
    return
  }
  if (item.key === 'bind') {
    bindCode.value = ''
    showBind.value = true
    return
  }
  if (item.key === 'credential') {
    copyText(uid.value, '用户名已复制，完整凭证请到子后台查看')
    return
  }
  soon(item.title)
}

const submitBind = async () => {
  const code = bindCode.value.trim()
  if (!code) {
    showToast('请输入好友编号')
    return
  }
  bindBusy.value = true
  try {
    await bindInviteCode(code)
    showBind.value = false
    showToast('绑定成功')
  } catch (err) {
    toastError(err)
  } finally {
    bindBusy.value = false
  }
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
  position: relative;
}

.home-header .channel-row {
  justify-content: space-between;
}

.home-header .site-name {
  font-size: 18px;
  color: #f2f2f5;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar,
:deep(.avatar) {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  object-fit: cover;
  background: linear-gradient(160deg, $secondary-color, $primary-color);
  flex-shrink: 0;
  border: 1.6px solid $ink;
}

.meta {
  flex: 1;
  min-width: 0;

  h1 {
    font-size: 18px;
    font-weight: 700;
    color: #f2f2f5;
  }
}

.uid-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  height: 28px;
  padding: 0 6px 0 10px;
  border: 0;
  border-radius: $radius-pill;
  background: $primary-color-deep;
  color: #fff;

  span {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.9;
  }

  strong {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.6px;
  }

  em {
    font-style: normal;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.22);
  }
}

.account-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 12px;

  button {
    height: 36px;
    border: 1.4px solid $line;
    border-radius: $radius-pill;
    background: #1c1c22;
    color: #ff8ab3;
    font-size: 13px;
    font-weight: 700;
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
  border: 1.6px solid $ink;
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
    opacity: 0.92;
  }

  &.vip {
    background: $primary-color;
  }

  &.wallet {
    background: #ff7aa8;
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

  button {
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #d5d5dc;
  }
}

.q-icon,
.t-icon {
  width: 26px;
  height: 26px;
  color: #d5d5dc;
  display: flex;

  :deep(svg) {
    width: 26px;
    height: 26px;
  }
}

.circle-row {
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
    color: #d5d5dc;
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
  row-gap: 16px;

  button {
    border: 0;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #d5d5dc;
  }
}

.bind-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.bind-card {
  width: 100%;
  max-width: 300px;
  background: #fff;
  border-radius: 16px;
  padding: 18px 16px 12px;
  border: 1.6px solid $ink;

  h3 {
    text-align: center;
    font-size: 16px;
  }

  p {
    margin: 8px 0 12px;
    text-align: center;
    font-size: 13px;
    color: #888;
  }

  input {
    width: 100%;
    height: 40px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 15px;
  }
}

.bind-actions {
  display: flex;
  margin-top: 12px;
  border-top: 1px solid #f2f2f2;

  button {
    flex: 1;
    height: 42px;
    border: 0;
    background: transparent;
    font-size: 15px;
    color: #666;
  }

  .ok {
    color: $ink;
    font-weight: 800;
    border-left: 1px solid #f2f2f2;
  }
}
</style>
