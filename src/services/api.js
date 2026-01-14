import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useDemoStore } from '@/stores/demo'

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

// Request interceptor pour ajouter le token et gérer le mode démo
api.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore()
    const demoStore = useDemoStore()
    
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // Vérifier si on est en mode démo (par le store OU par le token)
    const isDemoMode = demoStore.isDemoMode || (authStore.token && authStore.token.startsWith('demo-token'))
    
    if (isDemoMode) {
      // En mode démo, intercepter la requête et retourner des données simulées
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
      
      // Créer une réponse simulée basée sur l'URL
      const mockResponse = createMockResponse(config, demoStore)
      
      // Annuler la requête et utiliser l'adaptateur pour retourner la réponse simulée
      config.adapter = () => Promise.resolve({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config,
        request: {}
      })
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Fonction pour créer des réponses simulées en mode démo
function createMockResponse(config, demoStore) {
  const url = config.url
  const method = config.method.toLowerCase()
  
  // Tabs
  if (url.includes('/tabs')) {
    if (method === 'get') {
      return [{ id: 'default', name: 'All Leads', order: 0, user_id: 9999 }]
    }
    return { success: true }
  }
  
  // Todos
  if (url.includes('/todos')) {
    if (method === 'get') {
      // Si l'URL contient /prospects/{id}/todos, filtrer par prospect_id
      const prospectIdMatch = url.match(/\/prospects\/(\d+)\/todos/)
      if (prospectIdMatch) {
        const prospectId = parseInt(prospectIdMatch[1])
        const allTodos = demoStore.getDemoTodos()
        return allTodos.filter(todo => todo.prospect_id === prospectId)
      }
      // Sinon retourner tous les todos (/todos/all)
      return demoStore.getDemoTodos()
    }
    if (method === 'post') {
      // Extraire le prospect_id de l'URL si présent (/prospects/{id}/todos)
      const prospectIdMatch = url.match(/\/prospects\/(\d+)\/todos/)
      const prospectId = prospectIdMatch ? parseInt(prospectIdMatch[1]) : null
      
      const todoData = {
        ...config.data,
        prospect_id: prospectId
      }
      
      const newTodo = demoStore.createDemoTodo(todoData)
      return newTodo
    }
    if (method === 'put') {
      const id = parseInt(url.match(/\/todos\/(\d+)/)?.[1])
      const updated = demoStore.updateDemoTodo(id, config.data)
      return updated
    }
    if (method === 'delete') {
      const id = parseInt(url.match(/\/todos\/(\d+)/)?.[1])
      demoStore.deleteDemoTodo(id)
      return { success: true }
    }
  }
  
  // Prospects
  if (url.includes('/prospects')) {
    if (method === 'get' && !url.match(/\/prospects\/\d+/)) {
      return demoStore.getDemoProspects()
    }
    if (method === 'get' && url.match(/\/prospects\/(\d+)/)) {
      const id = parseInt(url.match(/\/prospects\/(\d+)/)?.[1])
      return demoStore.getDemoProspectById(id)
    }
    if (method === 'post' && url.includes('/import-csv')) {
      return { success: false, error: 'Import CSV non disponible en mode démo' }
    }
    if (method === 'post' && url.includes('/reorder')) {
      return { success: true }
    }
    if (method === 'post') {
      const newProspect = demoStore.createDemoProspect(config.data)
      return newProspect
    }
    if (method === 'put') {
      const id = parseInt(url.match(/\/prospects\/(\d+)/)?.[1])
      const updated = demoStore.updateDemoProspect(id, config.data)
      return updated
    }
    if (method === 'delete') {
      const id = parseInt(url.match(/\/prospects\/(\d+)/)?.[1])
      demoStore.deleteDemoProspect(id)
      return { success: true }
    }
  }
  
  // Companies
  if (url.includes('/companies')) {
    if (method === 'get' && !url.match(/\/companies\/\d+/)) {
      return demoStore.getDemoCompanies()
    }
    if (method === 'get' && url.match(/\/companies\/(\d+)/)) {
      const id = parseInt(url.match(/\/companies\/(\d+)/)?.[1])
      const company = demoStore.getDemoCompanyById(id)
      if (company) {
        // Ajouter les contacts de l'entreprise
        const contacts = demoStore.getDemoContactsByCompany(id)
        return { ...company, contacts }
      }
      return company
    }
    if (method === 'post') {
      const newCompany = demoStore.createDemoCompany(config.data)
      return newCompany
    }
    if (method === 'put') {
      const id = parseInt(url.match(/\/companies\/(\d+)/)?.[1])
      const updated = demoStore.updateDemoCompany(id, config.data)
      return updated
    }
    if (method === 'delete') {
      const id = parseInt(url.match(/\/companies\/(\d+)/)?.[1])
      demoStore.deleteDemoCompany(id)
      return { success: true }
    }
  }
  
  // Contacts
  if (url.includes('/contacts')) {
    // Link contact to company: POST /companies/{companyId}/contacts/{contactId}
    if (method === 'post' && url.match(/\/companies\/(\d+)\/contacts\/(\d+)/)) {
      const matches = url.match(/\/companies\/(\d+)\/contacts\/(\d+)/)
      const companyId = parseInt(matches[1])
      const contactId = parseInt(matches[2])
      demoStore.linkContactToCompany(contactId, companyId)
      return { success: true }
    }
    
    // Unlink contact from company: DELETE /companies/{companyId}/contacts/{contactId}
    if (method === 'delete' && url.match(/\/companies\/(\d+)\/contacts\/(\d+)/)) {
      const matches = url.match(/\/companies\/(\d+)\/contacts\/(\d+)/)
      const contactId = parseInt(matches[2])
      demoStore.unlinkContactFromCompany(contactId)
      return { success: true }
    }
    
    // Set primary contact: PUT /companies/{companyId}/contacts/{contactId}/primary
    if (method === 'put' && url.includes('/primary')) {
      const matches = url.match(/\/companies\/(\d+)\/contacts\/(\d+)\/primary/)
      if (matches) {
        const companyId = parseInt(matches[1])
        const contactId = parseInt(matches[2])
        const isPrimary = config.data?.is_primary !== false
        demoStore.setPrimaryContact(companyId, contactId, isPrimary)
        return { success: true }
      }
    }
    
    // Get all contacts
    if (method === 'get' && !url.match(/\/contacts\/\d+/)) {
      return demoStore.getDemoContacts()
    }
    
    // Get contact by id
    if (method === 'get' && url.match(/\/contacts\/(\d+)/)) {
      const id = parseInt(url.match(/\/contacts\/(\d+)/)?.[1])
      return demoStore.getDemoContactById(id)
    }
    
    // Create contact
    if (method === 'post' && !url.includes('/companies')) {
      const newContact = demoStore.createDemoContact(config.data)
      return newContact
    }
    
    // Update contact
    if (method === 'put' && !url.includes('/primary')) {
      const id = parseInt(url.match(/\/contacts\/(\d+)/)?.[1])
      const updated = demoStore.updateDemoContact(id, config.data)
      return updated
    }
    
    // Delete contact
    if (method === 'delete' && !url.includes('/companies')) {
      const id = parseInt(url.match(/\/contacts\/(\d+)/)?.[1])
      demoStore.deleteDemoContact(id)
      return { success: true }
    }
  }
  
  // Settings
  if (url.includes('/settings')) {
    return { 
      cold_closing_lead_time: 30,
      warm_closing_lead_time: 15,
      hot_closing_lead_time: 7,
      recurring_closing_lead_time: 30
    }
  }
  
  // Profile
  if (url.includes('/profile')) {
    return demoStore.demoUser
  }
  
  // Users (admin)
  if (url.includes('/users')) {
    return []
  }
  
  // Par défaut
  return { success: true }
}

// Response interceptor pour gérer les erreurs d'auth - MOINS AGRESSIF
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // En mode démo, ignorer les erreurs 401 et retourner des données simulées
    const authStore = useAuthStore()
    const demoStore = useDemoStore()
    const isDemoMode = demoStore.isDemoMode || (authStore.token && authStore.token.startsWith('demo-token'))
    
    if (isDemoMode && error.response?.status === 401) {
      const mockResponse = createMockResponse(originalRequest, demoStore)
      return {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: originalRequest,
        request: {}
      }
    }
    
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

// API pour la gestion des entreprises (version originale sans wrapper)
const companiesAPIOriginal = {
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

// API pour la gestion des contacts (version originale sans wrapper)
const contactsAPIOriginal = {
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

// Wrapper functions pour gérer le mode démo
const createDemoWrapper = (apiFunction, demoHandler) => {
  return async (...args) => {
    const demoStore = useDemoStore()
    if (demoStore.isDemoMode && demoHandler) {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
      return demoHandler(demoStore, ...args)
    }
    return apiFunction(...args)
  }
}

// Prospects API avec support du mode démo
export const prospectsAPI = {
  getAll: createDemoWrapper(
    () => api.get('/prospects'),
    (demoStore) => ({ data: demoStore.getDemoProspects() })
  ),
  
  getById: createDemoWrapper(
    (id) => api.get(`/prospects/${id}`),
    (demoStore, id) => ({ data: demoStore.getDemoProspectById(id) })
  ),
  
  create: createDemoWrapper(
    (data) => api.post('/prospects', data),
    (demoStore, data) => ({ data: demoStore.createDemoProspect(data) })
  ),
  
  update: createDemoWrapper(
    (id, data) => api.put(`/prospects/${id}`, data),
    (demoStore, id, data) => ({ data: demoStore.updateDemoProspect(id, data) })
  ),
  
  delete: createDemoWrapper(
    (id) => api.delete(`/prospects/${id}`),
    (demoStore, id) => {
      demoStore.deleteDemoProspect(id)
      return { data: { success: true } }
    }
  ),
  
  reorder: createDemoWrapper(
    (data) => api.post('/prospects/reorder', data),
    () => ({ data: { success: true } })
  )
}

// Todos API avec support du mode démo
export const todosAPI = {
  getAll: createDemoWrapper(
    () => api.get('/todos'),
    (demoStore) => ({ data: demoStore.getDemoTodos() })
  ),
  
  create: createDemoWrapper(
    (data) => api.post('/todos', data),
    (demoStore, data) => ({ data: demoStore.createDemoTodo(data) })
  ),
  
  update: createDemoWrapper(
    (id, data) => api.put(`/todos/${id}`, data),
    (demoStore, id, data) => ({ data: demoStore.updateDemoTodo(id, data) })
  ),
  
  delete: createDemoWrapper(
    (id) => api.delete(`/todos/${id}`),
    (demoStore, id) => {
      demoStore.deleteDemoTodo(id)
      return { data: { success: true } }
    }
  )
}

// Wrapper pour companies API avec support du mode démo
export const companiesAPI = {
  getAll: createDemoWrapper(
    companiesAPIOriginal.getAll,
    (demoStore) => demoStore.getDemoCompanies()
  ),
  
  get: createDemoWrapper(
    companiesAPIOriginal.get,
    (demoStore, id) => demoStore.getDemoCompanies().find(c => c.id === id)
  ),
  
  create: createDemoWrapper(
    companiesAPIOriginal.create,
    (demoStore, data) => demoStore.createDemoCompany(data)
  ),
  
  update: createDemoWrapper(
    companiesAPIOriginal.update,
    (demoStore, id, data) => demoStore.updateDemoCompany(id, data)
  ),
  
  delete: createDemoWrapper(
    companiesAPIOriginal.delete,
    (demoStore, id) => {
      demoStore.deleteDemoCompany(id)
      return { success: true }
    }
  )
}

// Wrapper pour contacts API avec support du mode démo
export const contactsAPI = {
  getAll: createDemoWrapper(
    contactsAPIOriginal.getAll,
    (demoStore) => demoStore.getDemoContacts()
  ),
  
  create: createDemoWrapper(
    contactsAPIOriginal.create,
    (demoStore, data) => demoStore.createDemoContact(data)
  ),
  
  update: createDemoWrapper(
    contactsAPIOriginal.update,
    (demoStore, id, data) => demoStore.updateDemoContact(id, data)
  ),
  
  delete: createDemoWrapper(
    contactsAPIOriginal.delete,
    (demoStore, id) => {
      demoStore.deleteDemoContact(id)
      return { success: true }
    }
  ),
  
  linkToCompany: createDemoWrapper(
    contactsAPIOriginal.linkToCompany,
    (demoStore, companyId, contactId) => {
      demoStore.linkContactToCompany(contactId, companyId)
      return { success: true }
    }
  ),
  
  unlinkFromCompany: createDemoWrapper(
    contactsAPIOriginal.unlinkFromCompany,
    (demoStore, companyId, contactId) => {
      demoStore.unlinkContactFromCompany(contactId)
      return { success: true }
    }
  ),
  
  setPrimary: createDemoWrapper(
    contactsAPIOriginal.setPrimary,
    (demoStore, companyId, contactId, isPrimary) => {
      demoStore.setPrimaryContact(companyId, contactId, isPrimary)
      return { success: true }
    }
  )
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
