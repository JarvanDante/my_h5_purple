<template>
  <div class="page-shell sub-page edit-page">
    <PageHeader title="头像设置" fallback="/settings" />
    <section class="current">
      <UserAvatar :src="preview ? mediaUrl(preview) : ''" :sex="userStore.user?.sex" :size="88" fallback="未" />
    </section>
    <p class="tip">请从默认头像中选择</p>
    <div class="grid">
      <button
        v-for="src in list"
        :key="src"
        type="button"
        :class="{ on: preview === src }"
        @click="preview = src"
      >
        <EncryptedImage :src="mediaUrl(src)" alt="" />
      </button>
    </div>
    <button type="button" class="save" :disabled="busy || !canSave" @click="save">保存</button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchAvatars, updateProfile } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { mediaUrl, toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const list = ref<string[]>([])
const preview = ref('')
const busy = ref(false)
const canSave = computed(() => Boolean(preview.value) && list.value.includes(preview.value))

const save = async () => {
  if (!canSave.value) {
    showToast('请选择系统头像')
    return
  }
  busy.value = true
  try {
    await updateProfile({ img: preview.value })
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
  preview.value = userStore.user?.img || ''
  try {
    const res = await fetchAvatars()
    list.value = res.list || []
  } catch {
    list.value = []
  }
})
</script>

<style scoped lang="scss">
.edit-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: 28px;
}

.current {
  width: 88px;
  margin: 16px auto 0;
}

.tip {
  margin: 18px 16px 8px;
  font-size: 13px;
  color: #8c8c9c;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 0 16px;
}

.grid button {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  background: #191920;
  padding: 0;

  &.on {
    border-color: #ff3d7f;
  }

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.save {
  display: block;
  width: calc(100% - 32px);
  height: 46px;
  margin: 18px 16px 0;
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
