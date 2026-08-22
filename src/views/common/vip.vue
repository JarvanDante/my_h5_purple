<template>
  <div class="page-shell sub-page vip-page">
    <PageHeader title="会员中心">
      <button type="button" class="record" @click="goWallet">充值记录</button>
    </PageHeader>

    <section class="profile">
      <EncryptedImage v-if="avatarSrc" class="avatar" :src="avatarSrc" alt="" />
      <div v-else class="avatar" />
      <div class="meta">
        <div class="name-row">
          <strong>{{ userStore.user?.nickname || '未登录' }}</strong>
          <span v-if="isVip" class="vip-mark">VIP</span>
        </div>
        <p>{{ expireLabel }}</p>
      </div>
    </section>

    <section v-if="list.length" class="plans">
      <button
        v-for="plan in list"
        :key="plan.id"
        type="button"
        class="plan"
        :class="{ active: current === plan.id }"
        @click="current = plan.id"
      >
        <span v-if="current === plan.id" class="badge">限时专享折扣</span>
        <h3>{{ plan.name }}</h3>
        <p class="price"><em>{{ plan.price }}</em> 金币</p>
        <p class="desc">{{ planHint(plan) }}</p>
        <p class="gift">解锁全站 VIP 内容</p>
        <span v-if="current === plan.id" class="timer">倒计时 {{ clock.h }}:{{ clock.m }}:{{ clock.s }}</span>
      </button>
    </section>
    <p v-else class="empty">暂无套餐，请在子后台「会员等级」配置</p>

    <section class="priv">
      <h3>专享特权</h3>
      <div class="priv-grid">
        <article v-for="item in perks" :key="item.title">
          <span class="priv-ico">✦</span>
          <div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <div class="pay-bar">
      <button type="button" class="pay-btn" :disabled="!picked || loading" @click="pay">
        {{ payLabel }}
      </button>
      <p>支付问题反馈，点击联系 <em @click="soon">在线客服</em></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import { buyVip, fetchVipPackages, type VipPackage } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { mediaUrl, toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const list = ref<VipPackage[]>([])
const current = ref(0)
const loading = ref(false)
const clock = ref({ h: '00', m: '00', s: '00' })
let timer = 0

const avatarSrc = computed(() => mediaUrl(userStore.user?.img))
const isVip = computed(() => Boolean(userStore.user?.group_name && userStore.user.group_name !== '普通用户'))
const picked = computed(() => list.value.find((p) => p.id === current.value))
const expireLabel = computed(() => {
  const ext = userStore.user?.ext || {}
  const raw = [ext.vip_expire, ext.expire_at, ext.vip_end_at, ext.vip_at].find((v) => typeof v === 'string' && v)
  if (raw) return `到期时间: ${raw}`
  if (isVip.value) return `当前：${userStore.user?.group_name}`
  return '开通后畅享全站内容'
})
const payLabel = computed(() => {
  if (loading.value) return '开通中…'
  if (!picked.value) return '立即支付'
  return `${picked.value.price}金币 / 立即支付`
})

const perks = [
  { title: '全集畅看', desc: 'VIP 作品不限集数观看' },
  { title: '去广告', desc: '阅读与播放更干净' },
  { title: '高清画质', desc: '优先享受高清资源' },
  { title: '专属标识', desc: '昵称旁展示 VIP 标识' },
  { title: '活动加赠', desc: '充值与活动额外加成' },
  { title: '优先客服', desc: '问题优先响应处理' },
]

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

const planHint = (plan: VipPackage) => {
  if (plan.days >= 36500) return '永久畅看 VIP 内容'
  return `${plan.days} 天畅享全场 VIP`
}

const goWallet = () => router.push('/wallet')
const soon = () => showToast('在线客服稍后接入')

const load = async () => {
  const data = await fetchVipPackages()
  list.value = data.list || []
  if (list.value.length && !current.value) current.value = list.value[0].id
}

const pay = async () => {
  if (!current.value) return
  loading.value = true
  try {
    await buyVip(current.value)
    await userStore.refresh()
    showToast('开通成功')
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  tickClock()
  timer = window.setInterval(tickClock, 1000)
  if (!userStore.loggedIn) {
    userStore.ensureLogin().catch(() => undefined)
  } else {
    userStore.refresh().catch(() => undefined)
  }
  load().catch(toastError)
})

onUnmounted(() => {
  window.clearInterval(timer)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.vip-page {
  background: #0d0d12;
  color: #f5f5f8;
  padding-bottom: calc(108px + env(safe-area-inset-bottom, 0px));
}

.record {
  border: 0;
  background: transparent;
  color: #d8c08a;
  font-size: 13px;
  padding: 0 4px;
}

.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 16px 0;
  padding: 14px;
  background: linear-gradient(135deg, #241c18, #16141c);
  border-radius: 13px;
}

.avatar,
:deep(.avatar) {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  background: #24242e;
  flex-shrink: 0;
}

.meta {
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 6px;

  strong {
    font-size: 16px;
    color: #f5f5f8;
  }
}

.vip-mark {
  font-size: 10px;
  font-weight: 800;
  color: #1a0a12;
  background: linear-gradient(90deg, #ffd27a, #ffb14a);
  border-radius: 4px;
  padding: 1px 5px;
}

.meta p {
  margin-top: 6px;
  font-size: 12px;
  color: #b0b0bd;
}

.plans {
  display: flex;
  gap: 10px;
  padding: 14px 16px 4px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.plan {
  width: 168px;
  min-height: 188px;
  flex-shrink: 0;
  text-align: left;
  border: 0;
  border-radius: 14px;
  padding: 14px 12px 12px;
  background: #191920;
  color: #f5f5f8;
  box-shadow: inset 0 0 0 1px #2a2a34;

  &.active {
    background: linear-gradient(180deg, #2c2218, #16110e);
    box-shadow: inset 0 0 0 1px #c9a227;
  }

  h3 {
    margin-top: 18px;
    font-size: 16px;
    font-weight: 700;
  }
}

.badge {
  display: inline-block;
  font-size: 10px;
  color: #1a1020;
  background: #f5f5f8;
  border-radius: 999px;
  padding: 2px 8px;
}

.price {
  margin-top: 8px;
  color: #b0b0bd;
  font-size: 12px;

  em {
    font-style: normal;
    margin-right: 2px;
    color: #f5f5f8;
    font-size: 26px;
    font-weight: 800;
  }
}

.desc,
.gift {
  margin-top: 6px;
  font-size: 11px;
  color: #8c8c9c;
  line-height: 1.4;
}

.timer {
  display: inline-flex;
  margin-top: 12px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #e23b3b;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  align-items: center;
}

.empty {
  padding: 24px 16px;
  color: #8c8c9c;
  font-size: 13px;
}

.priv {
  padding: 18px 16px 0;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: #e8c36a;
    letter-spacing: 0.04em;
  }
}

.priv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 10px;
  margin-top: 14px;
}

.priv-grid article {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.priv-ico {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #2a2218;
  color: #e8c36a;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.priv-grid strong {
  display: block;
  font-size: 13px;
  color: #f5f5f8;
}

.priv-grid p {
  margin-top: 4px;
  font-size: 11px;
  color: #8c8c9c;
  line-height: 1.4;
}

.pay-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 10px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(180deg, transparent, #0d0d12 18%);
}

.pay-btn {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 23px;
  background: linear-gradient(90deg, #e8c36a, #f6e7b8 48%, #d4a84a);
  color: #3a2a10;
  font-size: 16px;
  font-weight: 800;

  &:disabled {
    opacity: 0.5;
  }
}

.pay-bar p {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: #8c8c9c;

  em {
    font-style: normal;
    color: #e23b3b;
  }
}

@media (min-width: $desktop-preview-min) {
  .pay-bar {
    left: 50%;
    right: auto;
    width: $phone-max-width;
    transform: translateX(-50%);
  }
}
</style>
