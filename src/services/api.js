import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Use different base URL depending on environment
const getBaseURL = () => {
  // In development, explicitly use port 3001 if proxy doesn't work
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api'
  }
  // In production, use relative path
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000
})

// Request interceptor pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor pour gérer les erreurs d'auth
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Handle different types of 401 errors
    if (error.response?.status === 401) {
      // Skip auto-logout for login attempts
      if (originalRequest.url.includes('/login')) {
        return Promise.reject(error)
      }
      
      // Check if it's a token expiration vs invalid token
      const errorMessage = error.response?.data?.message || ''
      const isTokenExpired = errorMessage.includes('expired') || errorMessage.includes('Token expired')
      const isInvalidToken = errorMessage.includes('invalid') || errorMessage.includes('Invalid token')
      
      // Only logout for clearly invalid tokens, not network issues
      if (isTokenExpired || isInvalidToken) {
        console.warn('Token expired/invalid - logging out user:', errorMessage)
        setTimeout(() => {
          const authStore = useAuthStore()
          authStore.logout()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }, 100)
      } else {
        // For other 401s, just log and let the app handle it
        console.warn('401 error but not logging out (might be temporary):', errorMessage)
      }
    }
    
    // Handle network errors without logging out
    if (!error.response && error.code === 'ECONNABORTED') {
      console.warn('Request timeout - not logging out')
    }
    
    return Promise.reject(error)
  }
)

// API functions for tabs
export const tabsAPI = {
  // Get all tabs
  getTabs: () => api.get('/tabs'),
  
  // Create new tab
  createTab: (data) => api.post('/tabs', data),
  
  // Update tab (rename)
  updateTab: (id, data) => api.put(`/tabs/${id}`, data),
  
  // Delete tab
  deleteTab: (id) => api.delete(`/tabs/${id}`)
}

// API pour gérer le profil utilisateur
export const profileAPI = {
  get: () => api.get('/profile'),
  changePassword: (passwordData) => api.put('/profile/password', passwordData)
}

// CSV Import API
export const csvImportAPI = {
  importCsv: (csvData, options) => {
    return api.post('/prospects/import-csv', { csvData, options }, {
      timeout: 300000 // 5 minutes timeout pour l'import
    })
  }
}

// Convenience function for CSV import
export const importCsv = (csvData, options = {}) => {
  return api.post('/prospects/import-csv', { csvData, options }, {
    timeout: 300000 // 5 minutes timeout for large imports
  })
}

export default api
