<template>
  <div class="page-shell sub-page">
    <PageHeader title="抽奖" />
    <section class="hero">
      <p>{{ info?.name || '抽奖活动' }}</p>
      <strong>剩余免费 {{ info?.free_left ?? 0 }} 次</strong>
      <span>金币 {{ info?.balance ?? userStore.user?.balance ?? 0 }}</span>
      <button type="button" :disabled="busy" @click="draw">立即抽奖</button>
    </section>
    <p v-if="info?.notice" class="tip">{{ info.notice }}</p>
    <section class="soft-card prizes">
      <h3>奖品</h3>
      <p v-if="!info?.prizes?.length" class="empty">暂无活动，子后台「运营管理 → 抽奖」配置</p>
      <div v-for="p in info?.prizes || []" :key="p.id" class="prize">
        <b>{{ p.name }}</b>
        <span v-if="p.amount">{{ p.amount }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { drawLottery, fetchLotteryInfo, type LotteryInfo } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const info = ref<LotteryInfo | null>(null)
const busy = ref(false)

const load = async () => {
  info.value = await fetchLotteryInfo(1)
}

const draw = async () => {
  if (busy.value) return
  busy.value = true
  try {
    await userStore.ensureLogin()
    const payType = (info.value?.free_left || 0) > 0 ? 1 : 2
    const res = await drawLottery(1, payType)
    showToast(res.prize_name || '已开奖')
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
  padding: 20px 16px;
  border-radius: 16px;
  background: $primary-color;
  color: $on-accent;
  text-align: center;
  border: 0;

  strong {
    display: block;
    margin: 8px 0 4px;
    font-size: 22px;
  }

  span {
    display: block;
    font-size: 12px;
    opacity: 0.8;
  }

  button {
    margin-top: 14px;
    width: 160px;
    height: 40px;
    border: 0;
    border-radius: 20px;
    background: $on-accent;
    color: $primary-color-deep;
    font-weight: 800;
  }
}

.tip,
.empty {
  margin: 0 16px 8px;
  color: #999;
  font-size: 12px;
}

.prizes {
  h3 {
    font-size: 14px;
    margin-bottom: 10px;
  }
}

.prize {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
</style>
