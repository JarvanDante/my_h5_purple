import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useNavStore } from '@/stores/nav'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/comic' },
  {
    path: '/comic',
    name: 'Comic',
    component: () => import('@/views/comic/index.vue'),
    meta: { title: '二次元', tabbar: true },
  },
  {
    path: '/video',
    name: 'Video',
    component: () => import('@/views/video/index.vue'),
    meta: { title: '视频', tabbar: true },
  },
  {
    path: '/planet',
    name: 'Planet',
    component: () => import('@/views/planet/index.vue'),
    meta: { title: '星球', tabbar: true },
  },
  {
    path: '/ai',
    name: 'Ai',
    component: () => import('@/views/ai/index.vue'),
    meta: { title: 'AI', tabbar: true },
  },
  {
    path: '/me',
    name: 'Me',
    component: () => import('@/views/me/index.vue'),
    meta: { title: '我的', tabbar: true },
  },
  {
    path: '/comic/:id',
    name: 'ComicDetail',
    component: () => import('@/views/comic/detail.vue'),
    meta: { title: '作品详情' },
  },
  {
    path: '/video/:id',
    name: 'VideoDetail',
    component: () => import('@/views/video/detail.vue'),
    meta: { title: '视频详情' },
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/common/search.vue'),
    meta: { title: '搜索' },
  },
  {
    path: '/checkin',
    name: 'Checkin',
    component: () => import('@/views/common/checkin.vue'),
    meta: { title: '签到' },
  },
  {
    path: '/vip',
    name: 'Vip',
    component: () => import('@/views/common/vip.vue'),
    meta: { title: 'VIP' },
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import('@/views/common/wallet.vue'),
    meta: { title: '钱包' },
  },
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('@/views/common/favorite.vue'),
    meta: { title: '收藏' },
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/common/list.vue'),
    meta: { title: '列表' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string | undefined) || 'Purple'
  if (from.path) {
    useNavStore().setByRoute(to.path, from.path)
  }
  next()
})

export default router
