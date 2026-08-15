<template>
  <div class="page-shell sub-page">
    <PageHeader title="VIP 充值" />
    <section class="plans">
      <button
        v-for="plan in plans"
        :key="plan.name"
        type="button"
        class="plan"
        :class="{ active: current === plan.name }"
        @click="current = plan.name"
      >
        <h3>{{ plan.name }}</h3>
        <p><em>¥{{ plan.price }}</em> / {{ plan.unit }}</p>
        <span>{{ plan.desc }}</span>
      </button>
    </section>
    <button type="button" class="pay" @click="pay">立即开通</button>
    <ul class="rights">
      <li>全站漫画 / 视频畅看</li>
      <li>去广告阅读</li>
      <li>高清线路优先</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'

const plans = [
  { name: '月卡', price: 38, unit: '30天', desc: '适合尝鲜' },
  { name: '季卡', price: 88, unit: '90天', desc: '更划算' },
  { name: '年卡', price: 268, unit: '365天', desc: '畅看一整年' },
]
const current = ref('季卡')

const pay = () => {
  showToast(`${current.value} 支付稍后接入`)
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.plans {
  display: grid;
  gap: 10px;
  padding: 16px 12px;
}

.plan {
  text-align: left;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 12px;
  padding: 14px;

  &.active {
    border-color: $primary-color;
    background: #f8f3fc;
  }

  h3 {
    font-size: 16px;
  }

  p {
    margin: 6px 0;
    color: #666;
  }

  em {
    font-style: normal;
    color: $primary-color;
    font-size: 22px;
    font-weight: 700;
  }

  span {
    font-size: 12px;
    color: #999;
  }
}

.pay {
  display: block;
  width: calc(100% - 24px);
  margin: 0 12px;
  height: 44px;
  border: 0;
  border-radius: 22px;
  background: $primary-color;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.rights {
  padding: 16px 20px;
  color: #666;
  font-size: 13px;
  line-height: 2;
}
</style>
