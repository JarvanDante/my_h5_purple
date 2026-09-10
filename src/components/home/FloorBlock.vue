<template>
  <section class="floor-block">
    <div class="floor-head">
      <div class="floor-lead">
        <div class="floor-titles">
          <h3>
            <img class="title-bg" :src="floorTitleArt" alt="" />
            <img class="title-spark spark-l" :src="floorSparkLarge" alt="" />
            <img class="title-spark spark-s" :src="floorSparkSmall" alt="" />
            <span class="title-text">{{ title }}</span>
          </h3>
          <span v-if="sub" class="floor-sub">{{ sub }}</span>
        </div>
        <div v-if="categories.length || tags.length" class="floor-chips">
          <em v-for="name in categories" :key="`c-${name}`" class="chip chip-cat">{{ name }}</em>
          <em v-for="name in tags" :key="`t-${name}`" class="chip chip-tag">{{ name }}</em>
        </div>
      </div>
      <button v-if="more" type="button" class="floor-more" @click="$emit('more')">
        <span>更多</span>
        <img class="more-arrow" :src="floorMoreArrowArt" alt="" />
      </button>
    </div>
    <slot />
  </section>
</template>

<script setup lang="ts">
import {
  floorMoreArrowArt,
  floorSparkLarge,
  floorSparkSmall,
  floorTitleArt,
} from '@/assets/theme'

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
@use '@/styles/variables.scss' as *;

.floor-block {
  margin: 0 0 16px;
  padding: 4px 0 8px;
  background: transparent;
}

.floor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 10px;
}

.floor-lead {
  min-width: 0;
  flex: 1;
}

.floor-titles {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  h3 {
    position: relative;
    margin: 0;
    min-width: 88px;
    min-height: 36px;
    padding: 7px 18px 10px 14px;
    display: inline-flex;
    align-items: center;
  }
}

.title-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.title-spark {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.spark-l {
  left: -4px;
  top: -2px;
  width: 13px;
  height: 13px;
  transform: rotate(-43deg);
}

.spark-s {
  left: 12px;
  top: 0;
  width: 8px;
  height: 8px;
  transform: rotate(11deg);
}

.title-text {
  position: relative;
  z-index: 1;
  color: #111;
  font-size: 16px;
  font-weight: 510;
  line-height: 22px;
  white-space: nowrap;
}

.floor-sub {
  color: $accent-yellow;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
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
  color: #ffd0e6;
  background: $primary-soft;
}

.chip-tag {
  color: #d7d0ff;
  background: rgba(140, 120, 255, 0.18);
}

.floor-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 47px;
  border: 1px solid $ink-deep;
  background: $accent-yellow;
  color: $ink-deep;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  border-radius: 6px;
  padding: 4px 8px;
  box-shadow: 1px 1px 0 $ink-deep;
}

.more-arrow {
  width: 8px;
  height: 8px;
  display: block;
}
</style>
