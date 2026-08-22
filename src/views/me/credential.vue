<template>
  <div class="page-shell sub-page cred-page">
    <PageHeader title="账号凭证" fallback="/me" />

    <section class="card">
      <p class="brand">{{ appName }} · 官方平台</p>
      <strong>账号凭证</strong>
      <p class="sub">截图保存本页，丢失账号时发给客服核验</p>

      <div class="rows">
        <div class="row">
          <span>用户昵称</span>
          <b>{{ nickname }}</b>
        </div>
        <div class="row">
          <span>用户编号</span>
          <b class="code" @click="copyCode">{{ code || '----' }}</b>
        </div>
        <div class="row">
          <span>邀请码</span>
          <b class="code" @click="copyCode">{{ code || '----' }}</b>
        </div>
        <div class="row">
          <span>登录密码</span>
          <em :class="{ ok: hasPassword }">{{ hasPassword ? '已设置' : '未设置' }}</em>
        </div>
      </div>
    </section>

    <section class="tips">
      <h3>温馨提示</h3>
      <p>1. 请截图保存以上信息，作为找回账号的凭证</p>
      <p>2. 凭证请自己保管，不要发给陌生人</p>
      <p>3. 账号丢失时，把截图发给客服即可协助找回</p>
      <p>4. 建议设置登录密码，平时可自行账密登录</p>
    </section>

    <div class="actions">
      <button type="button" class="ghost" @click="goPassword">
        {{ hasPassword ? '修改密码' : '去设置密码' }}
      </button>
      <button type="button" class="solid" @click="saveHint">保存账号凭证</button>
    </div>
    <button v-if="kefuUrl" type="button" class="kefu" @click="openKefu">联系客服找回</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { fetchCustomerUrl } from '@/api/user'
import { useConfigStore } from '@/stores/config'
import { useUserStore } from '@/stores/user'
import { encodeId } from '@/utils/idcrypt'
import { toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const configStore = useConfigStore()
const kefuUrl = ref('')

const appName = computed(() => configStore.appName || '漫隐')
const nickname = computed(() => userStore.user?.nickname?.trim() || '未设置昵称')
const code = computed(() => encodeId(userStore.user?.id))
const hasPassword = computed(() => Boolean(userStore.user?.has_password))

const copyCode = async () => {
  if (!code.value) return
  try {
    await navigator.clipboard.writeText(code.value)
    showToast('编号已复制')
  } catch {
    showToast(code.value)
  }
}

const saveHint = async () => {
  if (code.value) {
    try {
      await navigator.clipboard.writeText(
        `${appName.value}账号凭证\n昵称：${nickname.value}\n编号：${code.value}\n邀请码：${code.value}`,
      )
    } catch {
      // 复制失败也不挡提示
    }
  }
  showToast('请用系统截图保存本页')
}

const goPassword = () => router.push('/account/password')

const openKefu = () => {
  if (!kefuUrl.value) {
    showToast('暂未配置客服')
    return
  }
  window.open(kefuUrl.value, '_blank', 'noopener')
}

onMounted(async () => {
  try {
    await userStore.ensureLogin()
    if (!configStore.loaded) await configStore.load().catch(() => undefined)
    const res = await fetchCustomerUrl().catch(() => ({ url: '' }))
    const url = String(res.url || '').trim()
    kefuUrl.value = url && !/example\.com/i.test(url) ? url : ''
  } catch (err) {
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.cred-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: 28px;
}

.card {
  margin: 12px 16px 0;
  padding: 22px 18px 16px;
  border-radius: 16px;
  background:
    radial-gradient(circle at 88% 8%, rgba(255, 255, 255, 0.16), transparent 26%),
    linear-gradient(160deg, #2a0b1a 0%, #6a1542 56%, #ff3d7f 120%);
  color: #fff;
}

.brand {
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.78;
}

.card strong {
  display: block;
  margin-top: 10px;
  font-size: 28px;
  font-weight: 800;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.82;
}

.rows {
  margin-top: 18px;
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(13, 13, 18, 0.42);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &:last-child {
    border-bottom: 0;
  }

  span {
    flex-shrink: 0;
    font-size: 13px;
    opacity: 0.72;
  }

  b {
    min-width: 0;
    font-size: 14px;
    font-weight: 800;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .code {
    color: #ffb3cc;
  }

  em {
    font-style: normal;
    font-size: 13px;
    font-weight: 800;
    color: #ffb3cc;

    &.ok {
      color: #7dffc2;
    }
  }
}

.tips {
  margin: 18px 16px 0;
  padding: 16px 14px;
  border-radius: 12px;
  background: #191920;

  h3 {
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 800;
  }

  p {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: #8c8c9c;
  }
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 18px 16px 0;
}

.ghost,
.solid,
.kefu {
  height: 46px;
  border-radius: 23px;
  font-size: 14px;
  font-weight: 800;
}

.ghost {
  border: 1.5px solid #ff3d7f;
  background: transparent;
  color: #ff3d7f;
}

.solid {
  border: 0;
  background: #ff3d7f;
  color: #fff;
}

.kefu {
  display: block;
  width: calc(100% - 32px);
  margin: 10px 16px 0;
  border: 0;
  background: #191920;
  color: #f5f5f8;
}
</style>
