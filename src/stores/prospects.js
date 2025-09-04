import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useProspectsStore = defineStore('prospects', () => {
  const prospects = ref([])
  const loading = ref(false)

  async function fetchProspects() {
    loading.value = true
    try {
      const response = await api.get('/prospects')
      prospects.value = response.data
    } catch (error) {
      console.error('Error loading prospects:', error)
    } finally {
      loading.value = false
    }
  }

  async function createProspect(prospectData) {
    try {
      const response = await api.post('/prospects', prospectData)
      prospects.value.push(response.data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error creating prospect:', error)
      return { success: false, error: error.response?.data?.error || 'Creation error' }
    }
  }

  async function updateProspect(id, prospectData) {
    try {
      const response = await api.put(`/prospects/${id}`, prospectData)
      const index = prospects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        prospects.value[index] = response.data
      }
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error updating prospect:', error)
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
      prospects.value = prospects.value.filter(p => p.id !== id)
      return { success: true }
    } catch (error) {
      console.error('Error deleting prospect:', error)
      return { success: false, error: error.response?.data?.error || 'Deletion error' }
    }
  }

  async function reorderProspectsInCategory(status, newOrder) {
    try {
      console.log('📋 Reordering prospects in category:', status, 'with order:', newOrder);
      const response = await api.put('/prospects/reorder-category', { status, order: newOrder })
      
      console.log('✅ Prospects reordered successfully in category');
      return { success: true }
    } catch (error) {
      console.error('❌ Error reordering prospects in category:', error);
      console.error('Response data:', error.response?.data);
      return { success: false, error: error.response?.data?.error || 'Reordering error' }
    }
  }

  async function reorderProspects(newOrder) {
    try {
      console.log('📋 Reordering prospects:', newOrder);
      const response = await api.put('/prospects/reorder', { order: newOrder })
      
      // Ne pas modifier l'ordre local ici pour éviter les conflits
      // Laisser le composant gérer l'affichage et recharger les données si nécessaire
      
      console.log('✅ Prospects reordered successfully');
      return { success: true }
    } catch (error) {
      console.error('❌ Error reordering prospects:', error);
      console.error('Response data:', error.response?.data);
      return { success: false, error: error.response?.data?.error || 'Reordering error' }
    }
  }

  return {
    prospects,
    loading,
    fetchProspects,
    createProspect,
    updateProspect,
    deleteProspect,
    reorderProspects,
    reorderProspectsInCategory,
    assignProspectToTab,
    getProspectsByTab
  }
})
