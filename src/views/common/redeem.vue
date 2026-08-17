<template>
  <div class="page-shell sub-page">
    <PageHeader title="兑换码" />
    <section class="soft-card box">
      <input v-model="code" type="text" maxlength="32" placeholder="输入兑换码" />
      <button type="button" :disabled="busy" @click="submit">立即兑换</button>
    </section>
    <section class="soft-card logs">
      <h3>兑换记录</h3>
      <p v-if="!logs.length" class="empty">暂无记录，子后台「运营管理 → 兑换码」可发码</p>
      <div v-for="item in logs" :key="item.code + (item.created_at || item.actived_at || '')" class="row">
        <div>
          <b>{{ item.name || item.desc || item.code }}</b>
          <span>{{ item.created_at || item.actived_at }}</span>
        </div>
        <em>{{ item.add_num ? `+${item.add_num}` : item.code }}</em>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { fetchRedeemLogs, redeemCode, type RedeemLog } from '@/api/ops'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const code = ref('')
const busy = ref(false)
const logs = ref<RedeemLog[]>([])

const load = async () => {
  const res = await fetchRedeemLogs()
  logs.value = res.list || []
}

const submit = async () => {
  const v = code.value.trim()
  if (!v) {
    showToast('请输入兑换码')
    return
  }
  busy.value = true
  try {
    await userStore.ensureLogin()
    const res = await redeemCode(v)
    showToast(res.desc || `兑换成功 ${res.name || ''}`.trim())
    code.value = ''
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

.box {
  input {
    width: 100%;
    height: 40px;
    border: 1.6px solid $ink;
    border-radius: $radius-pill;
    padding: 0 14px;
  }

  button {
    width: 100%;
    height: 40px;
    margin-top: 12px;
    border: 1.6px solid $ink;
    border-radius: $radius-pill;
    background: $accent-yellow;
    color: $ink;
    font-weight: 800;
  }
}

.logs {
  h3 {
    font-size: 14px;
    margin-bottom: 10px;
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
    font-size: 14px;
  }

  span {
    font-size: 11px;
    color: #999;
  }

  em {
    font-style: normal;
    color: $primary-color;
    font-weight: 700;
  }
}
</style>
