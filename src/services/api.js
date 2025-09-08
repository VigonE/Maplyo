import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: '/api',
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
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = '/login'
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
