<template>
  <div class="page-shell sub-page wallet-page">
    <PageHeader title="金币钱包" />

    <section class="hero">
      <div class="hero-copy">
        <p>当前余额</p>
        <strong>{{ wallet?.balance ?? userStore.user?.balance ?? 0 }}<i>币</i></strong>
      </div>
      <button type="button" class="detail-btn" @click="goWaters">余额明细</button>
    </section>

    <section v-if="packs.length" class="packs">
      <h3>选择充值金额</h3>
      <div class="grid">
        <button
          v-for="p in packs"
          :key="p.id"
          type="button"
          class="pack"
          :class="{ active: current === p.id }"
          @click="current = p.id"
        >
          <b>{{ p.coin }}</b>
          <span>{{ p.amount }}元</span>
          <em v-if="p.bonus">送{{ p.bonus }}金币</em>
        </button>
      </div>
    </section>
    <p v-else class="empty">暂无充值套餐</p>

    <p class="hint">到账可能略有延迟，以钱包余额为准。<br />如未到账请稍后刷新或联系客服。</p>

    <div class="pay-bar">
      <button type="button" class="pay-btn" :disabled="!picked || paying" @click="buy">
        {{ paying ? '支付中…' : '购买金币' }}
      </button>
      <p>支付中如有问题反馈，请联系 <em @click="soon">客服中心</em></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { createRecharge, fetchRechargePackages, mockPayRecharge, type RechargePackage } from '@/api/user'
import { fetchWalletBalance, type WalletBalance } from '@/api/wallet'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const wallet = ref<WalletBalance | null>(null)
const packs = ref<RechargePackage[]>([])
const current = ref(0)
const paying = ref(false)
const picked = computed(() => packs.value.find((p) => p.id === current.value))

const soon = () => showToast('客服中心稍后接入')
const goWaters = () => router.push('/wallet/waters')

const loadWallet = async () => {
  wallet.value = await fetchWalletBalance()
}

const buy = async () => {
  const p = picked.value
  if (!p || paying.value) return
  paying.value = true
  try {
    await userStore.ensureLogin()
    const order = await createRecharge(p.id)
    await mockPayRecharge(order.order_no)
    await Promise.all([loadWallet(), userStore.refresh()])
    showToast(`已到账 ${order.coin} 金币`)
  } catch (err) {
    toastError(err)
  } finally {
    paying.value = false
  }
}

onMounted(async () => {
  try {
    const r = await fetchRechargePackages()
    packs.value = r.list || []
    if (packs.value.length) current.value = packs.value[0].id
    await loadWallet()
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.wallet-page {
  background: #0d0d12;
  color: #f5f5f8;
  padding-bottom: calc(108px + env(safe-area-inset-bottom, 0px));
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 16px 0;
  padding: 18px 16px;
  border-radius: 14px;
  background: linear-gradient(90deg, #d91259, #ff3d7f 52%, #ff8fb3);
  color: #fff;
}

.hero-copy p {
  font-size: 13px;
  opacity: 0.8;
}

.hero-copy strong {
  display: block;
  margin-top: 6px;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;

  i {
    margin-left: 4px;
    font-style: normal;
    font-size: 14px;
    font-weight: 600;
  }
}

.detail-btn {
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: #ff3d7f;
  font-size: 12px;
  font-weight: 700;
}

.packs {
  padding: 18px 16px 0;

  h3 {
    font-size: 15px;
    font-weight: 700;
    color: #f5f5f8;
    margin-bottom: 12px;
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.pack {
  position: relative;
  min-height: 88px;
  border: 0;
  border-radius: 12px;
  padding: 14px 8px 22px;
  background: #191920;
  color: #f5f5f8;
  box-shadow: inset 0 0 0 1px #2a2a34;
  overflow: hidden;

  &.active {
    box-shadow: inset 0 0 0 2px #ff3d7f;
    background: #331020;
  }

  b {
    display: block;
    font-size: 22px;
    font-weight: 800;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #8c8c9c;
  }

  em {
    position: absolute;
    left: 0;
    bottom: 0;
    font-style: normal;
    font-size: 10px;
    color: #fff;
    background: #e23b3b;
    border-radius: 0 8px 0 0;
    padding: 2px 7px;
  }
}

.hint {
  margin: 16px 20px 0;
  text-align: center;
  font-size: 11px;
  line-height: 1.6;
  color: #8c8c9c;
}

.empty {
  padding: 16px 0;
  color: #8c8c9c;
  font-size: 13px;
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
  background: #ff3d7f;
  color: #fff;
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
