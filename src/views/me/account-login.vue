<template>
  <div class="page-shell sub-page">
    <PageHeader title="账号登录" />
    <section class="soft-card box">
      <p class="hint">用户名是「我的」页上的编号，例如 000C。登录后本机将切换到该账号。</p>
      <input v-model="username" type="text" maxlength="32" placeholder="用户名 / 编号" />
      <input v-model="password" type="password" maxlength="32" placeholder="密码" @keyup.enter="submit" />
      <button type="button" :disabled="busy" @click="submit">登录</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { useUserStore } from '@/stores/user'
import { toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const busy = ref(false)

const submit = async () => {
  const name = username.value.trim()
  const pwd = password.value.trim()
  if (!name) {
    showToast('请输入用户名')
    return
  }
  if (!pwd) {
    showToast('请输入密码')
    return
  }
  busy.value = true
  try {
    await userStore.loginAccount(name, pwd)
    showToast('登录成功')
    router.replace('/me')
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}
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
