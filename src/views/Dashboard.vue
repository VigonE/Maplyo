<template>
  <div class="h-screen flex">
    <!-- Sidebar avec onglets -->
    <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-blue-600">Maplyo CRM</h1>
          <button
            @click="authStore.logout"
            class="text-gray-500 hover:text-gray-700"
            title="Déconnexion"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Gestionnaire d'onglets avec listes -->
      <div class="flex-1 overflow-hidden">
        <TabsManager
          ref="tabsManager"
          @add-prospect="showAddModal = true"
          @edit-prospect="editProspect"
          @delete-prospect="deleteProspect"
          @select-prospect="selectProspect"
          @reorder-prospects="reorderProspects"
          @tab-changed="onTabChanged"
        />
      </div>
    </div>

    <!-- Map -->
    <div class="flex-1">
      <MapView
        :prospects="visibleProspects"
        :selected-prospect="selectedProspect"
        @select-prospect="selectProspect"
      />
    </div>

    <!-- Add/Edit Modal -->
    <ProspectModal
      :show="showAddModal || showEditModal"
      :prospect="editingProspect"
      :current-tab-id="currentTabId"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProspectsStore } from '@/stores/prospects'
import TabsManager from '@/components/TabsManager.vue'
import MapView from '@/components/MapView.vue'
import ProspectModal from '@/components/ProspectModal.vue'

const authStore = useAuthStore()
const prospectsStore = useProspectsStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingProspect = ref(null)
const selectedProspect = ref(null)
const tabsManager = ref(null)
const currentTabId = ref('default')

// Prospects visibles selon l'onglet actuel
const visibleProspects = computed(() => {
  if (currentTabId.value === 'default') {
    return prospectsStore.prospects
  } else {
    return prospectsStore.prospects.filter(p => p.tabId === currentTabId.value)
  }
})

// Surveiller les changements d'onglet actif
watch(() => tabsManager.value?.activeTabId, (newTabId) => {
  if (newTabId) {
    currentTabId.value = newTabId
  }
})

function onTabChanged(tabId) {
  currentTabId.value = tabId
  console.log('Onglet changé vers:', tabId) // Debug
}

onMounted(async () => {
  await prospectsStore.fetchProspects()
  
  // Écouter les événements des onglets
  if (tabsManager.value) {
    currentTabId.value = tabsManager.value.activeTabId || 'default'
  }
})

function selectProspect(prospect) {
  selectedProspect.value = prospect
}

function editProspect(prospect) {
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

async function deleteProspect(prospect) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
    await prospectsStore.deleteProspect(prospect.id)
  }
}

async function reorderProspects(newOrder) {
  await prospectsStore.reorderProspects(newOrder)
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingProspect.value = null
  
  // Recharger les prospects pour mettre à jour l'affichage
  prospectsStore.fetchProspects()
}
</script>
