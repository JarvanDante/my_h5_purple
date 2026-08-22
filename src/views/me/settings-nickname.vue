<template>
  <div class="page-shell sub-page edit-page">
    <PageHeader title="昵称设置" fallback="/settings" />
    <section class="box">
      <input v-model="name" type="text" maxlength="16" placeholder="请输入昵称" />
      <button type="button" :disabled="busy || !name.trim()" @click="save">保存</button>
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

const router = useRouter()
const userStore = useUserStore()
const name = ref('')
const busy = ref(false)

const save = async () => {
  const nickname = name.value.trim()
  if (!nickname) {
    showToast('请输入昵称')
    return
  }
  busy.value = true
  try {
    await updateProfile({ nickname })
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
  name.value = userStore.user?.nickname || ''
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

input {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 12px;
  padding: 0 14px;
  background: #191920;
  color: #f5f5f8;
  font-size: 15px;
}

button {
  width: 100%;
  height: 46px;
  margin-top: 14px;
  border: 0;
  border-radius: 23px;
  background: #ff3d7f;
  color: #fff;
  font-size: 15px;
  font-weight: 800;

  &:disabled {
    opacity: 0.45;
  }
}
</style>
