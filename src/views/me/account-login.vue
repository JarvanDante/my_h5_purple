<template>
  <div class="page-shell sub-page edit-page">
    <PageHeader title="账号登录" fallback="/me" />
    <section class="box">
      <p class="hint">用「我的」页上的编号和密码登录，不要用设备号。退出后不会自动进号。</p>
      <input v-model="username" type="text" maxlength="64" placeholder="用户编号" />
      <input v-model="password" type="password" maxlength="32" placeholder="密码" @keyup.enter="submit" />
      <button type="button" :disabled="busy" @click="submit">登录</button>
      <button v-if="userStore.sessionOff" type="button" class="ghost" :disabled="busy" @click="resume">使用本机账号</button>
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
    showToast('请输入用户编号')
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

const resume = async () => {
  busy.value = true
  try {
    await userStore.resumeDevice()
    showToast('已进入本机账号')
    router.replace('/me')
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped lang="scss">
.edit-page {
  background: #0d0d12;
  min-height: 100%;
}

.box {
  margin: 16px;
}

.hint {
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: #8c8c9c;
}

input {
  width: 100%;
  height: 46px;
  border: 0;
  border-radius: 12px;
  padding: 0 14px;
  margin-top: 10px;
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

.ghost {
  margin-top: 10px;
  border: 1.5px solid #ff3d7f;
  background: transparent;
  color: #ff3d7f;
}
</style>
