<template>
  <div class="h-full flex flex-col">
    <!-- Barre d'onglets -->
    <div class="flex items-center border-b border-gray-200 bg-white">
      <!-- Onglets existants -->
      <div class="flex flex-1 overflow-x-auto">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'flex items-center px-2 py-2 text-sm font-medium border-r border-gray-200 min-w-0 flex-shrink-0 group',
            activeTabId === tab.id
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
          ]"
        >
          <!-- Tab name (editable or clickable) -->
          <div class="flex items-center flex-1 min-w-0">
            <div
              v-if="!editingTab[tab.id]"
              @click="selectTab(tab.id)"
              @dblclick="startEditTab(tab)"
              class="truncate max-w-24 cursor-pointer flex-1"
              :title="tab.is_special && tab.name === 'All Leads' ? 'Double-click to select, cannot rename special tab' : 'Double-click to rename'"
            >
              {{ tab.name }}
            </div>
            
            <!-- Edit mode -->
            <input
              v-else
              v-model="editingTabName[tab.id]"
              @blur="saveTabName(tab)"
              @keyup.enter="saveTabName(tab)"
              @keyup.escape="cancelEditTab(tab.id)"
              :ref="el => editTabInputs[tab.id] = el"
              class="bg-transparent border-none outline-none text-sm w-full max-w-24"
              :class="activeTabId === tab.id ? 'text-blue-600' : 'text-gray-900'"
              maxlength="30"
            />
          </div>

          <!-- Action buttons -->
          <div v-if="!isReadOnly" class="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Edit button (except for All Leads special tab) -->
            <button
              v-if="!editingTab[tab.id] && !(tab.is_special && tab.name === 'All Leads')"
              @click.stop="startEditTab(tab)"
              class="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 mr-1"
              title="Rename tab"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            
            <!-- Delete button (only for non-special tabs) -->
            <button
              v-if="!tab.is_special && !editingTab[tab.id]"
              @click.stop="removeTab(tab.id)"
              class="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
              title="Delete tab"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Bouton d'ajout d'onglet -->
      <button
        v-if="!isReadOnly"
        @click="showAddTabModal = true"
        class="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-l border-gray-200"
        title="Add new tab"
      >
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Tab
      </button>
    </div>

    <!-- Contenu de l'onglet actif -->
    <div class="flex-1 min-h-0 overflow-auto">
      <ProspectsList
        v-if="activeTab"
        :key="activeTabId"
        :tab-id="activeTabId"
        :tab-name="activeTab.name"
        :is-special-tab="activeTab.is_special"
        :is-all-leads-view="activeTab.name === 'All Leads'"
        :all-tabs="tabs"
        :lead-times="leadTimes"
        :is-read-only="isReadOnly"
        @add-prospect="$emit('add-prospect', $event)"
        @edit="$emit('edit-prospect', $event)"
        @delete="$emit('delete-prospect', $event)"
        @select="$emit('select-prospect', $event)"
        @prospect-selected="$emit('select-prospect', $event)"
        @reorder="$emit('reorder-prospects', $event)"
        @filtered-prospects="$emit('filtered-prospects', $event)"
        @navigate-to-tab="onNavigateToTab"
        @open-company="$emit('open-company', $event)"
      />
    </div>

    <!-- Modal d'ajout d'onglet -->
    <div
      v-if="showAddTabModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Arrière-plan -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="showAddTabModal = false"></div>

        <!-- Contenu du modal -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <div class="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Create New Tab
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label for="tab-name" class="block text-sm font-medium text-gray-700">
                        Tab Name
                      </label>
                      <input
                        id="tab-name"
                        v-model="newTabName"
                        type="text"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter tab name..."
                        maxlength="30"
                        @keyup.enter="addTab"
                      />
                    </div>
                    <div>
                      <label for="tab-description" class="block text-sm font-medium text-gray-700">
                        Description (optional)
                      </label>
                      <textarea
                        id="tab-description"
                        v-model="newTabDescription"
                        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        rows="3"
                        placeholder="Enter tab description..."
                        maxlength="200"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="addTab"
              :disabled="!newTabName.trim()"
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Tab
            </button>
            <button
              @click="showAddTabModal = false"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, defineExpose } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import ProspectsList from './ProspectsList.vue'

export default {
  name: 'TabsManager',
  components: {
    ProspectsList
  },
  props: {
    leadTimes: {
      type: Object,
      default: () => ({
        cold: { time: 12, probability: 15 },
        warm: { time: 6, probability: 45 },
        hot: { time: 3, probability: 80 }
      })
    },
    isReadOnly: {
      type: Boolean,
      default: false
    }
  },
  emits: ['add-prospect', 'edit-prospect', 'delete-prospect', 'select-prospect', 'reorder-prospects', 'tab-changed', 'filtered-prospects'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const tabs = ref([])
    const activeTabId = ref(null)
    const showAddTabModal = ref(false)
    const newTabName = ref('')
    const newTabDescription = ref('')
    
    // Variables pour l'édition des onglets
    const editingTab = ref({}) // { tabId: true/false }
    const editingTabName = ref({}) // { tabId: 'new name' }
    const editTabInputs = ref({}) // { tabId: inputElement }

    // Computed pour l'onglet actif
    const activeTab = computed(() => {
      return tabs.value.find(tab => tab.id === activeTabId.value)
    })

    // Charger les onglets depuis le serveur
    const loadTabs = async () => {
      try {
        console.log('📋 Loading tabs from server...')
        console.log('🔑 Auth token:', authStore.token ? 'Present' : 'Missing')
        const response = await api.get('/tabs')
        tabs.value = response.data
        console.log('📋 Loaded tabs from server:', tabs.value.length, tabs.value)
        
        // Restaurer l'onglet actif depuis localStorage ou sélectionner par défaut
        const savedActiveTabId = localStorage.getItem('maplyo_active_tab_id')
        let targetTab = null
        
        // Vérifier si l'onglet sauvegardé existe encore
        if (savedActiveTabId && tabs.value.length > 0) {
          targetTab = tabs.value.find(tab => tab.id === savedActiveTabId)
          console.log('🔄 Trying to restore saved tab:', savedActiveTabId, targetTab ? 'found' : 'not found')
        }
        
        // Si pas d'onglet sauvegardé valide, prendre le premier onglet disponible
        if (!targetTab && tabs.value.length > 0) {
          targetTab = tabs.value.find(tab => tab.is_special && tab.name === 'All Leads') || tabs.value[0]
          console.log('📌 Using default tab:', targetTab.name)
        }
        
        // Sélectionner l'onglet trouvé
        if (targetTab && !activeTabId.value) {
          activeTabId.value = targetTab.id
          console.log('📌 Selected tab:', targetTab.name, 'ID:', targetTab.id)
          emit('tab-changed', activeTabId.value)
        }
      } catch (error) {
        console.error('❌ Error loading tabs:', error)
        console.error('❌ Response:', error.response?.data)
        console.error('❌ Status:', error.response?.status)
      }
    }

    // Sélectionner un onglet
    const selectTab = (tabId) => {
      console.log('📌 Selecting tab:', tabId)
      activeTabId.value = tabId
      
      // Sauvegarder l'onglet actif dans localStorage
      localStorage.setItem('maplyo_active_tab_id', tabId)
      
      emit('tab-changed', tabId)
    }

    // Ajouter un nouvel onglet
    const addTab = async () => {
      if (!newTabName.value.trim()) return

      try {
        const response = await axios.post('/api/tabs', {
          name: newTabName.value.trim(),
          description: newTabDescription.value.trim()
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        // Recharger tous les onglets
        await loadTabs()
        
        // Sélectionner le nouvel onglet
        activeTabId.value = response.data.id
        
        // Sauvegarder l'onglet actif dans localStorage
        localStorage.setItem('maplyo_active_tab_id', response.data.id)
        
        emit('tab-changed', activeTabId.value)
        
        // Fermer le modal et réinitialiser
        showAddTabModal.value = false
        newTabName.value = ''
        newTabDescription.value = ''
        
        console.log('✅ Tab created successfully:', response.data.name)
      } catch (error) {
        console.error('❌ Error creating tab:', error)
        alert('Error creating tab: ' + (error.response?.data?.error || error.message))
      }
    }

    // Supprimer un onglet
    const removeTab = async (tabId) => {
      const tab = tabs.value.find(t => t.id === tabId)
      if (!tab) return

      if (tab.is_special) {
        alert('Cannot delete special tabs')
        return
      }

      if (!confirm(`Are you sure you want to delete the tab "${tab.name}"?`)) {
        return
      }

      try {
        await axios.delete(`/api/tabs/${tabId}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        // Si l'onglet supprimé était actif, sélectionner le premier onglet
        if (activeTabId.value === tabId) {
          const remainingTabs = tabs.value.filter(t => t.id !== tabId)
          if (remainingTabs.length > 0) {
            const firstTab = remainingTabs.find(tab => tab.is_special && tab.name === 'All Leads') || remainingTabs[0]
            activeTabId.value = firstTab.id
            
            // Sauvegarder l'onglet actif dans localStorage
            localStorage.setItem('maplyo_active_tab_id', firstTab.id)
            
            emit('tab-changed', activeTabId.value)
          }
        }
        
        // Recharger les onglets
        await loadTabs()
        
        console.log('✅ Tab deleted successfully:', tab.name)
      } catch (error) {
        console.error('❌ Error deleting tab:', error)
        alert('Error deleting tab: ' + (error.response?.data?.error || error.message))
      }
    }

    // Démarrer l'édition d'un onglet
    const startEditTab = (tab) => {
      if (tab.is_special && tab.name === 'All Leads') {
        // Pour "All Leads", ne pas permettre l'édition, juste sélectionner
        selectTab(tab.id)
        return
      }
      
      editingTab.value[tab.id] = true
      editingTabName.value[tab.id] = tab.name
      
      // Focus sur l'input au prochain tick
      nextTick(() => {
        const input = editTabInputs.value[tab.id]
        if (input) {
          input.focus()
          input.select()
        }
      })
    }

    // Annuler l'édition d'un onglet
    const cancelEditTab = (tabId) => {
      editingTab.value[tabId] = false
      delete editingTabName.value[tabId]
    }

    // Sauvegarder le nom d'un onglet
    const saveTabName = async (tab) => {
      const newName = editingTabName.value[tab.id]?.trim()
      
      if (!newName || newName === tab.name) {
        cancelEditTab(tab.id)
        return
      }

      try {
        await axios.put(`/api/tabs/${tab.id}`, {
          name: newName,
          description: tab.description || ''
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        // Recharger les onglets
        await loadTabs()
        
        // Arrêter l'édition
        cancelEditTab(tab.id)
        
        console.log('✅ Tab renamed successfully:', tab.name, '→', newName)
      } catch (error) {
        console.error('❌ Error renaming tab:', error)
        alert('Error renaming tab: ' + (error.response?.data?.error || error.message))
        cancelEditTab(tab.id)
      }
    }

    // Obtenir le nom d'un onglet (pour l'affichage)
    const getTabName = (tabId) => {
      const tab = tabs.value.find(t => t.id === tabId)
      return tab ? tab.name : 'Unknown Tab'
    }

    // Écouter les changements d'onglets depuis d'autres composants
    const handleTabsChanged = () => {
      console.log('📋 Tabs changed event received, reloading...')
      loadTabs()
    }

    onMounted(async () => {
      await loadTabs()
      // Émettre l'onglet actif initial
      if (activeTabId.value) {
        emit('tab-changed', activeTabId.value)
      }

      // Écouter les événements de changement
      window.addEventListener('tabsChanged', handleTabsChanged)
    })

    // Nettoyer les listeners
    onUnmounted(() => {
      window.removeEventListener('tabsChanged', handleTabsChanged)
    })

    // Exposer les méthodes pour l'accès depuis le parent
    defineExpose({
      switchToTab: selectTab,
      selectTab: selectTab, // Alias pour compatibilité
      get activeTabId() { return activeTabId.value },
      get tabs() { return tabs.value },
      loadTabs
    })

    // Fonction pour naviguer vers un onglet spécifique
    const onNavigateToTab = (tabId, prospectId) => {
      console.log('🎯 TabsManager: Navigate to tab:', tabId, 'for prospect:', prospectId)
      selectTab(tabId)
    }

    return {
      tabs,
      activeTab,
      activeTabId,
      showAddTabModal,
      newTabName,
      newTabDescription,
      editingTab,
      editingTabName,
      editTabInputs,
      selectTab,
      addTab,
      removeTab,
      startEditTab,
      cancelEditTab,
      saveTabName,
      getTabName,
      onNavigateToTab
    }
  }
}
</script>

<style scoped>
/* Styles pour les transitions et animations */
.group:hover .opacity-0 {
  opacity: 1;
}

input:focus {
  outline: none;
  box-shadow: none;
}
</style>
