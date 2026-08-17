<template>
  <div class="page-shell sub-page">
    <PageHeader :title="post?.title || '帖子详情'" />
    <article v-if="post" class="soft-card post">
      <h2>{{ post.title }}</h2>
      <p>{{ post.content }}</p>
      <img v-for="(pic, i) in post.pics || []" :key="i" :src="mediaUrl(pic)" alt="" />
      <div class="bar">
        <span>♡ {{ post.like_count }}</span>
        <span>💬 {{ post.comment_count }}</span>
        <span>{{ post.created_at }}</span>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { fetchPostDetail, type PostItem } from '@/api/ops'
import { mediaUrl, toastError } from '@/utils/request'

const route = useRoute()
const post = ref<PostItem | null>(null)

onMounted(() => {
  fetchPostDetail(Number(route.params.id))
    .then((data) => {
      post.value = data.post
    })
    .catch(toastError)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.post {
  h2 {
    font-size: 18px;
  }

  p {
    margin: 10px 0;
    color: $text-color-secondary;
    line-height: 1.6;
  }

  img {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1.4px solid $ink;
  }
}

.bar {
  display: flex;
  gap: 12px;
  color: #999;
  font-size: 12px;
}
</style>
