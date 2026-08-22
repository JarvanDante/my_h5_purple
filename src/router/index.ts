import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useNavStore } from '@/stores/nav'
import { rememberInviteCode } from '@/utils/invite'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: (to) => ({ path: '/comic', query: to.query }) },
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
    path: '/comic/:id/read/:chapterId',
    name: 'ComicRead',
    component: () => import('@/views/comic/read.vue'),
    meta: { title: '阅读' },
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
    path: '/wallet/waters',
    name: 'WalletWaters',
    component: () => import('@/views/common/wallet-waters.vue'),
    meta: { title: '余额明细' },
  },
  {
    path: '/redeem',
    name: 'Redeem',
    component: () => import('@/views/common/redeem.vue'),
    meta: { title: '兑换中心' },
  },
  {
    path: '/coupon',
    name: 'Coupon',
    component: () => import('@/views/common/coupon.vue'),
    meta: { title: '优惠券' },
  },
  {
    path: '/lottery',
    name: 'Lottery',
    component: () => import('@/views/common/lottery.vue'),
    meta: { title: '抽奖' },
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('@/views/common/message.vue'),
    meta: { title: '站内消息' },
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('@/views/common/feedback.vue'),
    meta: { title: '意见反馈' },
  },
  {
    path: '/invite',
    name: 'Invite',
    component: () => import('@/views/common/invite.vue'),
    meta: { title: '分享邀请' },
  },
  {
    path: '/invite/logs',
    name: 'InviteLogs',
    component: () => import('@/views/common/invite-logs.vue'),
    meta: { title: '我的分享' },
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/common/community.vue'),
    meta: { title: '官方社群' },
  },
  {
    path: '/apps',
    name: 'WelfareApps',
    component: () => import('@/views/common/apps.vue'),
    meta: { title: '福利应用' },
  },
  {
    path: '/planet/compose',
    name: 'PlanetCompose',
    component: () => import('@/views/planet/compose.vue'),
    meta: { title: '发布帖子' },
  },
  {
    path: '/creator',
    name: 'Creator',
    component: () => import('@/views/planet/creator.vue'),
    meta: { title: '我的帖子' },
  },
  {
    path: '/planet/topics',
    name: 'PlanetTopics',
    component: () => import('@/views/planet/topics.vue'),
    meta: { title: '选择帖子板块' },
  },
  {
    path: '/user/:id',
    name: 'UserHome',
    component: () => import('@/views/user/home.vue'),
    meta: { title: '用户主页' },
  },
  {
    path: '/planet/:id',
    name: 'PostDetail',
    component: () => import('@/views/planet/detail.vue'),
    meta: { title: '帖子详情' },
  },
  {
    path: '/account/login',
    name: 'AccountLogin',
    component: () => import('@/views/me/account-login.vue'),
    meta: { title: '账号登录' },
  },
  {
    path: '/account/password',
    name: 'AccountPassword',
    component: () => import('@/views/me/account-password.vue'),
    meta: { title: '设置密码' },
  },
  {
    path: '/credential',
    name: 'Credential',
    component: () => import('@/views/me/credential.vue'),
    meta: { title: '账号凭证' },
  },
  {
    path: '/favorite',
    name: 'Favorite',
    component: () => import('@/views/common/favorite.vue'),
    meta: { title: '收藏' },
  },
  {
    path: '/purchase',
    name: 'Purchase',
    component: () => import('@/views/common/purchase.vue'),
    meta: { title: '我的购买' },
  },
  {
    path: '/follow',
    name: 'Follow',
    component: () => import('@/views/common/follow.vue'),
    meta: { title: '我的关注' },
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/common/history.vue'),
    meta: { title: '浏览记录' },
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
  if (to.query.code) rememberInviteCode(to.query.code)
  if (from.path) {
    useNavStore().setByRoute(to.path, from.path)
  }
  next()
})

export default router
