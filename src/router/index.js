import { createRouter, createWebHistory } from 'vue-router';
import DeviceListView from '@/views/DeviceListView.vue';
import NewProcessView from '@/views/NewProcessView.vue';
import ProcessCenterView from '@/views/ProcessCenterView.vue';
import SupportView from '@/views/SupportView.vue';
import LoginView from '@/views/LoginView.vue';
import { useAuthStore } from '@/stores/auth';
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { title: '登录', requiresAuth: false },
        },
        { path: '/', redirect: '/devices' },
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
});
// 路由守卫
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    // 初始化认证状态
    if (!authStore.isLoggedIn) {
        authStore.initAuth();
    }
    // 检查是否需要登录
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        next('/login');
    }
    else if (to.path === '/login' && authStore.isLoggedIn) {
        // 已登录用户访问登录页，重定向到首页
        next('/devices');
    }
    else {
        next();
    }
});
router.afterEach((to) => {
    if (to.meta.title) {
        document.title = `${to.meta.title} · 设备管理系统`;
    }
});
export default router;
