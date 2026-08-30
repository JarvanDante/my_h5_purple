<template>
  <div class="page-shell sub-page">
    <PageHeader title="签到明细" fallback="/checkin" />
    <section class="who">
      <UserAvatar :src="avatarSrc" :sex="user?.sex" :size="48" />
      <div>
        <div class="name-row">
          <strong>{{ user?.nickname || '用户' }}</strong>
          <VipBadge :vip="user?.is_vip" />
        </div>
        <div class="pills">
          <span>金币 {{ fmtNum(user?.balance) }}</span>
          <span>积分 {{ fmtNum(user?.credit) }}</span>
        </div>
      </div>
    </section>
    <p v-if="!records.length" class="page-empty">暂无签到记录</p>
    <ul v-else class="logs">
      <li v-for="(row, i) in records" :key="`${row.date}-${i}`">
        <div>
          <strong>{{ titleOf(row) }}</strong>
          <time>{{ row.date.replaceAll('-', '/') }}</time>
        </div>
        <div class="gain">
          <b v-if="row.reward_gold">+{{ row.reward_gold }}金币</b>
          <span v-if="row.reward_points">+{{ row.reward_points }}积分</span>
          <span v-if="row.reward_vip_days">+{{ row.reward_vip_days }}VIP天</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import VipBadge from '@/components/VipBadge.vue'
import { fetchCheckinInfo, type CheckinRecord } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { mediaUrl, toastError } from '@/utils/request'

const userStore = useUserStore()
const user = computed(() => userStore.user)
const avatarSrc = computed(() => mediaUrl(user.value?.img))
const records = ref<CheckinRecord[]>([])

const fmtNum = (n?: number) => {
  const v = Number(n || 0)
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

const titleOf = (row: CheckinRecord) => {
  const bits = [`第${row.continuously_days}天签到`]
  if (row.reward_points) bits.push(`积分+${row.reward_points}`)
  if (row.reward_gold) bits.push(`金币+${row.reward_gold}`)
  if (row.reward_vip_days) bits.push(`VIP+${row.reward_vip_days}天`)
  return bits.join(' ')
}

onMounted(async () => {
  try {
    await userStore.ensureLogin()
    const data = await fetchCheckinInfo()
    records.value = data.records || []
    await userStore.refresh()
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.who {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 16px 8px;

  .name-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  strong {
    font-size: 16px;
    font-weight: 800;
  }
}

.pills {
  display: flex;
  gap: 6px;
  margin-top: 6px;

  span {
    height: 22px;
    padding: 0 8px;
    border-radius: $radius-pill;
    background: #1c1c22;
    color: $text-color-secondary;
    font-size: 11px;
    line-height: 22px;
  }
}

.logs {
  margin: 8px 0 24px;
}

.logs li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid $line;
}

.logs strong {
  display: block;
  font-size: 13px;
}

.logs time {
  display: block;
  margin-top: 4px;
  color: $text-color-muted;
  font-size: 12px;
}

.gain {
  text-align: right;
  flex-shrink: 0;

  b,
  span {
    display: block;
    font-size: 12px;
    color: $primary-color;
  }

  span {
    margin-top: 4px;
    color: #c9a06a;
  }
}
</style>
