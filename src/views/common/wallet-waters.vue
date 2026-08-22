<template>
  <div class="page-shell sub-page waters-page">
    <PageHeader title="余额明细" fallback="/wallet" />

    <section class="hero">
      <div class="hero-copy">
        <p>当前余额</p>
        <strong>{{ wallet?.balance ?? userStore.user?.balance ?? 0 }}<i>币</i></strong>
      </div>
      <div class="hero-side">
        <span>累计收入 {{ wallet?.total_in ?? 0 }}</span>
        <span>累计支出 {{ wallet?.total_out ?? 0 }}</span>
      </div>
    </section>

    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="tab"
        :class="{ active: tab === item.key }"
        @click="select(item.key)"
      >
        {{ item.title }}
      </button>
    </div>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="pane">
          <p v-if="loading" class="empty">加载中…</p>
          <p v-else-if="!list.length" class="empty">当前页面暂无内容～</p>
          <article v-for="w in list" :key="w.id" class="row">
            <i class="dot" :class="{ out: w.direction === 2 }" />
            <div class="meta">
              <b>{{ w.remark || sceneLabel(w.scene) }}</b>
              <span>{{ w.created_at }}</span>
            </div>
            <em :class="{ out: w.direction === 2 }">{{ w.direction === 2 ? '-' : '+' }}{{ w.amount }}</em>
          </article>
          <p v-if="list.length && !loading" class="end">没有更多了</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchWalletBalance, fetchWalletWaters, type WalletBalance, type WaterItem } from '@/api/wallet'
import { useTabSlide } from '@/composables/useTabSlide'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const tabs = [
  { key: 'all', title: '全部', direction: '' },
  { key: 'in', title: '收入', direction: '1' },
  { key: 'out', title: '支出', direction: '2' },
] as const

const userStore = useUserStore()
const slide = useTabSlide(tabs.map((t) => t.key), 'all')
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const wallet = ref<WalletBalance | null>(null)
const list = ref<WaterItem[]>([])
const loading = ref(false)

const select = (item: string) => slide.select(item)

const sceneLabel = (scene: string) => {
  const map: Record<string, string> = {
    recharge: '充值到账',
    vip: '开通会员',
    exchange: '兑换到账',
    lottery: '抽奖',
    redeem_code: '兑换码到账',
    redeem_goods: '兑换商品',
    withdraw: '提现',
  }
  return map[scene] || scene || '余额变动'
}

const load = async () => {
  loading.value = true
  try {
    await userStore.ensureLogin()
    const direction = tabs.find((t) => t.key === tab.value)?.direction || ''
    const [bal, waters] = await Promise.all([
      wallet.value ? Promise.resolve(wallet.value) : fetchWalletBalance(),
      fetchWalletWaters(1, 50, direction),
    ])
    wallet.value = bal
    list.value = waters.list || []
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

watch(tab, () => load(), { immediate: true })
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.waters-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
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

.hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.92;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 8px;
  padding: 4px 8px 0;
  border-bottom: 1px solid #22222b;
}

.tab {
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 8px 12px;
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

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.pane {
  padding: 8px 16px 32px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 12px;
  margin-top: 10px;
  border-radius: 12px;
  background: #191920;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ee59d;
  flex-shrink: 0;

  &.out {
    background: #ff5a5a;
  }
}

.meta {
  min-width: 0;
  flex: 1;

  b {
    display: block;
    font-size: 14px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #8c8c9c;
  }
}

.row em {
  flex-shrink: 0;
  font-style: normal;
  font-size: 16px;
  font-weight: 800;
  color: #2ee59d;

  &.out {
    color: #ff5a5a;
  }
}

.empty {
  padding: 64px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.end {
  padding: 18px 0 8px;
  text-align: center;
  font-size: 12px;
  color: #8c8c9c;
}
</style>
