<template>
  <div class="page-shell">
    <header class="head">
      <div class="user" @click="go('/vip')">
        <div class="avatar" :style="avatarStyle" />
        <div>
          <h1>{{ user?.nickname || '未登录' }}</h1>
          <p>{{ subText }}</p>
        </div>
      </div>
      <div class="stats">
        <button type="button" @click="go('/vip')">
          <b>{{ user?.balance ?? 0 }}</b>
          <span>金币</span>
        </button>
        <button type="button" @click="go('/favorite')">
          <b>{{ user?.credit ?? 0 }}</b>
          <span>积分</span>
        </button>
        <button type="button" @click="go('/vip')">
          <b>{{ user?.id || '-' }}</b>
          <span>UID</span>
        </button>
      </div>
    </header>
    <section class="menus">
      <button v-for="item in menus" :key="item.title" type="button" @click="go(item.path)">
        <span>{{ item.title }}</span>
        <i>›</i>
      </button>
    </section>
    <p class="hint">设备号 {{ deviceId }} · 子后台用户列表可搜该账号</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'Me' })

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const deviceId = computed(() => userStore.deviceId())

const subText = computed(() => {
  if (!user.value) return '正在登录…'
  return user.value.group_name || '普通用户 · 点击开通 VIP'
})

const avatarStyle = computed(() => {
  const img = user.value?.img
  if (img) return { backgroundImage: `url(${img})`, backgroundSize: 'cover' }
  return {}
})

const menus = [
  { title: 'VIP 会员', path: '/vip' },
  { title: '金币钱包', path: '/vip' },
  { title: '我的收藏', path: '/favorite' },
  { title: '每日签到', path: '/checkin' },
]

const go = (path: string) => {
  router.push(path)
}

onMounted(() => {
  if (!userStore.loggedIn) {
    userStore.ensureLogin().catch(() => undefined)
  } else {
    userStore.refresh().catch(() => undefined)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.head {
  background: $primary-color;
  color: #fff;
  padding: 18px 12px 16px;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(160deg, #fdb927, #8a6bb3);
}

h1 {
  font-size: 18px;
}

.user p {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.75;
}

.stats {
  display: flex;
  margin-top: 16px;

  button {
    flex: 1;
    border: 0;
    background: transparent;
    color: #fff;

    b {
      display: block;
      font-size: 18px;
    }

    span {
      font-size: 12px;
      opacity: 0.75;
    }
  }
}

.menus {
  margin-top: 8px;
  background: #fff;

  button {
    width: 100%;
    height: 50px;
    border: 0;
    border-bottom: 1px solid #f5f5f5;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-size: 15px;
    color: #333;

    i {
      color: #ccc;
      font-style: normal;
    }
  }
}

.hint {
  padding: 12px 16px;
  color: #999;
  font-size: 11px;
  word-break: break-all;
}
</style>
