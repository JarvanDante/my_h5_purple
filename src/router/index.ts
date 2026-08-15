import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/comic' },
  {
    path: '/comic',
    name: 'Comic',
    component: () => import('@/views/comic/index.vue'),
    meta: { title: '二次元', tabbar: true, keepAlive: true },
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
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  const title = (to.meta.title as string | undefined) || 'Purple'
  document.title = title
  next()
})

export default router
