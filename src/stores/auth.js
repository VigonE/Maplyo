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

  // Function to validate token locally (check expiration)
  function validateToken() {
    if (!token.value) return false
    
    try {
      // Decode JWT payload (simple base64 decode)
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token expired locally')
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  // Function to load user profile only when needed
  async function loadUserProfile() {
    if (!token.value || !validateToken()) {
      return false
    }
    
    // Don't reload if we already have user data
    if (user.value) return true
    
    try {
      const response = await api.get('/profile')
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
      return true
    } catch (error) {
      console.warn('Failed to load user profile:', error.message)
      // Only logout on clear auth failures, not network issues
      if (error.response?.status === 401 || error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || ''
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          logout()
          return false
        }
      }
      // For network errors, assume token is still valid
      return true
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
