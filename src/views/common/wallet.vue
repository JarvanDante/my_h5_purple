<template>
  <div class="page-shell sub-page">
    <PageHeader title="金币钱包" />
    <section class="hero">
      <p>可用金币</p>
      <strong>{{ wallet?.balance ?? userStore.user?.balance ?? 0 }}</strong>
      <span>累计入账 {{ wallet?.total_in ?? 0 }} · 支出 {{ wallet?.total_out ?? 0 }}</span>
    </section>
    <section v-if="packs.length" class="soft-card packs">
      <h3>充值套餐</h3>
      <button
        v-for="p in packs"
        :key="p.id"
        type="button"
        :disabled="paying"
        @click="buy(p)"
      >
        {{ p.name }} · {{ p.coin }}+{{ p.bonus }} 金币 / {{ p.amount }}
      </button>
    </section>
    <section class="soft-card waters">
      <h3>流水</h3>
      <p v-if="!waters.length" class="empty">暂无流水，点套餐 mock 支付后会出现</p>
      <div v-for="w in waters" :key="w.id" class="row">
        <div>
          <b>{{ w.remark || w.scene }}</b>
          <span>{{ w.created_at }}</span>
        </div>
        <em :class="{ out: w.direction === 2 }">{{ w.direction === 2 ? '-' : '+' }}{{ w.amount }}</em>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { createRecharge, fetchRechargePackages, mockPayRecharge, type RechargePackage } from '@/api/user'
import { fetchWalletBalance, fetchWalletWaters, type WalletBalance, type WaterItem } from '@/api/wallet'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const wallet = ref<WalletBalance | null>(null)
const waters = ref<WaterItem[]>([])
const packs = ref<RechargePackage[]>([])
const paying = ref(false)

const loadWallet = async () => {
  const [b, w] = await Promise.all([fetchWalletBalance(), fetchWalletWaters(1, 20)])
  wallet.value = b
  waters.value = w.list || []
}

const buy = async (p: RechargePackage) => {
  if (paying.value) return
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
    await loadWallet()
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.hero {
  margin: 16px 12px;
  padding: 20px 16px;
  border-radius: 16px;
  background: $primary-color;
  color: $ink;
  border: 1.6px solid $ink;

  p {
    font-size: 13px;
    opacity: 0.8;
  }

  strong {
    display: block;
    margin: 8px 0 6px;
    font-size: 32px;
  }

  span {
    font-size: 12px;
    opacity: 0.75;
  }
}

.packs,
.waters {
  h3 {
    font-size: 14px;
    margin-bottom: 10px;
  }
}

.packs button {
  display: block;
  width: 100%;
  text-align: left;
  border: 1.4px solid $ink;
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  font-size: 13px;
}

.empty {
  color: #999;
  font-size: 13px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;

  b {
    display: block;
    font-size: 14px;
  }

  span {
    font-size: 11px;
    color: #999;
  }

  em {
    font-style: normal;
    color: #16a34a;
    font-weight: 700;

    &.out {
      color: #dc2626;
    }
  }
}
</style>
