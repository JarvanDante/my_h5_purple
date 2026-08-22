<template>
  <div class="page-shell sub-page edit-page">
    <PageHeader title="头像设置" fallback="/settings" />
    <section class="current">
      <EncryptedImage v-if="preview" :src="mediaUrl(preview)" alt="" />
      <span v-else>未设置</span>
    </section>
    <div class="actions">
      <button type="button" class="ghost" @click="pickFile">上传头像</button>
    </div>
    <p class="tip">或从默认头像中选择</p>
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
    <button type="button" class="save" :disabled="busy || !preview" @click="save">保存</button>
    <input ref="fileRef" type="file" accept="image/*" hidden @change="onFile" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchAvatars, updateProfile } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { mediaUrl, toastError, uploadMedia } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const list = ref<string[]>([])
const preview = ref('')
const busy = ref(false)
const fileRef = ref<HTMLInputElement | null>(null)

const pickFile = () => fileRef.value?.click()

const onFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  busy.value = true
  try {
    const data = await uploadMedia(file, 'avatar')
    preview.value = data.url
    showToast('已上传，点保存生效')
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
    if (fileRef.value) fileRef.value.value = ''
  }
}

const save = async () => {
  if (!preview.value) return
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
  height: 88px;
  margin: 16px auto 0;
  border-radius: 50%;
  overflow: hidden;
  background: #191920;
  display: grid;
  place-items: center;
  color: #8c8c9c;
  font-size: 12px;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.actions {
  margin: 14px 16px 0;
}

.ghost,
.save {
  width: calc(100% - 32px);
  height: 46px;
  margin-left: 16px;
  border-radius: 23px;
  font-size: 15px;
  font-weight: 800;
}

.ghost {
  width: 100%;
  margin-left: 0;
  border: 1.5px solid #ff3d7f;
  background: transparent;
  color: #ff3d7f;
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
  margin: 18px 16px 0;
  border: 0;
  background: #ff3d7f;
  color: #fff;

  &:disabled {
    opacity: 0.45;
  }
}
</style>
