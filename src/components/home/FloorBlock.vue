<template>
  <section class="floor-block">
    <div class="floor-head">
      <div class="floor-titles">
        <h3>{{ title }}</h3>
        <span v-if="sub">{{ sub }}</span>
      </div>
      <button v-if="more" type="button" class="floor-more" @click="$emit('more')">更多 &gt;</button>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  sub?: string
  more?: boolean
}>()

defineEmits<{
  more: []
}>()
</script>

<style scoped lang="scss">
.floor-block {
  margin: 0 12px 14px;
  padding: 12px 0 14px;
  background: #1c1c22;
  border-radius: 14px;
}

.floor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 10px;
}

.floor-titles {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;

  h3 {
    margin: 0;
    color: #fff;
    font-size: 15px;
    font-weight: 700;
  }

  span {
    color: #ff5c93;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
}

.floor-more {
  border: 0;
  background: transparent;
  color: #8d8d96;
  font-size: 12px;
}
</style>
