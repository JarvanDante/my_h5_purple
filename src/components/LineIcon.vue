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
    <g v-else-if="name === 'topic'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10l2 2.5h6.5A1.5 1.5 0 0 1 20 8v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" />
    </g>
    <g v-else-if="name === 'hot'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3s4.5 3.8 4.5 8a4.5 4.5 0 0 1-9 0c0-1.4.5-2.6 1.2-3.6" />
      <path d="M12 21a5 5 0 0 0 5-5c0-1.5-.7-2.8-1.6-3.8" />
      <path d="M12 21a5 5 0 0 1-5-5" />
    </g>
    <g v-else-if="name === 'daily'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </g>
    <g v-else-if="name === 'rank'" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 20h14M9 20v-6M15 20V9M12 20V4" />
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
