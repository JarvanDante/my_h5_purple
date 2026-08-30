<template>
  <section class="floor-block">
    <div class="floor-head">
      <div class="floor-lead">
        <div class="floor-titles">
          <h3>{{ title }}</h3>
          <span v-if="sub">{{ sub }}</span>
        </div>
        <div v-if="categories.length || tags.length" class="floor-chips">
          <em v-for="name in categories" :key="`c-${name}`" class="chip chip-cat">{{ name }}</em>
          <em v-for="name in tags" :key="`t-${name}`" class="chip chip-tag">{{ name }}</em>
        </div>
      </div>
      <button v-if="more" type="button" class="floor-more" @click="$emit('more')">更多 &gt;</button>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    sub?: string
    more?: boolean
    categories?: string[]
    tags?: string[]
  }>(),
  { categories: () => [], tags: () => [] },
)

defineEmits<{
  more: []
}>()
</script>

<style scoped lang="scss">
.floor-block {
  margin: 0 0 16px;
  padding: 4px 0 8px;
  background: transparent;
}

.floor-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0 12px 10px;
}

.floor-lead {
  min-width: 0;
  flex: 1;
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

.floor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-style: normal;
  line-height: 16px;
}

.chip-cat {
  color: #f3c6d4;
  background: rgba(255, 92, 147, 0.16);
}

.chip-tag {
  color: #d7d0ff;
  background: rgba(140, 120, 255, 0.18);
}

.floor-more {
  border: 0;
  background: transparent;
  color: #8d8d96;
  font-size: 12px;
}
</style>
