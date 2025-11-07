import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      console.log('Login successful for:', response.data.user.email)
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message)
      return { success: false, error: error.response?.data?.error || 'Connection error' }
    }
  }

  async function register(userData) {
    try {
      const response = await api.post('/register', userData)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      console.log('Registration successful for:', response.data.user.email)
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error || error.message)
      return { success: false, error: error.response?.data?.error || 'Registration error' }
    }
  }

  function logout() {
    console.log('Logging out user:', user.value?.email || 'unknown')
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Function to check if token is valid
  async function validateToken() {
    if (!token.value) return false
    
    try {
      await api.get('/profile')
      return true
    } catch (error) {
      console.warn('Token validation failed:', error.message)
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout()
        return false
      }
      // For network errors, assume token is still valid
      return true
    }
  }

  // Function to load user profile
  async function loadUserProfile() {
    if (!token.value || user.value) return
    
    try {
      const response = await api.get('/profile')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch (error) {
      console.warn('Failed to load user profile:', error.message)
      // Only logout if it's clearly a token issue (not network error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout()
      }
    }
  }

  // Initialize user from token if exists (but don't auto-logout on failure)
  if (token.value && !user.value) {
    // Delay the profile loading to avoid issues during app initialization
    setTimeout(loadUserProfile, 1000)
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loadUserProfile,
    validateToken
  }
})
