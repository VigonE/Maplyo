import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  // For protected routes, check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('Route requires auth but user not authenticated, redirecting to login')
    return '/login'
  }
  
  // If going to login but already authenticated, redirect to dashboard
  if (to.path === '/login' && authStore.isAuthenticated) {
    // Validate token before allowing access to dashboard
    const isValidToken = await authStore.validateToken()
    if (isValidToken) {
      return '/dashboard'
    }
  }
  
  // Load user profile if authenticated but no user data
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.loadUserProfile()
  }
})

export default router
