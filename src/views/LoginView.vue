<script setup lang="ts">
import { ref, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import { useMockData } from '@/config/app'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const loginForm = ref({
  username: '',
  password: '',
})

const handleSubmit = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    message.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    if (useMockData) {
      // 模拟登录
      await new Promise((resolve) => setTimeout(resolve, 500))
      authStore.login(loginForm.value.username)
      message.success('登录成功')
      router.push('/devices')
    } else {
      // 调用真实登录接口
      const response = await login({
        username: loginForm.value.username,
        password: loginForm.value.password,
      })
      
      if (response.code === 200) {
        authStore.login(response.data.username || loginForm.value.username)
        message.success('登录成功')
        router.push('/devices')
      } else {
        message.error('登录失败，请检查用户名和密码')
      }
    }
  } catch (error) {
    const errorMsg = (error as any)?.response?.data?.message || '登录失败，请检查用户名和密码'
    message.error(errorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>设备管理系统</h1>
        <p class="subtitle">请登录您的账户</p>
      </div>

      <a-form
        :model="loginForm"
        layout="vertical"
        @submit.prevent="handleSubmit"
        class="login-form"
      >
        <a-form-item label="用户名" required>
          <a-input
            v-model:value="loginForm.username"
            size="large"
            placeholder="请输入用户名"
            :prefix="h(UserOutlined)"
          />
        </a-form-item>

        <a-form-item label="密码" required>
          <a-input-password
            v-model:value="loginForm.password"
            size="large"
            placeholder="请输入密码"
            :prefix="h(LockOutlined)"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            block
          >
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #1677ff;
  margin: 0 auto 24px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2633;
}

.subtitle {
  margin: 0;
  color: #8c8c8c;
  font-size: 14px;
}

.login-form {
  margin-top: 32px;
}

.login-form :deep(.ant-form-item-label > label) {
  font-weight: 500;
  color: #1f2633;
}

.login-form :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}

.login-form :deep(.ant-btn-primary) {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}
</style>

