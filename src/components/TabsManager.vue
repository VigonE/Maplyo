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
            v-if="tabs.length > 1"
            @click.stop="removeTab(tab.id)"
            class="ml-2 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
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
        :key="activeTabId"
        :tab-id="activeTabId"
        :tab-name="activeTab?.name || ''"
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
import { ref, computed, onMounted, defineExpose } from 'vue'
import ProspectsList from './ProspectsList.vue'

export default {
  name: 'TabsManager',
  components: {
    ProspectsList
  },
  emits: ['add-prospect', 'edit-prospect', 'delete-prospect', 'select-prospect', 'reorder-prospects', 'tab-changed', 'filtered-prospects'],
  setup(props, { emit }) {
    const tabs = ref([])
    const activeTabId = ref(null)
    const showAddTabModal = ref(false)
    const newTabName = ref('')
    const newTabDescription = ref('')

    // Computed pour l'onglet actif
    const activeTab = computed(() => {
      return tabs.value.find(tab => tab.id === activeTabId.value)
    })

    // Charger les onglets depuis le localStorage
    const loadTabs = () => {
      const savedTabs = localStorage.getItem('maplyo_tabs')
      if (savedTabs) {
        tabs.value = JSON.parse(savedTabs)
        const savedActiveTab = localStorage.getItem('maplyo_active_tab')
        if (savedActiveTab && tabs.value.find(t => t.id === savedActiveTab)) {
          activeTabId.value = savedActiveTab
        } else if (tabs.value.length > 0) {
          activeTabId.value = tabs.value[0].id
        }
      } else {
        // Créer un onglet par défaut
        const defaultTab = {
          id: 'default',
          name: 'All prospects',
          description: 'Liste principale des prospects',
          createdAt: new Date().toISOString()
        }
        tabs.value = [defaultTab]
        activeTabId.value = defaultTab.id
        saveTabs()
      }
    }

    // Sauvegarder les onglets
    const saveTabs = () => {
      localStorage.setItem('maplyo_tabs', JSON.stringify(tabs.value))
      localStorage.setItem('maplyo_active_tab', activeTabId.value)
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('tabsChanged'))
    }

    // Sélectionner un onglet
    const selectTab = (tabId) => {
      activeTabId.value = tabId
      localStorage.setItem('maplyo_active_tab', tabId)
      emit('tab-changed', tabId)
    }

    // Ajouter un nouvel onglet
    const addTab = () => {
      if (!newTabName.value.trim()) return

      const newTab = {
        id: 'tab_' + Date.now(),
        name: newTabName.value.trim(),
        description: newTabDescription.value.trim(),
        createdAt: new Date().toISOString()
      }

      tabs.value.push(newTab)
      activeTabId.value = newTab.id
      saveTabs()
      emit('tab-changed', newTab.id)

      // Reset modal
      newTabName.value = ''
      newTabDescription.value = ''
      showAddTabModal.value = false
    }

    // Supprimer un onglet
    const removeTab = (tabId) => {
      if (tabs.value.length <= 1) {
        alert('Vous ne pouvez pas supprimer le dernier onglet')
        return
      }

      if (confirm('Êtes-vous sûr de vouloir supprimer cet onglet ? Les prospects de cette liste ne seront pas supprimés.')) {
        tabs.value = tabs.value.filter(tab => tab.id !== tabId)
        
        // Si l'onglet supprimé était actif, sélectionner le premier onglet
        if (activeTabId.value === tabId) {
          activeTabId.value = tabs.value[0]?.id
        }
        
        saveTabs()
      }
    }

    onMounted(() => {
      loadTabs()
      // Émettre l'onglet actif initial
      if (activeTabId.value) {
        emit('tab-changed', activeTabId.value)
      }
    })

    // Exposer les méthodes pour l'accès depuis le parent
    defineExpose({
      switchToTab: selectTab,
      get activeTabId() { return activeTabId.value }
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
      removeTab
    }
  }
}
</script>
