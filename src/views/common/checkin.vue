<template>
  <div class="page-shell sub-page checkin-page">
    <PageHeader title="福利任务" />

    <section class="who">
      <UserAvatar :src="avatarSrc" :sex="user?.sex" :size="48" />
      <div class="who-meta">
        <strong>ID {{ uid }}</strong>
        <div class="pills">
          <span>金币 {{ fmtNum(user?.balance) }}</span>
          <span>积分 {{ fmtNum(user?.credit) }}</span>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-head">
        <p>连续签到 <b>{{ info?.continuously_days ?? 0 }}</b> 天</p>
        <button type="button" class="ghost" @click="router.push('/checkin/detail')">签到明细</button>
      </div>
      <div class="days" :class="{ wrap: expanded }">
        <div
          v-for="item in shownRewards"
          :key="item.day_num"
          class="day"
          :class="{ on: claimed(item.day_num), mile: item.is_milestone === 1 }"
        >
          <em>{{ item.label || `第${item.day_num}天` }}</em>
          <i v-if="claimed(item.day_num)" class="ok">✓</i>
          <span v-else-if="item.vip_days > 0">{{ item.vip_days }}天VIP</span>
          <span v-else-if="item.gold > 0">金币{{ item.gold }}</span>
          <span v-else>积分{{ item.points || 0 }}</span>
          <small v-if="item.points && !(item.vip_days > 0 && !item.gold)">积分{{ item.points }}</small>
        </div>
      </div>
      <button v-if="rewards.length > 5" type="button" class="more" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </button>
      <button type="button" class="sign" :disabled="info?.today_checked || busy" @click="sign">
        {{ info?.today_checked ? '今日已签到' : '立即签到' }}
      </button>
    </section>

    <section v-if="tasks.length" class="tasks">
      <h3>赚积分任务</h3>
      <article v-for="t in tasks" :key="t.id" class="task">
        <div>
          <strong>{{ t.name }}</strong>
          <p>{{ t.description || `奖励 ${fmtNum(t.reward)} 积分` }}</p>
        </div>
        <button
          type="button"
          :disabled="t.done_today >= t.max_num || taskBusy === t.id"
          @click="claimTask(t)"
        >
          {{ t.done_today >= t.max_num ? '已完成' : '去领取' }}
        </button>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { doCheckin, fetchCheckinInfo, type CheckinInfo, type CheckinReward } from '@/api/ops'
import { doUserTask, fetchUserTasks, type UserTask } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { mediaUrl, toastError } from '@/utils/request'
import { publicUid } from '@/utils/userid'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const uid = computed(() => publicUid(user.value) || '----')
const avatarSrc = computed(() => mediaUrl(user.value?.img))
const info = ref<CheckinInfo | null>(null)
const tasks = ref<UserTask[]>([])
const busy = ref(false)
const taskBusy = ref(0)
const expanded = ref(false)

const rewards = computed<CheckinReward[]>(() => info.value?.rewards || [])
const shownRewards = computed(() => (expanded.value ? rewards.value : rewards.value.slice(0, 5)))

const claimed = (day: number) => (info.value?.continuously_days ?? 0) >= day

const fmtNum = (n?: number) => {
  const v = Number(n || 0)
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

const load = async () => {
  info.value = await fetchCheckinInfo()
  try {
    const data = await fetchUserTasks()
    tasks.value = data.list || []
  } catch {
    tasks.value = []
  }
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

const claimTask = async (t: UserTask) => {
  if (taskBusy.value) return
  taskBusy.value = t.id
  try {
    const res = await doUserTask(t.id)
    showToast(`+${fmtNum(res.reward)} 积分`)
    await Promise.all([load(), userStore.refresh()])
  } catch (err) {
    toastError(err)
  } finally {
    taskBusy.value = 0
  }
}

onMounted(async () => {
  try {
    await userStore.ensureLogin()
    await Promise.all([load(), userStore.refresh()])
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.checkin-page {
  padding-bottom: 24px;
}

.who {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 16px 8px;
}

.who-meta {
  min-width: 0;

  strong {
    display: block;
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

.card {
  margin: 8px 12px 16px;
  padding: 14px 12px 16px;
  border-radius: 16px;
  background: $background-surface2;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  p {
    font-size: 15px;
    font-weight: 700;
  }

  b {
    color: $primary-color;
  }
}

.ghost {
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: $radius-pill;
  background: $primary-soft;
  color: $primary-color;
  font-size: 12px;
  font-weight: 700;
}

.days {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.day {
  min-height: 72px;
  padding: 8px 4px;
  border-radius: 10px;
  background: #141418;
  text-align: center;
  color: $text-color-secondary;

  em {
    display: block;
    font-size: 10px;
    font-style: normal;
    margin-bottom: 6px;
  }

  span {
    display: block;
    color: $primary-color;
    font-size: 11px;
    font-weight: 700;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 10px;
    color: #c9a06a;
  }

  &.on {
    background: $primary-soft;
    color: $on-accent;

    span,
    small {
      color: $on-accent;
    }
  }

  &.mile:not(.on) {
    background: #1a1810;
  }
}

.ok {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: $primary-color;
  color: #fff;
  font-size: 12px;
  font-style: normal;
  font-weight: 800;
}

.more {
  display: block;
  width: 100%;
  margin-top: 10px;
  border: 0;
  background: transparent;
  color: $text-color-muted;
  font-size: 12px;
}

.sign {
  display: block;
  width: 100%;
  height: 42px;
  margin-top: 12px;
  border: 0;
  border-radius: $radius-pill;
  background: $primary-color;
  color: $on-accent;
  font-size: 15px;
  font-weight: 800;

  &:disabled {
    opacity: 0.55;
  }
}

.tasks {
  padding: 0 12px;

  h3 {
    margin-bottom: 10px;
    font-size: 15px;
    font-weight: 800;
  }
}

.task {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: $background-surface2;

  strong {
    display: block;
    font-size: 14px;
  }

  p {
    margin-top: 4px;
    color: $text-color-secondary;
    font-size: 12px;
  }

  button {
    flex-shrink: 0;
    height: 30px;
    padding: 0 12px;
    border: 0;
    border-radius: $radius-pill;
    background: $primary-color;
    color: $on-accent;
    font-size: 12px;
    font-weight: 700;

    &:disabled {
      background: #2a2a32;
      color: $text-color-muted;
    }
  }
}
</style>
