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

// Response interceptor pour gérer les erreurs d'auth - MOINS AGRESSIF
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Handle different types of 401 errors
    if (error.response?.status === 401) {
      // Skip auto-logout for login/register attempts
      if (originalRequest.url.includes('/login') || originalRequest.url.includes('/register')) {
        return Promise.reject(error)
      }
      
      // Check if it's a definitive token rejection from server
      const errorMessage = (error.response?.data?.message || error.response?.data?.error || '').toLowerCase()
      
      // Liste stricte des messages qui indiquent un token définitivement invalide
      const definitivelyInvalid = [
        'jwt expired',
        'jwt malformed', 
        'invalid token',
        'token expired',
        'no token provided',
        'invalid signature'
      ]
      
      const shouldLogout = definitivelyInvalid.some(msg => errorMessage.includes(msg))
      
      if (shouldLogout) {
        console.warn('Token definitively invalid - logging out:', errorMessage)
        setTimeout(() => {
          const authStore = useAuthStore()
          authStore.logout()
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }, 100)
      } else {
        // Pour les autres 401, ne pas déconnecter (peut être temporaire)
        console.warn('401 received but keeping session (might be temporary):', errorMessage || 'no message')
      }
    }
    
    // Handle network errors without logging out
    if (!error.response) {
      console.warn('Network error - keeping session active')
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

// API pour la gestion des utilisateurs (Super User uniquement)
export const usersAPI = {
  // Récupérer tous les utilisateurs
  getAll: () => api.get('/users'),
  
  // Mettre à jour le rôle d'un utilisateur
  updateRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),
  
  // Supprimer un utilisateur
  delete: (userId) => api.delete(`/users/${userId}`)
}

// API pour la gestion des entreprises
export const companiesAPI = {
  // Get all companies with their contacts
  getAll: async () => {
    const response = await api.get('/companies')
    return response.data
  },
  
  // Get a single company with its contacts
  get: async (id) => {
    const response = await api.get(`/companies/${id}`)
    return response.data
  },
  
  // Create a new company
  create: async (data) => {
    const response = await api.post('/companies', data)
    return response.data
  },
  
  // Update a company
  update: async (id, data) => {
    const response = await api.put(`/companies/${id}`, data)
    return response.data
  },
  
  // Delete a company
  delete: async (id) => {
    const response = await api.delete(`/companies/${id}`)
    return response.data
  }
}

// API pour la gestion des contacts
export const contactsAPI = {
  // Get all contacts
  getAll: async () => {
    const response = await api.get('/contacts')
    return response.data
  },
  
  // Create a new contact
  create: async (data) => {
    const response = await api.post('/contacts', data)
    return response.data
  },
  
  // Update a contact
  update: async (id, data) => {
    const response = await api.put(`/contacts/${id}`, data)
    return response.data
  },
  
  // Delete a contact
  delete: async (id) => {
    const response = await api.delete(`/contacts/${id}`)
    return response.data
  },
  
  // Link a contact to a company
  linkToCompany: async (companyId, contactId, isPrimary = false) => {
    const response = await api.post(`/companies/${companyId}/contacts/${contactId}`, { is_primary: isPrimary })
    return response.data
  },
  
  // Unlink a contact from a company
  unlinkFromCompany: async (companyId, contactId) => {
    const response = await api.delete(`/companies/${companyId}/contacts/${contactId}`)
    return response.data
  },
  
  // Set/unset primary contact for a company
  setPrimary: async (companyId, contactId, isPrimary) => {
    const response = await api.put(`/companies/${companyId}/contacts/${contactId}/primary`, { is_primary: isPrimary })
    return response.data
  }
}

// Convenience methods for backward compatibility
api.getCompanies = companiesAPI.getAll
api.getCompany = companiesAPI.get
api.createCompany = companiesAPI.create
api.updateCompany = companiesAPI.update
api.deleteCompany = companiesAPI.delete

api.getContacts = contactsAPI.getAll
api.createContact = contactsAPI.create
api.updateContact = contactsAPI.update
api.deleteContact = contactsAPI.delete
api.linkContactToCompany = contactsAPI.linkToCompany
api.unlinkContactFromCompany = contactsAPI.unlinkFromCompany
api.setPrimaryContact = contactsAPI.setPrimary

export default api
