<template>
  <div class="page-shell sub-page settings-page">
    <PageHeader title="设置" fallback="/me" />

    <section class="group">
      <button type="button" @click="go('/settings/nickname')">
        <span>昵称设置</span>
        <em>{{ user?.nickname || '未设置' }}<i>›</i></em>
      </button>
      <button type="button" @click="go('/settings/sex')">
        <span>性别设置</span>
        <em>{{ sexLabel }}<i>›</i></em>
      </button>
      <button type="button" @click="go('/settings/avatar')">
        <span>头像设置</span>
        <em>更换<i>›</i></em>
      </button>
    </section>

    <section class="group">
      <button type="button" @click="copyAccount">
        <span>登录账号</span>
        <em class="code">{{ account }}</em>
      </button>
      <button type="button" class="accent" @click="go('/account/password')">
        <span>{{ user?.has_password ? '修改密码' : '设置密码' }}</span>
        <i>›</i>
      </button>
      <button type="button" class="accent" @click="openBind">
        <span>绑定邀请</span>
        <i>›</i>
      </button>
    </section>

    <p class="hint">未退出时本机用设备自动登录。退出后需用上方登录账号 + 密码重新进入，不要用设备号。</p>

    <button type="button" class="logout" @click="onLogout">退出登录</button>

    <div v-if="showBind" class="bind-mask" @click.self="showBind = false">
      <div class="bind-card">
        <h3>绑定邀请</h3>
        <p>请输入好友邀请码</p>
        <input v-model="bindCode" type="text" maxlength="64" placeholder="粘贴好友邀请码" />
        <div class="bind-actions">
          <button type="button" @click="showBind = false">取消</button>
          <button type="button" class="ok" :disabled="bindBusy" @click="submitBind">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { bindInviteCode } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { publicUid } from '@/utils/userid'
import { toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)
const account = computed(() => publicUid(user.value) || '----')
const sexLabel = computed(() => {
  if (user.value?.sex === 1) return '男'
  if (user.value?.sex === 2) return '女'
  return '未设置'
})
const showBind = ref(false)
const bindCode = ref('')
const bindBusy = ref(false)

const go = (path: string) => router.push(path)

const copyAccount = async () => {
  if (!account.value || account.value === '----') return
  try {
    await navigator.clipboard.writeText(account.value)
    showToast('登录账号已复制')
  } catch {
    showToast(account.value)
  }
}

const openBind = () => {
  bindCode.value = ''
  showBind.value = true
}

const submitBind = async () => {
  const code = bindCode.value.trim()
  if (!code) {
    showToast('请输入好友邀请码')
    return
  }
  bindBusy.value = true
  try {
    await bindInviteCode(code)
    showBind.value = false
    showToast('绑定成功')
  } catch (err) {
    toastError(err)
  } finally {
    bindBusy.value = false
  }
}

const onLogout = async () => {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '退出后本机不会自动登录。重新进入或换号请用登录账号+密码。',
      confirmButtonText: '退出',
      confirmButtonColor: '#ff3d7f',
    })
  } catch {
    return
  }
  await userStore.logout()
  router.replace('/account/login')
}

onMounted(async () => {
  try {
    if (!userStore.loggedIn) await userStore.ensureLogin()
    else await userStore.refresh()
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
.settings-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: 28px;
}

.group {
  margin: 12px 16px 0;
  border-radius: 12px;
  overflow: hidden;
  background: #191920;

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 50px;
    padding: 0 14px;
    border: 0;
    border-bottom: 1px solid #22222b;
    background: transparent;
    color: #f5f5f8;
    font-size: 15px;
    text-align: left;

    &:last-child {
      border-bottom: 0;
    }

    em {
      min-width: 0;
      font-style: normal;
      font-size: 13px;
      color: #8c8c9c;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    i {
      font-style: normal;
      margin-left: 4px;
      color: #5c5c68;
    }
  }

  .code {
    color: #ffb3cc;
    font-weight: 700;
  }

  .accent {
    color: #ff3d7f;
    font-weight: 700;
  }
}

.hint {
  margin: 14px 20px 0;
  font-size: 12px;
  line-height: 1.6;
  color: #8c8c9c;
}

.logout {
  display: block;
  width: calc(100% - 32px);
  height: 46px;
  margin: 24px 16px 0;
  border: 1.5px solid #ff3d7f;
  border-radius: 23px;
  background: transparent;
  color: #ff3d7f;
  font-size: 15px;
  font-weight: 800;
}

.bind-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.bind-card {
  width: 100%;
  max-width: 300px;
  background: #1c1c22;
  border-radius: 16px;
  padding: 18px 16px 12px;
  color: #f5f5f8;

  h3 {
    text-align: center;
    font-size: 16px;
  }

  p {
    margin: 8px 0 12px;
    text-align: center;
    font-size: 13px;
    color: #8c8c9c;
  }

  input {
    width: 100%;
    height: 40px;
    border: 1px solid #2a2a32;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 15px;
    background: #121214;
    color: #fff;
  }
}

.bind-actions {
  display: flex;
  margin-top: 12px;
  border-top: 1px solid #2a2a32;

  button {
    flex: 1;
    height: 42px;
    border: 0;
    background: transparent;
    font-size: 15px;
    color: #8c8c9c;
  }

  .ok {
    color: #ff3d7f;
    font-weight: 800;
    border-left: 1px solid #2a2a32;
  }
}
</style>
