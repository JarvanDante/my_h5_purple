import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchUserInfo, login, type UserInfo } from '@/api/user'
import { setToken } from '@/utils/request'

const DEVICE_KEY = 'h5_device_id'

function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = `h5-${crypto.randomUUID()}`
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null)
  const ready = ref(false)
  const loggedIn = computed(() => Boolean(user.value?.id))

  const ensureLogin = async () => {
    const data = await login({
      device_id: deviceId(),
      device_type: 'h5',
      device_version: '0.1.0',
    })
    setToken(data.token)
    user.value = data.user
    ready.value = true
    return data.user
  }

  const refresh = async () => {
    user.value = await fetchUserInfo()
    ready.value = true
    return user.value
  }

  return { user, ready, loggedIn, ensureLogin, refresh, deviceId }
})
