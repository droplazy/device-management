import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const username = ref('')

  const login = (user: string) => {
    isLoggedIn.value = true
    username.value = user
    // 可以在这里保存到 localStorage
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('username', user)
  }

  const logout = () => {
    isLoggedIn.value = false
    username.value = ''
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
  }

  const initAuth = () => {
    try {
      // 从 localStorage 恢复登录状态
      const savedLogin = localStorage.getItem('isLoggedIn')
      const savedUsername = localStorage.getItem('username')
      if (savedLogin === 'true' && savedUsername) {
        isLoggedIn.value = true
        username.value = savedUsername
      } else {
        isLoggedIn.value = false
        username.value = ''
      }
    } catch (error) {
      // 如果 localStorage 不可用，重置状态
      console.warn('Failed to init auth from localStorage:', error)
      isLoggedIn.value = false
      username.value = ''
    }
  }

  return {
    isLoggedIn,
    username,
    login,
    logout,
    initAuth,
  }
})

