<template>
  <div class="page-shell sub-page">
    <PageHeader title="优惠券" />
    <section class="soft-card box">
      <h3>可领取</h3>
      <p v-if="!tpls.length" class="empty">暂无可领券，子后台「资金管理 → 优惠券」配置</p>
      <button v-for="t in tpls" :key="t.id" type="button" :disabled="t.received || busy" @click="take(t)">
        <b>{{ t.name }}</b>
        <span>{{ t.type === 2 ? `${t.discount}折` : `${t.face_value} 抵用` }}</span>
        <em>{{ t.received ? '已领取' : '领取' }}</em>
      </button>
    </section>
    <section class="soft-card box">
      <h3>我的券</h3>
      <p v-if="!mine.length" class="empty">还没有券</p>
      <div v-for="c in mine" :key="c.id" class="row">
        <div>
          <b>{{ c.name }}</b>
          <span>{{ c.expire_at }}</span>
        </div>
        <em>{{ c.status_text || (c.type === 2 ? `${c.discount}折` : c.face_value) }}</em>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { fetchCouponTpls, fetchMyCoupons, receiveCoupon, type CouponTpl, type MyCoupon } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const tpls = ref<CouponTpl[]>([])
const mine = ref<MyCoupon[]>([])
const busy = ref(false)

const load = async () => {
  const [a, b] = await Promise.all([fetchCouponTpls(), fetchMyCoupons()])
  tpls.value = a.list || []
  mine.value = b.list || []
}

const take = async (t: CouponTpl) => {
  if (busy.value || t.received) return
  busy.value = true
  try {
    await userStore.ensureLogin()
    await receiveCoupon(t.id)
    showToast('领取成功')
    await load()
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    await userStore.ensureLogin()
    await load()
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.box {
  h3 {
    font-size: 14px;
    margin-bottom: 10px;
  }

  button {
    display: flex;
    align-items: center;
    width: 100%;
    text-align: left;
    border: 1.4px solid $ink;
    background: #fff;
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 8px;

    b {
      flex: 1;
    }

    span {
      color: $primary-color-deep;
      margin-right: 8px;
      font-size: 12px;
    }

    em {
      font-style: normal;
      color: $ink;
      background: $accent-yellow;
      border: 1.2px solid $ink;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 800;
    }
  }
}

.empty {
  color: #999;
  font-size: 13px;
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;

  b {
    display: block;
  }

  span {
    font-size: 11px;
    color: #999;
  }

  em {
    font-style: normal;
    color: $primary-color;
  }
}
</style>
