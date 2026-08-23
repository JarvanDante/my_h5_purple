<template>
  <div class="page-shell sub-page">
    <PageHeader title="每日签到" />
    <section class="hero">
      <p>连续签到</p>
      <strong>{{ info?.continuously_days ?? 0 }} 天</strong>
      <button type="button" :disabled="info?.today_checked || busy" @click="sign">
        {{ info?.today_checked ? '今日已签到' : '立即签到' }}
      </button>
    </section>
    <section class="soft-card days">
      <div
        v-for="item in rewards"
        :key="item.day_num"
        class="day"
        :class="{ on: (info?.continuously_days ?? 0) >= item.day_num }"
      >
        <span>第{{ item.day_num }}天</span>
        <b>+{{ item.gold }}</b>
      </div>
    </section>
    <p class="tip">签到领取金币，规则在子后台「用户管理 / 成长」配置。</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { doCheckin, fetchCheckinInfo, type CheckinInfo } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const info = ref<CheckinInfo | null>(null)
const busy = ref(false)
const rewards = computed(() => info.value?.rewards?.length ? info.value.rewards : [
  { day_num: 1, gold: 10, vip_days: 0 },
  { day_num: 2, gold: 20, vip_days: 0 },
  { day_num: 3, gold: 30, vip_days: 0 },
  { day_num: 7, gold: 70, vip_days: 0 },
])

const load = async () => {
  info.value = await fetchCheckinInfo()
}

const sign = async () => {
  if (busy.value || info.value?.today_checked) return
  busy.value = true
  try {
    await userStore.ensureLogin()
    const res = await doCheckin()
    showToast(res.message || '签到成功')
    await Promise.all([load(), userStore.refresh()])
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

.hero {
  margin: 16px 12px;
  padding: 24px 16px;
  border-radius: 16px;
  background: $primary-color;
  color: $on-accent;
  text-align: center;
  border: 0;

  p {
    font-size: 13px;
    opacity: 0.8;
  }

  strong {
    display: block;
    margin: 8px 0 16px;
    font-size: 32px;
  }

  button {
    width: 160px;
    height: 40px;
    border: 0;
    border-radius: 20px;
    background: $on-accent;
    color: $primary-color-deep;
    font-weight: 800;

    &:disabled {
      opacity: 0.7;
    }
  }
}

.days {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.day {
  background: $background-surface2;
  border: 1px solid $line;
  border-radius: 8px;
  padding: 10px 6px;
  text-align: center;
  color: $text-color-secondary;

  span {
    display: block;
    font-size: 11px;
  }

  b {
    display: block;
    margin-top: 4px;
    color: $primary-color;
  }

  &.on {
    background: $primary-color;
    color: $on-accent;
    font-weight: 700;
  }
}

.tip {
  margin: 16px 12px;
  color: #999;
  font-size: 12px;
}
</style>
