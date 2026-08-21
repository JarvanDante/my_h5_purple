<template>
  <div class="page-shell topics-page">
    <PageHeader title="选择帖子板块" fallback="/planet/compose" />
    <p v-if="!list.length" class="empty">暂无话题</p>
    <div v-else class="pills">
      <button
        v-for="item in list"
        :key="item.id"
        type="button"
        class="pill"
        :class="{ on: picked.has(item.name) }"
        @click="toggle(item.name)"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { fetchPostTopics, type RepoTag } from '@/api/ops'
import { usePostDraftStore } from '@/stores/postDraft'
import { toastError } from '@/utils/request'

const router = useRouter()
const draft = usePostDraftStore()
const list = ref<RepoTag[]>([])
const picked = ref(new Set(draft.topics))

const toggle = (name: string) => {
  draft.topics = [name]
  picked.value = new Set([name])
  router.back()
}

onMounted(() => {
  fetchPostTopics()
    .then((data) => {
      list.value = data.list || []
    })
    .catch(toastError)
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.topics-page {
  background: #fff;
  min-height: 100%;
}

.empty {
  padding: 48px 16px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 8px;
  padding: 16px 14px 32px;
}

.pill {
  border: 0;
  background: #f3f3f3;
  color: #555;
  font-size: 13px;
  border-radius: $radius-pill;
  padding: 8px 14px;
  line-height: 1.2;

  &.on {
    background: #fff4d4;
    color: #c48a12;
    font-weight: 700;
  }
}
</style>
