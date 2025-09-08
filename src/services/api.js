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

export default api
