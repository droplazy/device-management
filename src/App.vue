<script setup lang="ts">
import { useRoute, useRouter, RouterView } from 'vue-router'
import { computed, ref } from 'vue'
import {
  DesktopOutlined,
  PlusSquareOutlined,
  ProfileOutlined,
  CustomerServiceOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const collapsed = ref(false)

const menuItems = [
  { key: '/devices', label: '设备列表', icon: DesktopOutlined },
  { key: '/process/new', label: '新建流程', icon: PlusSquareOutlined },
  { key: '/process/center', label: '流程管理', icon: ProfileOutlined },
  { key: '/support', label: '技术支持', icon: CustomerServiceOutlined },
]

const selectedKeys = computed(() => {
  const match = menuItems.find((item) => route.path.startsWith(item.key))
  return match ? [match.key] : ['/devices']
})

const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(key)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 如果是登录页，不显示布局
const isLoginPage = computed(() => route.path === '/login')
</script>

<template>
  <RouterView v-if="isLoginPage" />
  <div v-else class="app-layout">
    <header class="app-header">
      <div class="brand">
        <div>
          <p class="brand-title">设备管理系统</p>
        </div>
        <div class="sidebar-actions">
          <a-button size="small" type="text" @click="collapsed = !collapsed">
            <component
              :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
            />
            <!-- <span>{{ collapsed ? '展开菜单' : '收起菜单' }}</span> -->
          </a-button>
        </div>
      </div>
      <div class="user-info">
        <span>{{ authStore.username || '用户' }} 欢迎您</span>
        <a-button type="link" size="small" @click="handleLogout">退出登录</a-button>
      </div>
    </header>

    <div class="app-body">
      <aside :class="['sidebar', { collapsed }]">
        <a-menu
          mode="inline"
          :selectedKeys="selectedKeys"
          :inline-collapsed="collapsed"
          @select="handleMenuSelect"
        >
          <a-menu-item v-for="item in menuItems" :key="item.key">
            <template #icon>
              <component :is="item.icon" />
            </template>
            {{ item.label }}
          </a-menu-item>
        </a-menu>
      </aside>

      <main class="main-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
