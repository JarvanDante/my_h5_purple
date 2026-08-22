<template>
  <div class="page-shell sub-page redeem-page">
    <PageHeader title="兑换中心" fallback="/me" />

    <section class="hero">
      <p>输入兑换码领取福利</p>
      <strong>兑换码</strong>
      <div class="field">
        <input v-model="code" type="text" maxlength="32" placeholder="请输入兑换码" />
      </div>
      <button type="button" class="submit" :disabled="busy || !code.trim()" @click="submit">
        {{ busy ? '兑换中…' : '立即兑换' }}
      </button>
    </section>

    <section class="logs">
      <h3>兑换记录</h3>
      <p v-if="!logs.length" class="empty">暂无兑换记录</p>
      <article v-for="item in logs" :key="item.code + (item.created_at || item.actived_at || '')" class="row">
        <div>
          <b>{{ item.name || item.desc || item.code }}</b>
          <span>{{ item.created_at || item.actived_at }}</span>
        </div>
        <em>{{ item.add_num ? `+${item.add_num}` : item.code }}</em>
      </article>
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

.redeem-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding: 0 16px 28px;
}

.hero {
  margin-top: 12px;
  padding: 20px 16px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2a0b1a 0%, #5a1238 58%, #ff3d7f 140%);
  color: #fff;

  p {
    font-size: 13px;
    opacity: 0.82;
  }

  strong {
    display: block;
    margin: 6px 0 16px;
    font-size: 26px;
    font-weight: 800;
  }
}

.field {
  background: rgba(13, 13, 18, 0.45);
  border-radius: 12px;
  padding: 2px;
}

input {
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: #191920;
  color: #f5f5f8;
  padding: 0 14px;
  font-size: 15px;
  letter-spacing: 1px;
  outline: none;

  &::placeholder {
    color: #8c8c9c;
    letter-spacing: 0;
  }
}

.submit {
  width: 100%;
  height: 44px;
  margin-top: 14px;
  border: 0;
  border-radius: 22px;
  background: #ff3d7f;
  color: #fff;
  font-size: 16px;
  font-weight: 800;

  &:disabled {
    opacity: 0.45;
  }
}

.logs {
  margin-top: 22px;

  h3 {
    font-size: 15px;
    font-weight: 800;
    margin-bottom: 12px;
  }
}

.empty {
  padding: 36px 0;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 12px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: #191920;

  b {
    display: block;
    font-size: 14px;
    font-weight: 700;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #8c8c9c;
  }

  em {
    flex-shrink: 0;
    font-style: normal;
    font-size: 15px;
    font-weight: 800;
    color: #2ee59d;
  }
}
</style>
