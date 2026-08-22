<template>
  <div class="page-shell sub-page">
    <PageHeader :title="hasPassword ? '修改密码' : '设置密码'" />
    <section class="soft-card box">
      <p class="hint">用户名是「我的」页上的编号，设好密码后可在其他设备用编号+密码登录。</p>
      <input v-if="hasPassword" v-model="oldPwd" type="password" maxlength="32" placeholder="旧密码" />
      <input v-model="pwd" type="password" maxlength="32" placeholder="新密码（6-32位）" />
      <input v-model="pwd2" type="password" maxlength="32" placeholder="再输入一次新密码" />
      <button type="button" :disabled="busy" @click="submit">{{ hasPassword ? '确认修改' : '确认设置' }}</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { setPassword } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const hasPassword = computed(() => Boolean(userStore.user?.has_password))
const oldPwd = ref('')
const pwd = ref('')
const pwd2 = ref('')
const busy = ref(false)

const submit = async () => {
  const password = pwd.value.trim()
  if (password.length < 6 || password.length > 32) {
    showToast('密码需 6-32 位')
    return
  }
  if (password !== pwd2.value.trim()) {
    showToast('两次密码不一致')
    return
  }
  if (hasPassword.value && !oldPwd.value.trim()) {
    showToast('请输入旧密码')
    return
  }
  busy.value = true
  try {
    await userStore.ensureLogin()
    await setPassword({
      password,
      old_password: hasPassword.value ? oldPwd.value.trim() : undefined,
    })
    showToast(hasPassword.value ? '密码已修改' : '密码已设置')
    await userStore.refresh()
    router.back()
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  if (!userStore.loggedIn) {
    userStore.ensureLogin().catch(() => undefined)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.box {
  .hint {
    margin-bottom: 12px;
    font-size: 12px;
    color: #888;
    line-height: 1.5;
  }

  input {
    width: 100%;
    height: 40px;
    border: 1.6px solid $ink;
    border-radius: $radius-pill;
    padding: 0 14px;
    margin-top: 10px;
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
</style>
