<template>
  <div class="h-screen flex">
    <!-- Sidebar -->
    <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-primary-600">          Maplyo CRM</h1>
          <button
            @click="authStore.logout"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Add Prospect Button -->
      <div class="p-4 border-b border-gray-200">
        <button
          @click="showAddModal = true"
          class="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Prospect
        </button>
      </div>

      <!-- Prospects List -->
      <div class="flex-1 overflow-y-auto">
        <ProspectsList
          :prospects="prospectsStore.prospects"
          :loading="prospectsStore.loading"
          @edit="editProspect"
          @delete="deleteProspect"
          @reorder="reorderProspects"
          @select="selectProspect"
        />
      </div>
    </div>

    <!-- Map -->
    <div class="flex-1">
      <MapView
        :prospects="prospectsStore.prospects"
        :selected-prospect="selectedProspect"
        @select-prospect="selectProspect"
      />
    </div>

    <!-- Add/Edit Modal -->
    <ProspectModal
      :show="showAddModal || showEditModal"
      :prospect="editingProspect"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProspectsStore } from '@/stores/prospects'
import ProspectsList from '@/components/ProspectsList.vue'
import MapView from '@/components/MapView.vue'
import ProspectModal from '@/components/ProspectModal.vue'

const authStore = useAuthStore()
const prospectsStore = useProspectsStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingProspect = ref(null)
const selectedProspect = ref(null)

onMounted(() => {
  prospectsStore.fetchProspects()
})

function editProspect(prospect) {
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

async function deleteProspect(prospect) {
  if (confirm('Are you sure you want to delete this prospect?')) {
    await prospectsStore.deleteProspect(prospect.id)
  }
}

async function reorderProspects(newOrder) {
  await prospectsStore.reorderProspects(newOrder)
}

function selectProspect(prospect) {
  selectedProspect.value = prospect
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingProspect.value = null
}
</script>
