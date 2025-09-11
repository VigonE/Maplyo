import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import api from '@/services/api'

export const useProspectsStore = defineStore('prospects', () => {
  // Utiliser shallowRef pour éviter la réactivité profonde sur de gros tableaux
  const prospects = shallowRef([])
  const loading = ref(false)
  const lastFetchTime = ref(0)
  const updateQueue = ref(new Set()) // Queue pour les mises à jour en batch
  const isProcessingUpdates = ref(false)

  // Cache pour les calculs coûteux
  const weightedRevenueCache = new Map()
  const filteredProspectsCache = new Map()

  // Computed pour calculer le revenu pondéré par la probabilité avec cache
  const getWeightedRevenue = (prospect) => {
    const cacheKey = `${prospect.id}-${prospect.revenue}-${prospect.probability_coefficient}`
    
    if (weightedRevenueCache.has(cacheKey)) {
      return weightedRevenueCache.get(cacheKey)
    }
    
    if (!prospect.revenue) {
      weightedRevenueCache.set(cacheKey, 0)
      return 0
    }
    
    const probability = prospect.probability_coefficient || 100
    const result = (prospect.revenue * probability) / 100
    weightedRevenueCache.set(cacheKey, result)
    
    // Limiter la taille du cache
    if (weightedRevenueCache.size > 1000) {
      const firstKey = weightedRevenueCache.keys().next().value
      weightedRevenueCache.delete(firstKey)
    }
    
    return result
  }

  // Computed pour obtenir les prospects avec revenus pondérés (avec cache)
  const prospectsWithWeightedRevenue = computed(() => {
    const cacheKey = `prospects-${prospects.value.length}-${lastFetchTime.value}`
    
    if (filteredProspectsCache.has(cacheKey)) {
      return filteredProspectsCache.get(cacheKey)
    }
    
    const result = prospects.value.map(prospect => ({
      ...prospect,
      weightedRevenue: getWeightedRevenue(prospect)
    }))
    
    filteredProspectsCache.set(cacheKey, result)
    
    // Limiter la taille du cache
    if (filteredProspectsCache.size > 10) {
      const firstKey = filteredProspectsCache.keys().next().value
      filteredProspectsCache.delete(firstKey)
    }
    
    return result
  })

  // Fonction pour vider les caches
  const clearCaches = () => {
    weightedRevenueCache.clear()
    filteredProspectsCache.clear()
  }

  // Fonction pour mettre à jour un prospect localement sans rechargement
  const updateProspectLocal = (id, updatedData) => {
    const index = prospects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      // Créer un nouveau tableau pour déclencher la réactivité
      const newProspects = [...prospects.value]
      newProspects[index] = { ...newProspects[index], ...updatedData }
      prospects.value = newProspects
      clearCaches() // Vider les caches après modification
    }
  }

  // Fonction pour ajouter des mises à jour en batch
  const addToUpdateQueue = (prospectId, updates) => {
    updateQueue.value.add({ id: prospectId, ...updates })
    
    // Traiter la queue après un délai
    if (!isProcessingUpdates.value) {
      setTimeout(processUpdateQueue, 100)
    }
  }

  // Traiter les mises à jour en batch
  const processUpdateQueue = async () => {
    if (isProcessingUpdates.value || updateQueue.value.size === 0) return
    
    isProcessingUpdates.value = true
    const updates = Array.from(updateQueue.value)
    updateQueue.value.clear()
    
    try {
      // Envoyer toutes les mises à jour en une seule requête
      await api.put('/prospects/batch-update', { updates })
      console.log(`✅ Processed ${updates.length} updates in batch`)
    } catch (error) {
      console.error('❌ Error processing batch updates:', error)
      // Recharger en cas d'erreur pour assurer la cohérence
      await fetchProspects()
    } finally {
      isProcessingUpdates.value = false
    }
  }

  async function fetchProspects(force = false) {
    // Éviter les requêtes multiples simultanées
    if (loading.value && !force) return
    
    // Cache simple: éviter de recharger trop souvent
    const now = Date.now()
    if (!force && (now - lastFetchTime.value) < 1000) { // Minimum 1s entre les requêtes
      return
    }
    
    loading.value = true
    try {
      const response = await api.get('/prospects')
      prospects.value = response.data
      lastFetchTime.value = now
      clearCaches()
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      loading.value = false
    }
  }

  async function createProspect(prospectData) {
    try {
      const response = await api.post('/prospects', prospectData)
      
      // Ajouter le nouveau prospect localement au lieu de recharger
      prospects.value = [...prospects.value, response.data]
      clearCaches()
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error creating prospect:', error)
      return { success: false, error: error.response?.data?.error || 'Creation error' }
    }
  }

  async function updateProspect(id, prospectData) {
    try {
      // Mettre à jour localement d'abord pour une réactivité immédiate
      updateProspectLocal(id, prospectData)
      
      const response = await api.put(`/prospects/${id}`, prospectData)
      
      // Mettre à jour avec les données du serveur
      updateProspectLocal(id, response.data)
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error updating prospect:', error)
      // En cas d'erreur, recharger pour assurer la cohérence
      await fetchProspects(true)
      return { success: false, error: error.response?.data?.error || 'Update error' }
    }
  }

  // Assigner un prospect à un onglet
  async function assignProspectToTab(prospectId, tabId) {
    try {
      const prospect = prospects.value.find(p => p.id === prospectId)
      if (prospect) {
        const updatedData = { ...prospect, tabId }
        const response = await updateProspect(prospectId, updatedData)
        return response
      }
    } catch (error) {
      console.error('Error assigning prospect to tab:', error)
      return { success: false, error: 'Assignment error' }
    }
  }

  // Obtenir les prospects d'un onglet spécifique
  function getProspectsByTab(tabId) {
    if (tabId === 'default') {
      return prospects.value
    }
    return prospects.value.filter(p => p.tabId === tabId)
  }

  async function deleteProspect(id) {
    try {
      await api.delete(`/prospects/${id}`)
      
      // Supprimer localement au lieu de recharger
      prospects.value = prospects.value.filter(p => p.id !== id)
      clearCaches()
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting prospect:', error)
      return { success: false, error: error.response?.data?.error || 'Deletion error' }
    }
  }

  async function reorderProspectsInCategory(status, newOrder) {
    try {
      console.log('📋 Reordering prospects in category:', status, 'with order:', newOrder);
      
      // Réorganiser localement d'abord pour une réactivité immédiate
      const prospectsInCategory = prospects.value.filter(p => p.status === status)
      const otherProspects = prospects.value.filter(p => p.status !== status)
      
      // Créer le nouvel ordre local
      const reorderedProspects = newOrder.map(id => 
        prospectsInCategory.find(p => p.id === id)
      ).filter(Boolean)
      
      // Mettre à jour l'ordre local
      prospects.value = [...otherProspects, ...reorderedProspects]
      clearCaches()
      
      const response = await api.put('/prospects/reorder-category', { status, order: newOrder })
      
      console.log('✅ Prospects reordered successfully in category');
      return { success: true }
    } catch (error) {
      console.error('❌ Error reordering prospects in category:', error);
      console.error('Response data:', error.response?.data);
      // En cas d'erreur, recharger pour restaurer l'ordre correct
      await fetchProspects(true)
      return { success: false, error: error.response?.data?.error || 'Reordering error' }
    }
  }

  async function reorderProspects(newOrder) {
    try {
      console.log('📋 Reordering prospects:', newOrder);
      
      // Réorganiser localement d'abord
      const reorderedProspects = newOrder.map(id => 
        prospects.value.find(p => p.id === id)
      ).filter(Boolean)
      
      prospects.value = reorderedProspects
      clearCaches()
      
      const response = await api.put('/prospects/reorder', { order: newOrder })
      
      console.log('✅ Prospects reordered successfully');
      return { success: true }
    } catch (error) {
      console.error('❌ Error reordering prospects:', error);
      console.error('Response data:', error.response?.data);
      // En cas d'erreur, recharger pour restaurer l'ordre correct
      await fetchProspects(true)
      return { success: false, error: error.response?.data?.error || 'Reordering error' }
    }
  }

  return {
    prospects,
    loading,
    prospectsWithWeightedRevenue,
    getWeightedRevenue,
    fetchProspects,
    createProspect,
    updateProspect,
    updateProspectLocal,
    deleteProspect,
    reorderProspects,
    reorderProspectsInCategory,
    assignProspectToTab,
    getProspectsByTab,
    clearCaches,
    addToUpdateQueue,
    processUpdateQueue
  }
})
