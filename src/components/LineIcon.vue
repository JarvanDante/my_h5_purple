<template>
  <svg class="line-icon" viewBox="0 0 24 24" aria-hidden="true">
    <g v-if="name === 'search'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <circle cx="11" cy="11" r="6.2" />
      <path d="m16.2 16.2 4 4" />
    </g>
    <g v-else-if="name === 'gift'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="4.2" y="10" width="15.6" height="9.6" rx="1.4" />
      <path d="M4.2 10h15.6M12 10v9.6M12 10c0-2.8 3-4.2 4.6-2.4.8.9-1.2 2.4-4.6 2.4ZM12 10c0-2.8-3-4.2-4.6-2.4C6.6 8.5 8.6 10 12 10Z" />
    </g>
    <g v-else-if="name === 'vip'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M5 8.2 7.4 17h9.2L19 8.2l-3.4 2.2L12 7.2 8.4 10.4 5 8.2Z" />
    </g>
    <g v-else-if="name === 'fav'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M7 4.6h10a1.4 1.4 0 0 1 1.4 1.4v13.2L12 15.6 5.6 19.2V6A1.4 1.4 0 0 1 7 4.6Z" />
    </g>
    <g v-else-if="name === 'topic'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <path d="M9.2 4.4 7.4 19.6M16.6 4.4 14.8 19.6M5 9.4h14.4M4.4 14.6H18.8" />
    </g>
    <g v-else-if="name === 'hot'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M12 3.8s3.4 3.2 3.4 6.6a3.4 3.4 0 0 1-6.2 1.9C8.4 10.8 10 8.8 12 3.8Z" />
      <path d="M8.6 14.6A4.6 4.6 0 0 0 12 20.2a4.6 4.6 0 0 0 3.4-7.8" />
    </g>
    <g v-else-if="name === 'daily'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="4.4" y="5.6" width="15.2" height="14" rx="2" />
      <path d="M8 3.8v3.4M16 3.8v3.4M4.4 10.2h15.2" stroke-linecap="round" />
    </g>
    <g v-else-if="name === 'rank'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <path d="M7.2 16.6h9.6v3.2H7.2zM8.4 10.2h7.2v6.4H8.4zM10.2 5.4h3.6v4.8h-3.6z" />
    </g>
    <g v-else-if="name === 'play'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4" />
      <path d="m10.2 8.6 6 3.4-6 3.4V8.6Z" />
    </g>
    <g v-else-if="name === 'wallet'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
      <rect x="3.8" y="6.4" width="16.4" height="12.4" rx="2" />
      <path d="M16.4 12.6h3.8V16h-3.8a1.6 1.6 0 0 1 0-3.4Z" />
    </g>
    <g v-else fill="none" stroke="currentColor" stroke-width="1.7">
      <circle cx="12" cy="12" r="7" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<style scoped>
.line-icon {
  width: 1em;
  height: 1em;
  display: block;
}
</style>
