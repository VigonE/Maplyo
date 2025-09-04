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

  async function reorderProspects(newOrder) {
    try {
      await api.put('/prospects/reorder', { order: newOrder })
      // Update local order
      prospects.value.sort((a, b) => {
        return newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Reordering error' }
    }
  }

  return {
    prospects,
    loading,
    fetchProspects,
    createProspect,
    updateProspect,
    deleteProspect,
    reorderProspects
  }
})
