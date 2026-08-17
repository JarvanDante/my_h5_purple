<template>
  <div class="page-shell sub-page">
    <PageHeader title="VIP 会员" />
    <p class="status">当前：{{ userStore.user?.group_name || '普通用户' }}</p>
    <section v-if="list.length" class="soft-card plans">
      <button
        v-for="plan in list"
        :key="plan.id"
        type="button"
        class="plan"
        :class="{ active: current === plan.id }"
        @click="current = plan.id"
      >
        <h3>{{ plan.name }}</h3>
        <p><em>{{ plan.price }}</em> 金币 / {{ plan.days }} 天</p>
      </button>
    </section>
    <p v-else class="empty">暂无套餐，请在子后台「会员等级」配置</p>
    <button type="button" class="cta-btn" :disabled="!current || loading" @click="pay">
      {{ loading ? '开通中…' : '立即开通' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { buyVip, fetchVipPackages, type VipPackage } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const userStore = useUserStore()
const list = ref<VipPackage[]>([])
const current = ref(0)
const loading = ref(false)

const load = async () => {
  const data = await fetchVipPackages()
  list.value = data.list || []
  if (list.value.length && !current.value) {
    current.value = list.value[0].id
  }
}

const pay = async () => {
  if (!current.value) return
  loading.value = true
  try {
    await buyVip(current.value)
    await userStore.refresh()
    showToast('开通成功')
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load().catch(toastError)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.status,
.empty {
  padding: 12px 16px 0;
  color: #666;
  font-size: 13px;
}

.plans {
  display: grid;
  gap: 10px;
}

.plan {
  text-align: left;
  border: 1.6px solid $ink;
  background: #fff;
  border-radius: 12px;
  padding: 14px;

  &.active {
    border-color: $ink;
    background: $primary-color;
  }

  h3 {
    font-size: 16px;
  }

  p {
    margin: 6px 0 0;
    color: #666;
  }

  em {
    font-style: normal;
    color: $primary-color;
    font-size: 22px;
    font-weight: 700;
  }
}

.cta-btn:disabled {
  opacity: 0.5;
}
</style>
