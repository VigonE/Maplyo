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
    if (authStore.validateToken()) {
      return '/dashboard'
    } else {
      // Token is expired, allow going to login
      authStore.logout()
    }
  }
  
  // Load user profile if authenticated but no user data (only if token is valid)
  if (authStore.isAuthenticated && !authStore.user && authStore.validateToken()) {
    try {
      await authStore.loadUserProfile()
    } catch (error) {
      console.warn('Failed to load user profile in router:', error)
      // Don't logout here, just continue
    }
  }
})

export default router
