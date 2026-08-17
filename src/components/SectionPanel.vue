<template>
  <section class="section-panel">
    <div class="section-toolbar">
      <h3 class="section-title">{{ title }}</h3>
      <button v-if="more" type="button" class="more-btn" @click="$emit('more')">更多 →</button>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  more?: boolean
}>()

defineEmits<{
  more: []
}>()
</script>
