<template>
  <div class="page-shell sub-page hist-page" :class="{ managing }">
    <PageHeader title="浏览记录">
      <button v-if="items.length || managing" type="button" class="manage-btn" @click="toggleManage">
        {{ managing ? '取消' : '管理' }}
      </button>
    </PageHeader>

    <div class="tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="tab"
        :class="{ active: tab === item.key }"
        @click="select(item.key)"
      >
        {{ item.title }}
      </button>
    </div>

    <div class="inner-slide">
      <transition :name="name">
        <div :key="tab" class="pane">
          <p v-if="!items.length" class="empty">当前页面暂无内容～</p>
          <div v-else class="grid">
            <article
              v-for="item in items"
              :key="`${item.kind}-${item.id}`"
              class="card"
              @click="onCard(item)"
            >
              <div class="thumb">
                <EncryptedImage v-if="item.cover" :src="item.cover" alt="" />
                <span v-if="item.tag" class="badge">{{ item.tag }}</span>
                <i v-if="managing" class="check" :class="{ on: selected.has(item.id) }" />
              </div>
              <p class="title">{{ item.title }}</p>
              <p v-if="item.sub" class="sub">{{ item.sub }}</p>
            </article>
          </div>
          <p v-if="items.length" class="end">没有更多了</p>
        </div>
      </transition>
    </div>

    <div v-if="managing" class="action-bar">
      <button type="button" class="all" @click="toggleAll">
        <i :class="{ on: allSelected }" />
        全选
      </button>
      <button type="button" class="del" :disabled="!selected.size" @click="removeSelected">
        删除{{ selected.size ? `(${selected.size})` : '' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useTabSlide } from '@/composables/useTabSlide'
import { videoPath } from '@/utils/idcrypt'
import { listBrowse, removeBrowse, type BrowseItem, type BrowseKind } from '@/utils/browseHistory'

const tabs = [
  { key: 'comic', title: '漫画' },
  { key: 'video', title: '视频' },
  { key: 'novel', title: '小说' },
] as const
const router = useRouter()
const slide = useTabSlide(tabs.map((t) => t.key))
const tab = computed(() => slide.current.value as BrowseKind)
const name = computed(() => slide.name.value)
const items = ref<BrowseItem[]>([])
const managing = ref(false)
const selected = ref(new Set<number>())
const allSelected = computed(() => items.value.length > 0 && selected.value.size === items.value.length)

const select = (item: string) => slide.select(item)

const reload = () => {
  items.value = listBrowse(tab.value)
  selected.value = new Set()
}

const toggleManage = () => {
  managing.value = !managing.value
  selected.value = new Set()
}

const togglePick = (id: number) => {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selected.value = next
}

const toggleAll = () => {
  selected.value = allSelected.value ? new Set() : new Set(items.value.map((i) => i.id))
}

const onCard = (item: BrowseItem) => {
  if (managing.value) {
    togglePick(item.id)
    return
  }
  if (item.kind === 'video') {
    router.push(videoPath(item.id))
    return
  }
  if (item.kind === 'comic') {
    router.push(`/comic/${item.id}`)
  }
}

const removeSelected = async () => {
  if (!selected.value.size) return
  try {
    await showConfirmDialog({
      title: '删除记录',
      message: `确定删除已选的 ${selected.value.size} 项？`,
      confirmButtonText: '删除',
      confirmButtonColor: '#ff3d7f',
    })
  } catch {
    return
  }
  removeBrowse(tab.value, [...selected.value])
  reload()
  showToast('已删除')
  if (!items.value.length) managing.value = false
}

watch(tab, () => {
  managing.value = false
  reload()
})
onMounted(reload)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.hist-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;

  &.managing {
    padding-bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  }
}

.manage-btn {
  border: 0;
  background: transparent;
  color: #ff6699;
  font-size: 14px;
  padding: 0 4px;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 0;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #22222b;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #8c8c9c;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 10px 12px;
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
  padding: 12px 12px 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 8px;
}

.thumb {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 10px;
  overflow: hidden;
  background: #191920;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.badge {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 1;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #2ee59d;
  border-radius: 4px;
  padding: 1px 5px;
}

.check {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #fff;
  background: rgba(13, 13, 18, 0.35);

  &.on {
    border-color: #ff3d7f;
    background: #ff3d7f;

    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 5px;
      height: 8px;
      border: solid #fff;
      border-width: 0 1.6px 1.6px 0;
      transform: rotate(45deg);
    }
  }
}

.title {
  margin-top: 6px;
  font-size: 12px;
  color: #f5f5f8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub {
  margin-top: 3px;
  font-size: 11px;
  color: #ff6699;
}

.empty,
.end {
  padding: 48px 16px 16px;
  text-align: center;
  font-size: 13px;
  color: #8c8c9c;
}

.end {
  padding-top: 20px;
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
  background: #0d0d12;
  box-shadow: 0 -1px 0 #22222b;
}

.all {
  border: 0;
  background: transparent;
  color: #f5f5f8;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid #8c8c9c;
    position: relative;

    &.on {
      border-color: #ff3d7f;
      background: #ff3d7f;

      &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 2px;
        width: 5px;
        height: 8px;
        border: solid #fff;
        border-width: 0 1.6px 1.6px 0;
        transform: rotate(45deg);
      }
    }
  }
}

.del {
  min-width: 132px;
  height: 40px;
  border: 0;
  border-radius: 20px;
  background: #ff3d7f;
  color: #fff;
  font-size: 15px;
  font-weight: 700;

  &:disabled {
    opacity: 0.45;
  }
}

@media (min-width: $desktop-preview-min) {
  .action-bar {
    left: 50%;
    right: auto;
    width: $phone-max-width;
    transform: translateX(-50%);
  }
}
</style>
