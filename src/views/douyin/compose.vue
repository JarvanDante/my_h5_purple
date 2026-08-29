<template>
  <div class="page-shell compose-page">
    <PageHeader title="发布抖音" :fallback="fromDiscover ? '/video' : '/creator'" />

    <section class="form">
      <label class="row">
        <span class="label">填写标题</span>
        <input v-model="title" type="text" maxlength="64" placeholder="填写标题" />
      </label>

      <textarea v-model="desc" rows="4" maxlength="200" placeholder="简介（选填）" />

      <div class="block">
        <p class="block-title">
          上传封面
          <em>*必填，最大1M</em>
        </p>
        <div class="media-grid">
          <div v-if="coverUrl" class="thumb">
            <EncryptedImage :src="coverUrl" alt="" />
            <button type="button" class="del" @click="coverUrl = ''; coverKey = ''">×</button>
          </div>
          <label v-else class="add">
            + 添加封面
            <input type="file" accept="image/*" hidden @change="onPickCover" />
          </label>
        </div>
      </div>

      <div class="block">
        <p class="block-title">
          上传视频
          <em>*必填，最大600M</em>
        </p>
        <div class="media-grid">
          <div v-if="sourceUrl" class="thumb video">
            <video :src="videoPreview || mediaUrl(sourceUrl)" muted />
            <button type="button" class="del" @click="clearVideo">×</button>
          </div>
          <div v-else-if="videoUploading" class="thumb video uploading">
            <span>上传中 {{ videoPercent }}%</span>
          </div>
          <label v-else class="add">
            + 添加视频
            <input type="file" accept="video/*" hidden @change="onPickVideo" />
          </label>
        </div>
      </div>
    </section>

    <button type="button" class="submit" :disabled="busy || videoUploading" @click="submit">提交</button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import { submitDouyin } from '@/api/douyin'
import { formatFileSize, IMAGE_MAX_BYTES, VIDEO_MAX_BYTES } from '@/utils/fileSize'
import { uploadPostMedia } from '@/utils/storage-upload'
import { mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const router = useRouter()
const fromDiscover = computed(() => route.query.from === 'discover')
const title = ref('')
const desc = ref('')
const coverUrl = ref('')
const coverKey = ref('')
const sourceUrl = ref('')
const sourceKey = ref('')
const duration = ref(0)
const busy = ref(false)
const videoUploading = ref(false)
const videoPercent = ref(0)
const videoPreview = ref('')

const clearVideo = () => {
  if (videoPreview.value.startsWith('blob:')) URL.revokeObjectURL(videoPreview.value)
  videoPreview.value = ''
  sourceUrl.value = ''
  sourceKey.value = ''
  duration.value = 0
}

function rejectOversize(kind: '图片' | '视频', bytes: number, limitLabel: string) {
  return showDialog({
    title: `${kind}过大`,
    message: `当前文件 ${formatFileSize(bytes)}，超过 ${limitLabel} 上限，请压缩后再上传`,
    confirmButtonText: '知道了',
  }).then(() => false).catch(() => false)
}

const readDuration = (file: File) =>
  new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement('video')
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      const sec = Math.round(el.duration || 0)
      URL.revokeObjectURL(url)
      resolve(Number.isFinite(sec) ? sec : 0)
    }
    el.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(0)
    }
    el.src = url
  })

const onPickCover = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > IMAGE_MAX_BYTES) {
    await rejectOversize('图片', file.size, '1M')
    return
  }
  try {
    const data = await uploadPostMedia(file, 'image')
    coverUrl.value = data.url
    coverKey.value = data.object_key
  } catch (err) {
    toastError(err)
  }
}

const onPickVideo = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > VIDEO_MAX_BYTES) {
    await rejectOversize('视频', file.size, '600M')
    return
  }
  videoUploading.value = true
  videoPercent.value = 0
  try {
    const [data, sec] = await Promise.all([
      uploadPostMedia(file, 'video', (percent) => {
        videoPercent.value = percent
      }),
      readDuration(file),
    ])
    if (videoPreview.value.startsWith('blob:')) URL.revokeObjectURL(videoPreview.value)
    videoPreview.value = URL.createObjectURL(file)
    sourceUrl.value = data.url
    sourceKey.value = data.object_key
    duration.value = sec
  } catch (err) {
    toastError(err)
  } finally {
    videoUploading.value = false
  }
}

const submit = async () => {
  const name = title.value.trim()
  if (!name) {
    showToast('请填写标题')
    return
  }
  if (!coverUrl.value) {
    showToast('请上传封面')
    return
  }
  if (!sourceUrl.value) {
    showToast('请上传视频')
    return
  }
  busy.value = true
  try {
    await submitDouyin({
      title: name,
      description: desc.value.trim(),
      cover_url: coverUrl.value,
      cover_key: coverKey.value,
      source_url: sourceUrl.value,
      source_key: sourceKey.value,
      duration: duration.value,
    })
    sessionStorage.setItem('h5_creator_kind', 'douyin')
    showToast('已提交，审核通过后显示')
    router.replace('/creator')
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.compose-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.form {
  padding: 12px 16px 24px;
}

.row {
  width: 100%;
  min-height: 50px;
  border: 0;
  background: #191920;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  text-align: left;
  border-radius: 13px;
}

.label {
  width: 72px;
  flex-shrink: 0;
  font-size: 15px;
  color: #f5f5f8;
}

.row input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #f5f5f8;
}

.row input::placeholder {
  color: #8c8c9c;
}

textarea {
  width: 100%;
  margin-top: 12px;
  border: 0;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  color: #f5f5f8;
  background: #191920;
  border-radius: 13px;
  padding: 14px;
  min-height: 100px;
}

textarea::placeholder {
  color: #8c8c9c;
}

.row input:focus,
textarea:focus {
  box-shadow: inset 0 0 0 1px #d91259;
}

.block {
  margin-top: 12px;
  background: #191920;
  border-radius: 13px;
  padding: 14px;
}

.block-title {
  font-size: 15px;
  color: #f5f5f8;
  font-weight: 600;

  em {
    margin-left: 8px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    color: #8c8c9c;
  }
}

.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.thumb,
.add {
  width: 92px;
  height: 92px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: #24242e;
}

.thumb :deep(img),
.thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb.uploading {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #331020;
  color: #ff8fb3;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}

.del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: rgba(13, 13, 18, 0.72);
  color: #f5f5f8;
  font-size: 14px;
  line-height: 1;
}

.add {
  border: 1px dashed #4e4e5a;
  color: #8c8c9c;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.submit {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  height: 44px;
  border: 0;
  border-radius: 14px;
  background: #ff3d7f;
  color: #1a0a12;
  font-size: 16px;
  font-weight: 700;

  &:disabled {
    opacity: 0.45;
  }
}

@media (min-width: $desktop-preview-min) {
  .submit {
    left: 50%;
    right: auto;
    width: calc(#{$phone-max-width} - 32px);
    transform: translateX(-50%);
  }
}
</style>
