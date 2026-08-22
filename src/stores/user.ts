import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { bindInviteCode, fetchUserInfo, login, loginByAccount, logout as logoutApi, type UserInfo } from '@/api/user'
import { peekInviteCode, takeInviteCode } from '@/utils/invite'
import { setToken } from '@/utils/request'

const DEVICE_KEY = 'h5_device_id'
const SESSION_OFF_KEY = 'h5_session_off'

function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = `h5-${crypto.randomUUID()}`
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

function readSessionOff() {
  return localStorage.getItem(SESSION_OFF_KEY) === '1'
}

export const useUserStore = defineStore('user', () => {
  const user = ref<UserInfo | null>(null)
  const ready = ref(false)
  const sessionOff = ref(readSessionOff())
  const loggedIn = computed(() => Boolean(user.value?.id))

  const setSessionOff = (off: boolean) => {
    sessionOff.value = off
    if (off) localStorage.setItem(SESSION_OFF_KEY, '1')
    else localStorage.removeItem(SESSION_OFF_KEY)
  }

  const applyInvite = async () => {
    const code = peekInviteCode()
    if (!code || !user.value?.id) return
    try {
      await bindInviteCode(code)
    } catch {
      // 已绑定或码无效时丢掉，避免每次登录重试
    }
    takeInviteCode()
  }

  const ensureLogin = async () => {
    if (sessionOff.value) {
      ready.value = true
      return user.value
    }
    const data = await login({
      device_id: deviceId(),
      device_type: 'h5',
      device_version: '0.1.0',
    })
    setToken(data.token)
    user.value = data.user
    ready.value = true
    await applyInvite()
    return data.user
  }

  const loginAccount = async (username: string, password: string) => {
    const data = await loginByAccount({
      username,
      password,
      device_id: deviceId(),
      device_type: 'h5',
      device_version: '0.1.0',
    })
    setSessionOff(false)
    setToken(data.token)
    user.value = data.user
    ready.value = true
    await applyInvite()
    return data.user
  }

  const resumeDevice = async () => {
    setSessionOff(false)
    return ensureLogin()
  }

  const refresh = async () => {
    user.value = await fetchUserInfo()
    ready.value = true
    return user.value
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // 本地清会话即可
    }
    setToken('')
    user.value = null
    ready.value = true
    setSessionOff(true)
  }

  return {
    user,
    ready,
    loggedIn,
    sessionOff,
    ensureLogin,
    loginAccount,
    resumeDevice,
    refresh,
    logout,
    deviceId,
  }
})
