<template>
  <div class="user-management">
    <div class="header mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h2>
      <p class="text-sm text-gray-600 mt-2">Gérez les rôles et permissions des utilisateurs</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      <p class="mt-2 text-gray-600">Chargement des utilisateurs...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700">{{ error }}</p>
      <button @click="loadUsers" class="mt-2 text-red-600 hover:text-red-800 underline">
        Réessayer
      </button>
    </div>

    <!-- Users list -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilisateur
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entreprise
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rôle
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inscrit le
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">{{ user.company || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                v-model="user.role"
                @change="updateUserRole(user)"
                :disabled="user.email === 'admin@maplyo.com' || updatingUserId === user.id"
                class="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                :class="{
                  'bg-gray-100 cursor-not-allowed': user.email === 'admin@maplyo.com',
                  'opacity-50': updatingUserId === user.id
                }"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
                <option value="super_user">Super User</option>
              </select>
              <span v-if="user.email === 'admin@maplyo.com'" class="ml-2 text-xs text-gray-500">
                (protégé)
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                v-if="user.email !== 'admin@maplyo.com'"
                @click="confirmDeleteUser(user)"
                :disabled="deletingUserId === user.id"
                class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="deletingUserId === user.id">Suppression...</span>
                <span v-else>Supprimer</span>
              </button>
              <span v-else class="text-gray-400">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="text-center py-8 text-gray-500">
        Aucun utilisateur trouvé
      </div>
    </div>

    <!-- Role badges legend -->
    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-blue-900 mb-2">Niveaux de rôles</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li><strong>Super User :</strong> Accès complet, peut gérer tous les utilisateurs et leurs rôles</li>
        <li><strong>Admin :</strong> Accès étendu (fonctionnalités futures)</li>
        <li><strong>Utilisateur :</strong> Accès standard à ses propres données</li>
      </ul>
    </div>

    <!-- Confirmation modal -->
    <div v-if="userToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
        <p class="text-gray-600 mb-4">
          Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete.name }}</strong> ({{ userToDelete.email }}) ?
        </p>
        <p class="text-sm text-red-600 mb-4">
          Cette action est irréversible et supprimera toutes les données associées.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="userToDelete = null"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            @click="deleteUser"
            class="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usersAPI } from '@/services/api'

const users = ref([])
const loading = ref(true)
const error = ref(null)
const updatingUserId = ref(null)
const deletingUserId = ref(null)
const userToDelete = ref(null)

onMounted(() => {
  loadUsers()
})

async function loadUsers() {
  loading.value = true
  error.value = null
  
  try {
    const response = await usersAPI.getAll()
    users.value = response.data
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = err.response?.data?.error || 'Erreur lors du chargement des utilisateurs'
  } finally {
    loading.value = false
  }
}

async function updateUserRole(user) {
  updatingUserId.value = user.id
  
  try {
    await usersAPI.updateRole(user.id, user.role)
    console.log(`✅ Role updated for user ${user.id} to ${user.role}`)
  } catch (err) {
    console.error('Error updating user role:', err)
    error.value = err.response?.data?.error || 'Erreur lors de la mise à jour du rôle'
    // Reload users to reset the role value
    await loadUsers()
  } finally {
    updatingUserId.value = null
  }
}

function confirmDeleteUser(user) {
  userToDelete.value = user
}

async function deleteUser() {
  if (!userToDelete.value) return
  
  deletingUserId.value = userToDelete.value.id
  const userId = userToDelete.value.id
  
  try {
    await usersAPI.delete(userId)
    console.log(`✅ User ${userId} deleted`)
    userToDelete.value = null
    // Remove user from list
    users.value = users.value.filter(u => u.id !== userId)
  } catch (err) {
    console.error('Error deleting user:', err)
    error.value = err.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur'
    userToDelete.value = null
  } finally {
    deletingUserId.value = null
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.user-management {
  max-width: 1200px;
}
</style>
