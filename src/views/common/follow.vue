<template>
  <div class="page-shell sub-page follow-page">
    <PageHeader title="我的关注" />

    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item"
        type="button"
        class="tab"
        :class="{ active: tab === item }"
        @click="select(item)"
      >
        {{ item }}
      </button>
    </div>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="pane">
          <p v-if="loading" class="empty">加载中…</p>
          <p v-else-if="!list.length" class="empty">{{ emptyText }}</p>
          <button
            v-for="u in list"
            :key="u.id"
            type="button"
            class="row"
            @click="goUser(u.id)"
          >
            <UserAvatar :src="mediaUrl(u.img)" :sex="u.sex" :size="44" :fallback="u.nickname || '用'" />
            <span class="who">
              <strong>{{ u.nickname || `用户${encodeId(u.id)}` }}</strong>
              <VipBadge :vip="u.is_vip" />
            </span>
            <span
              class="act"
              :class="{ on: isFollowed(u.id) }"
              @click.stop="onFollow(u)"
            >
              {{ isFollowed(u.id) ? '取消关注' : '+关注' }}
            </span>
          </button>
          <p v-if="list.length" class="end">没有更多了</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import UserAvatar from '@/components/UserAvatar.vue'
import VipBadge from '@/components/VipBadge.vue'
import PageHeader from '@/components/PageHeader.vue'
import { fetchFans, fetchFollows, toggleFollow, type PublicUser } from '@/api/user'
import { useTabSlide } from '@/composables/useTabSlide'
import { useUserStore } from '@/stores/user'
import { encodeId, userPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

const tabs = ['粉丝', '关注'] as const
const router = useRouter()
const userStore = useUserStore()
const slide = useTabSlide(tabs, '关注')
const tab = computed(() => slide.current.value)
const name = computed(() => slide.name.value)
const list = ref<PublicUser[]>([])
const followed = ref(new Set<number>())
const loading = ref(false)
const busyId = ref(0)
const emptyText = computed(() => (tab.value === '关注' ? '还没有关注的人' : '还没有粉丝'))

const select = (item: string) => slide.select(item)
const isFollowed = (id: number) => followed.value.has(id)
const goUser = (id: number) => router.push(userPath(id))

const loadFollowed = async () => {
  const data = await fetchFollows(1, 80)
  followed.value = new Set((data.list || []).map((u) => u.id))
}

const load = async () => {
  loading.value = true
  list.value = []
  try {
    await userStore.ensureLogin()
    const data = tab.value === '关注' ? await fetchFollows(1, 50) : await fetchFans(1, 50)
    list.value = data.list || []
    if (tab.value === '关注') {
      followed.value = new Set(list.value.map((u) => u.id))
    } else {
      await loadFollowed()
    }
  } catch (err) {
    toastError(err)
  } finally {
    loading.value = false
  }
}

const onFollow = async (u: PublicUser) => {
  if (busyId.value) return
  busyId.value = u.id
  try {
    await userStore.ensureLogin()
    const { followed: next } = await toggleFollow(u.id)
    const nextSet = new Set(followed.value)
    if (next) nextSet.add(u.id)
    else nextSet.delete(u.id)
    followed.value = nextSet
    if (tab.value === '关注' && !next) {
      list.value = list.value.filter((row) => row.id !== u.id)
    }
    showToast(next ? '已关注' : '已取消关注')
  } catch (err) {
    toastError(err)
  } finally {
    busyId.value = 0
  }
}

watch(tab, load)
onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.follow-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 4px 8px 0;
  border-bottom: 1px solid #22222b;
}

.tab {
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 8px 12px;
  position: relative;

  &.active {
    color: #f5f5f8;
    font-weight: 800;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 0;
      width: 22px;
      height: 3px;
      border-radius: 2px;
      background: #ff3d7f;
      transform: translateX(-50%);
    }
  }
}

.inner-slide {
  position: relative;
  overflow: hidden;
  min-height: 50vh;
}

.pane {
  padding: 4px 0 24px;
}

.row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 0;
  background: transparent;
  color: #f5f5f8;
  text-align: left;
}

.avatar,
:deep(.avatar) {
  flex-shrink: 0;
}

.who {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.row strong {
  min-width: 0;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.act {
  flex-shrink: 0;
  height: 28px;
  padding: 0 12px;
  border-radius: 14px;
  background: #ff3d7f;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;

  &.on {
    background: #24242e;
    color: #8c8c9c;
  }
}

.empty,
.end {
  padding: 48px 16px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.end {
  padding-top: 12px;
}
</style>
