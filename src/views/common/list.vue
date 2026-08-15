<template>
  <div class="page-shell sub-page">
    <PageHeader :title="title" />
    <div class="body">
      <MediaGrid :items="comics" @select="open" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import MediaGrid from '@/components/MediaGrid.vue'
import { comics, listTitles, type CoverItem } from '@/data/mock'

const route = useRoute()
const router = useRouter()
const title = computed(() => listTitles[String(route.query.type || '')] || '列表')

const open = (item: CoverItem) => {
  router.push(`/comic/${item.id}`)
}
</script>

<style scoped lang="scss">
.body {
  padding: 12px;
  background: #fff;
}
</style>
