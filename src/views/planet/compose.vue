<template>
  <div class="page-shell compose-page">
    <PageHeader title="发布帖子" fallback="/planet" />

    <section class="form">
      <button type="button" class="row" @click="goTopics">
        <span class="label">选择板块</span>
        <span class="value" :class="{ ph: !draft.topics.length }">
          {{ draft.topics.length ? draft.topics.join('、') : '请选择板块' }}
        </span>
        <span class="pick">选择 ›</span>
      </button>

      <label class="row">
        <span class="label">填写标题</span>
        <input v-model="draft.title" type="text" maxlength="64" placeholder="填写标题" />
      </label>

      <textarea v-model="draft.content" rows="6" maxlength="1000" placeholder="请输入内容" />

      <div class="block">
        <p class="block-title">
          上传图片
          <em>*最多上传9张, 最大每张1M</em>
        </p>
        <div class="media-grid">
          <div v-for="(pic, i) in draft.pics" :key="pic" class="thumb">
            <EncryptedImage :src="pic" alt="" />
            <button type="button" class="del" @click="draft.pics.splice(i, 1)">×</button>
          </div>
          <label v-if="draft.pics.length < 9" class="add">
            + 添加图片
            <input type="file" accept="image/*" hidden @change="onPickImage" />
          </label>
        </div>
      </div>

      <div class="block">
        <p class="block-title">
          上传视频
          <em>*最大600M以内</em>
        </p>
        <div class="media-grid">
          <div v-if="draft.videoUrl" class="thumb video">
            <video :src="draft.videoUrl" muted />
            <button type="button" class="del" @click="draft.videoUrl = ''">×</button>
          </div>
          <label v-else class="add">
            + 添加视频
            <input type="file" accept="video/mp4,video/quicktime,video/webm" hidden @change="onPickVideo" />
          </label>
        </div>
      </div>
    </section>

    <button type="button" class="submit" :disabled="busy" @click="submit">提交</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import { createPost } from '@/api/ops'
import { usePostDraftStore } from '@/stores/postDraft'
import { toastError, uploadMedia } from '@/utils/request'

const router = useRouter()
const draft = usePostDraftStore()
const busy = ref(false)

const goTopics = () => router.push('/planet/topics')

const onPickImage = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 1024 * 1024) {
    showToast('单张图片不能超过 1M')
    return
  }
  try {
    const data = await uploadMedia(file, 'image')
    draft.pics.push(data.url)
  } catch (err) {
    toastError(err)
  }
}

const onPickVideo = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 600 * 1024 * 1024) {
    showToast('视频不能超过 600M')
    return
  }
  try {
    showToast('视频上传中…')
    const data = await uploadMedia(file, 'video')
    draft.videoUrl = data.url
  } catch (err) {
    toastError(err)
  }
}

const submit = async () => {
  const title = draft.title.trim()
  const content = draft.content.trim()
  if (!draft.topics.length) {
    showToast('请选择板块')
    return
  }
  if (!title) {
    showToast('请填写标题')
    return
  }
  if (!content) {
    showToast('请输入内容')
    return
  }
  if (!draft.pics.length) {
    showToast('请上传图片')
    return
  }
  busy.value = true
  try {
    await createPost({
      title,
      content,
      pics: draft.pics,
      topics: draft.topics,
      video_url: draft.videoUrl,
    })
    draft.reset()
    showToast('已提交，审核通过后显示')
    router.replace('/planet')
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
  background: #fff;
  min-height: 100%;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
}

.form {
  padding: 8px 16px 24px;
}

.row {
  width: 100%;
  min-height: 48px;
  border: 0;
  border-bottom: 1px solid #f2f2f2;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  text-align: left;
}

.label {
  width: 72px;
  flex-shrink: 0;
  font-size: 15px;
  color: #222;
}

.value,
.row input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #222;
}

.value.ph,
.row input::placeholder {
  color: #c8c8c8;
}

.pick {
  flex-shrink: 0;
  font-size: 13px;
  color: #888;
}

textarea {
  width: 100%;
  margin-top: 12px;
  border: 0;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  color: #222;
  min-height: 140px;
}

.block {
  margin-top: 18px;
}

.block-title {
  font-size: 15px;
  color: #222;
  font-weight: 600;

  em {
    margin-left: 8px;
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    color: #b0b0b0;
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
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #f3f3f3;
}

.thumb :deep(img),
.thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 14px;
  line-height: 1;
}

.add {
  border: 0;
  color: #9a9a9a;
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
  border-radius: 8px;
  background: #ffd400;
  color: #222;
  font-size: 16px;
  font-weight: 700;
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
