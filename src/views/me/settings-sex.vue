<template>
  <div class="page-shell sub-page edit-page">
    <PageHeader title="性别设置" fallback="/settings" />
    <section class="box">
      <p class="label">性别</p>
      <div class="picks">
        <button
          v-for="item in opts"
          :key="item.id"
          type="button"
          class="pick"
          :class="[item.tone, { on: sex === item.id }]"
          @click="sex = item.id"
        >
          <span class="icon" v-html="item.icon" />
        </button>
      </div>
      <p class="tip">请选择真实性别，保存后会显示在头像右下角</p>
      <button type="button" class="save" :disabled="busy || !sex" @click="save">提交</button>
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
  {
    id: 1,
    tone: 'male',
    icon: '<svg viewBox="0 0 24 24"><circle cx="10.2" cy="13.8" r="5.1" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M13.8 10.2 20 4M15.2 4H20v4.8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    id: 2,
    tone: 'female',
    icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9.2" r="5.1" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M12 14.3v6.2M8.8 17.8h6.4" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>',
  },
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
  margin: 28px 16px 0;
  text-align: center;
}

.label {
  margin-bottom: 22px;
  color: #c8c8d2;
  font-size: 15px;
}

.picks {
  display: flex;
  justify-content: center;
  gap: 36px;
}

.pick {
  width: 86px;
  height: 86px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);

  &.male {
    background: #3d8cff;
  }

  &.female {
    background: #5c5c68;
  }

  &.female.on,
  &.female:focus-visible {
    background: #ff3d7f;
  }

  &.on {
    outline: 3px solid rgba(255, 255, 255, 0.22);
    outline-offset: 4px;
  }
}

.icon {
  display: grid;
  place-items: center;

  :deep(svg) {
    width: 42px;
    height: 42px;
  }
}

.tip {
  margin: 28px 12px 0;
  font-size: 12px;
  line-height: 1.6;
  color: #6c6c78;
}

.save {
  width: 100%;
  height: 46px;
  margin-top: 28px;
  border: 0;
  border-radius: 23px;
  background: #ff3d7f;
  color: #fff;
  font-size: 16px;
  font-weight: 800;

  &:disabled {
    opacity: 0.45;
  }
}
</style>
