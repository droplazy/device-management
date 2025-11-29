import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(false);
    const username = ref('');
    const login = (user) => {
        isLoggedIn.value = true;
        username.value = user;
        // 可以在这里保存到 localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', user);
    };
    const logout = () => {
        isLoggedIn.value = false;
        username.value = '';
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
    };
    const initAuth = () => {
        // 从 localStorage 恢复登录状态
        const savedLogin = localStorage.getItem('isLoggedIn');
        const savedUsername = localStorage.getItem('username');
        if (savedLogin === 'true' && savedUsername) {
            isLoggedIn.value = true;
            username.value = savedUsername;
        }
    };
    return {
        isLoggedIn,
        username,
        login,
        logout,
        initAuth,
    };
});
