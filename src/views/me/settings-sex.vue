<template>
  <div class="page-shell sub-page edit-page">
    <PageHeader title="性别设置" fallback="/settings" />
    <section class="box">
      <button
        v-for="item in opts"
        :key="item.id"
        type="button"
        :class="{ on: sex === item.id }"
        @click="sex = item.id"
      >
        {{ item.title }}
      </button>
      <button type="button" class="save" :disabled="busy || !sex" @click="save">保存</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { updateProfile } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const opts = [
  { id: 1, title: '男' },
  { id: 2, title: '女' },
]
const router = useRouter()
const userStore = useUserStore()
const sex = ref(0)
const busy = ref(false)

const save = async () => {
  if (sex.value !== 1 && sex.value !== 2) {
    showToast('请选择性别')
    return
  }
  busy.value = true
  try {
    await updateProfile({ sex: sex.value })
    await userStore.refresh()
    showToast('已保存')
    router.back()
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  if (!userStore.loggedIn) await userStore.ensureLogin()
  sex.value = userStore.user?.sex || 0
})
</script>

<style scoped lang="scss">
.edit-page {
  background: #0d0d12;
  min-height: 100%;
}

.box {
  margin: 16px;
}

button {
  width: 100%;
  height: 46px;
  margin-bottom: 10px;
  border: 1px solid #22222b;
  border-radius: 12px;
  background: #191920;
  color: #f5f5f8;
  font-size: 15px;

  &.on {
    border-color: #ff3d7f;
    color: #ff3d7f;
    font-weight: 800;
  }
}

.save {
  margin-top: 8px;
  border: 0;
  border-radius: 23px;
  background: #ff3d7f;
  color: #fff;
  font-weight: 800;

  &:disabled {
    opacity: 0.45;
  }
}
</style>
