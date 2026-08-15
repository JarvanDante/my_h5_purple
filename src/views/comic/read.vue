<template>
  <div class="page-shell sub-page">
    <PageHeader :title="title" />
    <p v-if="!pics.length" class="page-empty">{{ empty }}</p>
    <img v-for="(pic, i) in pics" :key="i" :src="pic.url" class="pic" alt="" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { readChapter } from '@/api/comics'
import { toastError } from '@/utils/request'

const route = useRoute()
const title = ref('阅读')
const empty = ref('加载中…')
const pics = ref<{ url: string }[]>([])

onMounted(async () => {
  try {
    const data = await readChapter(Number(route.params.chapterId))
    title.value = data.title
    pics.value = data.pics || []
    if (!pics.value.length) empty.value = '本章暂无图片'
  } catch (err) {
    empty.value = err instanceof Error ? err.message : '无法阅读'
    toastError(err)
  }
})
</script>

<style scoped lang="scss">
.pic {
  display: block;
  width: 100%;
}
</style>
