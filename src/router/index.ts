import { createRouter, createWebHistory } from 'vue-router'
import DeviceListView from '@/views/DeviceListView.vue'
import NewProcessView from '@/views/NewProcessView.vue'
import ProcessCenterView from '@/views/ProcessCenterView.vue'
import SupportView from '@/views/SupportView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

// 如果部署在 /home 路径下，需要设置 base
const base = import.meta.env.VITE_BASE_PATH || '/'

const router = createRouter({
  history: createWebHistory(base),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: '登录', requiresAuth: false },
    },
    { path: '/', redirect: '/devices' },
    { path: '/home', redirect: '/devices' },
    {
      path: '/devices',
      name: 'devices',
      component: DeviceListView,
      meta: { title: '设备列表', requiresAuth: true },
    },
    {
      path: '/process/new',
      name: 'new-process',
      component: NewProcessView,
      meta: { title: '新建流程', requiresAuth: true },
    },
    {
      path: '/process/center',
      name: 'process-center',
      component: ProcessCenterView,
      meta: { title: '流程管理', requiresAuth: true },
    },
    {
      path: '/support',
      name: 'support',
      component: SupportView,
      meta: { title: '技术支持', requiresAuth: true },
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态（每次路由切换时都检查，确保状态是最新的）
  authStore.initAuth()

  // 如果访问根路径或 /home，根据登录状态重定向
  if (to.path === '/' || to.path === '/home') {
    if (authStore.isLoggedIn) {
      next('/devices')
    } else {
      next('/login')
    }
    return
  }

  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    // 已登录用户访问登录页，重定向到首页
    next('/devices')
  } else {
    next()
  }
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} · 设备管理系统`
  }
})

export default router
