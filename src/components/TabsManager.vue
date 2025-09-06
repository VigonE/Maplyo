<template>
  <div class="h-full flex flex-col">
    <!-- Barre d'onglets -->
    <div class="flex items-center border-b border-gray-200 bg-white">
      <!-- Onglets existants -->
      <div class="flex flex-1 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectTab(tab.id)"
          :class="[
            'flex items-center px-4 py-2 text-sm font-medium border-r border-gray-200 min-w-0 flex-shrink-0',
            activeTabId === tab.id
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
          ]"
        >
          <span class="truncate max-w-24">{{ tab.name }}</span>
          <button
            v-if="tabs.length > 1 && !tab.is_special"
            @click.stop="removeTab(tab.id)"
            class="ml-2 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
            title="Delete tab"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </button>
      </div>

      <!-- Bouton ajouter onglet -->
      <button
        @click="showAddTabModal = true"
        class="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        title="Add a tab"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
      </button>
    </div>

    <!-- Contenu de l'onglet actif -->
    <div class="flex-1 overflow-hidden">
      <ProspectsList 
        :key="activeTabId || 'loading'"
        :tab-id="activeTabId || ''"
        :tab-name="activeTab?.name || ''"
        :is-all-leads-view="activeTab?.is_special && activeTab?.name === 'All Leads'"
        :all-tabs="tabs"
        @edit="$emit('edit-prospect', $event)"
        @delete="$emit('delete-prospect', $event)"
        @select="$emit('select-prospect', $event)"
        @add-prospect="$emit('add-prospect')"
        @reorder="$emit('reorder-prospects', $event)"
        @filtered-prospects="$emit('filtered-prospects', $event)"
      />
    </div>

    <!-- Modal d'ajout d'onglet -->
    <div
      v-if="showAddTabModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showAddTabModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 w-96 max-w-[90vw]"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4">Add a new tab</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tab name
          </label>
          <input
            v-model="newTabName"
            @keyup.enter="addTab"
            type="text"
            placeholder="Ex: Paris, Lyon, VIP Prospects..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxlength="30"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Description (optionnelle)
          </label>
          <input
            v-model="newTabDescription"
            type="text"
            placeholder="Description de cette liste..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxlength="100"
          />
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="showAddTabModal = false"
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            @click="addTab"
            :disabled="!newTabName.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, defineExpose, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import ProspectsList from './ProspectsList.vue'

export default {
  name: 'TabsManager',
  components: {
    ProspectsList
  },
  emits: ['add-prospect', 'edit-prospect', 'delete-prospect', 'select-prospect', 'reorder-prospects', 'tab-changed', 'filtered-prospects'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const tabs = ref([])
    const activeTabId = ref(null)
    const showAddTabModal = ref(false)
    const newTabName = ref('')
    const newTabDescription = ref('')

    // Computed pour l'onglet actif
    const activeTab = computed(() => {
      return tabs.value.find(tab => tab.id === activeTabId.value)
    })

    // Charger les onglets depuis le serveur
    const loadTabs = async () => {
      try {
        console.log('📋 Loading tabs from server...')
        console.log('🔑 Auth token:', authStore.token ? 'Present' : 'Missing')
        const response = await axios.get('/api/tabs', {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        tabs.value = response.data
        console.log('📋 Loaded tabs from server:', tabs.value.length, tabs.value)
        
        // Log détaillé des onglets
        tabs.value.forEach(tab => {
          console.log(`📋 Tab: ${tab.name} (ID: ${tab.id}, Special: ${tab.is_special})`)
        })
        
        // Sélectionner l'onglet actif
        const savedActiveTab = localStorage.getItem('maplyo_active_tab')
        console.log('💾 Saved active tab from localStorage:', savedActiveTab)
        
        if (savedActiveTab && tabs.value.find(t => t.id === savedActiveTab)) {
          activeTabId.value = savedActiveTab
          console.log('✅ Using saved active tab:', savedActiveTab)
        } else {
          // Sélectionner "All Leads" par défaut
          const allLeadsTab = tabs.value.find(t => t.is_special && t.name === 'All Leads')
          console.log('🔍 All Leads tab found:', allLeadsTab)
          activeTabId.value = allLeadsTab ? allLeadsTab.id : tabs.value[0]?.id
          console.log('🎯 Default active tab set to:', activeTabId.value)
        }
        
        console.log('📋 Final active tab:', activeTabId.value)
      } catch (error) {
        console.error('❌ Error loading tabs:', error)
        // Pas de fallback - laisser le serveur créer les onglets par défaut
      }
    }

    // Sauvegarder les onglets (plus nécessaire avec le serveur)
    const saveTabs = () => {
      // Les onglets sont maintenant gérés côté serveur
      // Garder juste l'onglet actif en localStorage pour la session
      localStorage.setItem('maplyo_active_tab', activeTabId.value)
    }

    // Sélectionner un onglet
    const selectTab = (tabId) => {
      activeTabId.value = tabId
      localStorage.setItem('maplyo_active_tab', tabId)
      emit('tab-changed', tabId)
    }

    // Ajouter un nouvel onglet
    const addTab = async () => {
      if (!newTabName.value.trim()) return

      try {
        console.log('➕ Creating new tab:', newTabName.value.trim())
        const response = await axios.post('/api/tabs', {
          name: newTabName.value.trim(),
          description: newTabDescription.value.trim()
        }, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })

        console.log('📋 New tab created:', response.data)
        
        // Ajouter le nouvel onglet à la liste
        tabs.value.push(response.data)
        activeTabId.value = response.data.id
        emit('tab-changed', response.data.id)

        // Reset modal
        newTabName.value = ''
        newTabDescription.value = ''
        showAddTabModal.value = false

        console.log('✅ Tab created successfully')
        
        // Notifier les autres composants
        window.dispatchEvent(new CustomEvent('tabsChanged'))
      } catch (error) {
        console.error('❌ Error creating tab:', error)
        alert('Error creating tab: ' + (error.response?.data?.error || error.message))
      }
    }

    // Supprimer un onglet
    const removeTab = async (tabId) => {
      console.log('🗑️ Attempting to delete tab:', tabId)
      
      // Empêcher la suppression de l'onglet "All Leads"
      const tab = tabs.value.find(t => t.id === tabId)
      console.log('🔍 Tab to delete:', tab)
      
      if (tab?.is_special) {
        alert('Cannot delete special tabs like "All Leads".')
        return
      }
      
      if (tabs.value.filter(t => !t.is_special).length <= 1) {
        alert('You cannot delete the last regular tab')
        return
      }

      if (confirm('Are you sure you want to delete this tab? The prospects in this tab will not be deleted.')) {
        try {
          console.log(`🗑️ Deleting tab ${tabId} from server...`)
          await axios.delete(`/api/tabs/${tabId}`, {
            headers: { Authorization: `Bearer ${authStore.token}` }
          })

          // Supprimer de la liste locale
          tabs.value = tabs.value.filter(tab => tab.id !== tabId)
          
          // Si l'onglet supprimé était actif, sélectionner "All Leads" ou le premier
          if (activeTabId.value === tabId) {
            const allLeadsTab = tabs.value.find(t => t.is_special && t.name === 'All Leads')
            activeTabId.value = allLeadsTab ? allLeadsTab.id : tabs.value[0]?.id
            emit('tab-changed', activeTabId.value)
          }

          console.log('✅ Tab deleted successfully')
          
          // Notifier les autres composants
          window.dispatchEvent(new CustomEvent('tabsChanged'))
        } catch (error) {
          console.error('❌ Error deleting tab:', error)
          alert('Error deleting tab: ' + (error.response?.data?.error || error.message))
        }
      }
    }

    // Fonction utilitaire pour obtenir le nom d'un onglet
    const getTabName = (tabId) => {
      const tab = tabs.value.find(t => t.id === tabId)
      return tab ? tab.name : 'Unknown Tab'
    }

    // Écouter les changements d'onglets depuis d'autres sources
    const handleTabsChanged = () => {
      console.log('📋 TabsManager: Received tabsChanged event, reloading tabs')
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

    return {
      tabs,
      activeTabId,
      activeTab,
      showAddTabModal,
      newTabName,
      newTabDescription,
      selectTab,
      addTab,
      removeTab,
      switchToTab: selectTab, // Alias pour l'accès depuis le parent
      loadTabs
    }

    return {
      tabs,
      activeTabId,
      activeTab,
      showAddTabModal,
      newTabName,
      newTabDescription,
      selectTab,
      addTab,
      removeTab,
      getTabName
    }
  }
}
</script>
