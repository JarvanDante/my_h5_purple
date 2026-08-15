<template>
  <div class="page-shell sub-page">
    <PageHeader title="每日签到" />
    <section class="hero">
      <p>连续签到</p>
      <strong>{{ day }} 天</strong>
      <button type="button" :disabled="done" @click="sign">
        {{ done ? '今日已签到' : '立即签到' }}
      </button>
    </section>
    <section class="days">
      <div v-for="n in 7" :key="n" class="day" :class="{ on: n <= day }">
        <span>第{{ n }}天</span>
        <b>+{{ n * 10 }}</b>
      </div>
    </section>
    <p class="tip">签到领取金币，可用于解锁章节。此页为本地演示数据。</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'

const day = ref(3)
const done = ref(false)

const sign = () => {
  done.value = true
  day.value += 1
  showToast('签到成功，金币 +40')
}
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.hero {
  margin: 16px 12px;
  padding: 24px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  color: #fff;
  text-align: center;

  p {
    font-size: 13px;
    opacity: 0.8;
  }

  strong {
    display: block;
    margin: 8px 0 16px;
    font-size: 32px;
  }

  button {
    width: 160px;
    height: 40px;
    border: 0;
    border-radius: 20px;
    background: $secondary-color;
    color: $on-accent;
    font-weight: 700;

    &:disabled {
      opacity: 0.7;
    }
  }
}

.days {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 12px;
}

.day {
  background: #fff;
  border-radius: 8px;
  padding: 10px 6px;
  text-align: center;
  color: #999;
  font-size: 11px;

  b {
    display: block;
    margin-top: 4px;
    color: #333;
    font-size: 14px;
  }

  &.on {
    background: $background-surface2;
    color: $primary-color;

    b {
      color: $primary-color;
    }
  }
}

.tip {
  padding: 16px;
  color: #999;
  font-size: 12px;
}
</style>
