import { defineStore } from 'pinia'
import { ref, computed, shallowRef } from 'vue'
import api from '@/services/api'
import { prospectsAPI } from '@/services/api'
import { useDemoStore } from '@/stores/demo'

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
  const getWeightedRevenue = (prospect, categoryProbabilities = null) => {
    const cacheKey = `${prospect.id}-${prospect.revenue}-${prospect.probability_coefficient}-${JSON.stringify(categoryProbabilities)}`
    
    if (weightedRevenueCache.has(cacheKey)) {
      return weightedRevenueCache.get(cacheKey)
    }
    
    if (!prospect.revenue) {
      weightedRevenueCache.set(cacheKey, 0)
      return 0
    }
    
    let probability = 100 // Valeur par défaut
    
    // Si le prospect a une probabilité individuelle, l'utiliser
    if (prospect.probability_coefficient !== undefined) {
      probability = prospect.probability_coefficient
    }
    // Sinon, utiliser la probabilité de catégorie si fournie
    else if (categoryProbabilities && prospect.status) {
      switch (prospect.status) {
        case 'cold':
          probability = categoryProbabilities.coldProbability !== undefined ? categoryProbabilities.coldProbability : 100
          break
        case 'warm':
          probability = categoryProbabilities.warmProbability !== undefined ? categoryProbabilities.warmProbability : 100
          break
        case 'hot':
          probability = categoryProbabilities.hotProbability !== undefined ? categoryProbabilities.hotProbability : 100
          break
        case 'recurring':
          probability = categoryProbabilities.recurringProbability !== undefined ? categoryProbabilities.recurringProbability : 100
          break
        default:
          probability = 100
      }
    }
    
    const result = (prospect.revenue * probability) / 100
    
    weightedRevenueCache.set(cacheKey, result)
    
    // Limiter la taille du cache
    if (weightedRevenueCache.size > 1000) {
      const firstKey = weightedRevenueCache.keys().next().value
      weightedRevenueCache.delete(firstKey)
    }
    
    return result
  }

  // Computed to get prospects with weighted revenues (with cache)
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

  // Function to update a prospect locally without reload
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
      // Reload on error to ensure consistency
      await fetchProspects()
    } finally {
      isProcessingUpdates.value = false
    }
  }

  async function fetchProspects(force = false) {
    // Vérifier si on est en mode démo
    const demoStore = useDemoStore()
    if (demoStore.isDemoMode) {
      // En mode démo, charger les prospects depuis le store démo
      prospects.value = demoStore.getDemoProspects()
      clearCaches()
      return
    }
    
    // Éviter les requêtes multiples simultanées
    if (loading.value && !force) return
    
    // Simple cache: avoid reloading too often
    const now = Date.now()
    if (!force && (now - lastFetchTime.value) < 1000) { // Minimum 1s entre les requêtes
      return
    }
    
    loading.value = true
    try {
      const response = await prospectsAPI.getAll()
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
      const response = await prospectsAPI.create(prospectData)
      
      // En mode démo, l'intercepteur a déjà ajouté le prospect au demoStore
      // Il suffit de recharger depuis le demoStore
      const demoStore = useDemoStore()
      if (demoStore.isDemoMode) {
        prospects.value = demoStore.getDemoProspects()
      } else {
        // En mode normal, ajouter le prospect localement
        prospects.value = [...prospects.value, response.data]
      }
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
      
      // S'assurer que tous les champs sont inclus, même s'ils sont null
      const completeData = {
        ...prospectData
      }
      
      // Pour les prospects récurrents, s'assurer que les champs récurrents sont inclus
      if (prospectData.status === 'recurring') {
        if (completeData.recurrence_months === undefined) {
          completeData.recurrence_months = 12 // Valeur par défaut
        }
      }
      
      console.log('📤 Sending prospect update to server:')
      console.log('   - Prospect ID:', id)
      console.log('   - Data being sent:', completeData)
      console.log('   - Recurrence fields:', {
        recurrence_months: completeData.recurrence_months,
        next_followup_date: completeData.next_followup_date
      })
      
      const response = await prospectsAPI.update(id, completeData)
      
      console.log('✅ Server response:', response.data)
      console.log('   - Returned recurrence fields:', {
        recurrence_months: response.data.recurrence_months,
        next_followup_date: response.data.next_followup_date
      })
      
      // Mettre à jour avec les données du serveur
      // En mode démo, recharger depuis le demoStore
      const demoStore = useDemoStore()
      if (demoStore.isDemoMode) {
        prospects.value = demoStore.getDemoProspects()
      } else {
        updateProspectLocal(id, response.data)
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      console.error('❌ Error updating prospect:', error)
      console.error('Response data:', error.response?.data)
      // On error, reload to ensure consistency
      await fetchProspects(true)
      return { success: false, error: error.response?.data?.error || 'Update error' }
    }
  }

  // Assign a prospect to a tab
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

  // Get prospects from a specific tab
  function getProspectsByTab(tabId) {
    if (tabId === 'default') {
      return prospects.value
    }
    return prospects.value.filter(p => p.tabId === tabId)
  }

  async function deleteProspect(id) {
    try {
      await prospectsAPI.delete(id)
      
      // En mode démo, recharger depuis le demoStore
      const demoStore = useDemoStore()
      if (demoStore.isDemoMode) {
        prospects.value = demoStore.getDemoProspects()
      } else {
        // Delete locally instead of reloading
        prospects.value = prospects.value.filter(p => p.id !== id)
      }
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
      // On error, reload to restore correct order
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
