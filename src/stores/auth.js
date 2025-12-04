import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '@/services/api'

// Helpers pour le stockage persistant (utilise localStorage qui persiste entre sessions)
const STORAGE_KEYS = {
  TOKEN: 'maplyo_auth_token',
  USER: 'maplyo_auth_user',
  LOGIN_TIME: 'maplyo_login_time'
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    // Backup dans sessionStorage aussi
    sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  } catch (e) {
    console.warn('Storage save error:', e)
  }
}

function loadFromStorage(key, isJson = false) {
  try {
    // Essayer localStorage d'abord (persiste entre sessions)
    let value = localStorage.getItem(key)
    
    // Si pas trouvé dans localStorage, essayer sessionStorage
    if (!value) {
      value = sessionStorage.getItem(key)
      // Si trouvé dans sessionStorage, le remettre dans localStorage
      if (value) {
        localStorage.setItem(key, value)
      }
    }
    
    // Migration depuis les anciennes clés
    if (!value) {
      const oldKey = key.replace('maplyo_auth_', '')
      value = localStorage.getItem(oldKey)
      if (value) {
        // Migrer vers la nouvelle clé
        localStorage.setItem(key, value)
        localStorage.removeItem(oldKey)
      }
    }
    
    if (value && isJson) {
      return JSON.parse(value)
    }
    return value
  } catch (e) {
    console.warn('Storage load error:', e)
    return null
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
    // Nettoyer aussi les anciennes clés
    const oldKey = key.replace('maplyo_auth_', '')
    localStorage.removeItem(oldKey)
  } catch (e) {
    console.warn('Storage remove error:', e)
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Charger le token et l'utilisateur depuis le stockage persistant
  const token = ref(loadFromStorage(STORAGE_KEYS.TOKEN))
  const user = ref(loadFromStorage(STORAGE_KEYS.USER, true))

  const isAuthenticated = computed(() => !!token.value && validateToken())

  // Surveiller les changements du token et sauvegarder automatiquement
  watch(token, (newToken) => {
    if (newToken) {
      saveToStorage(STORAGE_KEYS.TOKEN, newToken)
    }
  })

  watch(user, (newUser) => {
    if (newUser) {
      saveToStorage(STORAGE_KEYS.USER, newUser)
    }
  }, { deep: true })

  async function login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      token.value = response.data.token
      user.value = response.data.user
      
      // Sauvegarder avec timestamp
      saveToStorage(STORAGE_KEYS.TOKEN, token.value)
      saveToStorage(STORAGE_KEYS.USER, response.data.user)
      saveToStorage(STORAGE_KEYS.LOGIN_TIME, Date.now().toString())
      
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
      
      // Sauvegarder avec timestamp
      saveToStorage(STORAGE_KEYS.TOKEN, token.value)
      saveToStorage(STORAGE_KEYS.USER, response.data.user)
      saveToStorage(STORAGE_KEYS.LOGIN_TIME, Date.now().toString())
      
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
    
    // Nettoyer tout le stockage
    removeFromStorage(STORAGE_KEYS.TOKEN)
    removeFromStorage(STORAGE_KEYS.USER)
    removeFromStorage(STORAGE_KEYS.LOGIN_TIME)
  }

  // Function to validate token locally (check expiration) - ne déconnecte PAS automatiquement
  function validateToken() {
    if (!token.value) return false
    
    try {
      // Decode JWT payload (simple base64 decode)
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      // Check if token is expired (but with 1-day grace period)
      if (payload.exp && payload.exp < currentTime) {
        console.warn('Token expired locally at:', new Date(payload.exp * 1000))
        // Ne pas déconnecter automatiquement - laisser le serveur décider
        // L'utilisateur peut toujours être redirigé vers login si le serveur rejette
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error validating token:', error)
      // Ne pas déconnecter sur erreur de parsing - le token pourrait être valide
      return true
    }
  }

  // Function to get token expiration info
  function getTokenInfo() {
    if (!token.value) return null
    
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      return {
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
        userId: payload.userId,
        email: payload.email
      }
    } catch (e) {
      return null
    }
  }

  // Function to load user profile only when needed
  async function loadUserProfile() {
    if (!token.value) {
      return false
    }
    
    // Don't reload if we already have user data
    if (user.value) return true
    
    try {
      const response = await api.get('/profile')
      user.value = response.data
      saveToStorage(STORAGE_KEYS.USER, response.data)
      return true
    } catch (error) {
      console.warn('Failed to load user profile:', error.message)
      // Ne JAMAIS déconnecter automatiquement sur erreur réseau
      // Seulement si le serveur dit explicitement que le token est invalide
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || ''
        // Seulement déconnecter si le message indique clairement un token invalide
        if (errorMessage.toLowerCase().includes('invalid token') || 
            errorMessage.toLowerCase().includes('token expired') ||
            errorMessage.toLowerCase().includes('jwt expired')) {
          console.warn('Token definitively invalid, logging out')
          logout()
          return false
        }
      }
      // Pour toute autre erreur, garder la session
      return true
    }
  }

  // Restaurer la session au démarrage
  function restoreSession() {
    const storedToken = loadFromStorage(STORAGE_KEYS.TOKEN)
    const storedUser = loadFromStorage(STORAGE_KEYS.USER, true)
    
    if (storedToken && !token.value) {
      token.value = storedToken
    }
    if (storedUser && !user.value) {
      user.value = storedUser
    }
    
    console.log('Session restored:', {
      hasToken: !!token.value,
      hasUser: !!user.value,
      email: user.value?.email
    })
  }

  // Initialize: restore session and load profile if needed
  restoreSession()
  if (token.value && !user.value) {
    // Delay the profile loading to avoid issues during app initialization
    setTimeout(loadUserProfile, 500)
  }

  // Getters pour vérifier les rôles
  const isSuperUser = computed(() => user.value?.role === 'super_user')
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_user')
  const isReadOnly = computed(() => user.value?.role === 'read-only')
  const userRole = computed(() => user.value?.role || 'user')

  return {
    token,
    user,
    isAuthenticated,
    isSuperUser,
    isAdmin,
    isReadOnly,
    userRole,
    login,
    register,
    logout,
    loadUserProfile,
    validateToken,
    getTokenInfo,
    restoreSession
  }
})
