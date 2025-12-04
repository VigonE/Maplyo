<template>
  <div class="users-management">
    <div class="header">
      <h2>👥 User Management</h2>
      <p class="subtitle">Manage user roles and permissions</p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading users...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      <p>❌ {{ error }}</p>
      <button @click="loadUsers" class="btn-retry">Retry</button>
    </div>

    <!-- Users table -->
    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Company</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" :class="{ 'super-user-row': user.role === 'super_user' }">
            <td>
              <span class="user-email">{{ user.email }}</span>
            </td>
            <td>{{ user.name }}</td>
            <td>{{ user.company || '-' }}</td>
            <td>
              <select 
                v-if="canEditUser(user)"
                :value="user.role" 
                @change="changeUserRole(user, $event.target.value)"
                class="role-select"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_user">Super User</option>
              </select>
              <span v-else class="role-badge" :class="'role-' + user.role">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <button 
                v-if="canDeleteUser(user)"
                @click="confirmDeleteUser(user)"
                class="btn-delete"
                title="Delete user"
              >
                🗑️ Delete
              </button>
              <span v-else class="protected">Protected</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="userToDelete" class="modal-overlay" @click.self="userToDelete = null">
      <div class="modal">
        <h3>⚠️ Confirm Deletion</h3>
        <p>Are you sure you want to delete this user?</p>
        <div class="user-info">
          <strong>{{ userToDelete.name }}</strong><br>
          {{ userToDelete.email }}
        </div>
        <p class="warning">⚠️ This action cannot be undone. All prospects, tabs, and data belonging to this user will be permanently deleted.</p>
        <div class="modal-actions">
          <button @click="userToDelete = null" class="btn-cancel">Cancel</button>
          <button @click="deleteUser" class="btn-confirm-delete">Delete User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usersAPI } from '@/services/api'

const authStore = useAuthStore()
const users = ref([])
const loading = ref(false)
const error = ref(null)
const userToDelete = ref(null)

const loadUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await usersAPI.getAll()
    users.value = response.data
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = err.response?.data?.error || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const canEditUser = (user) => {
  // Ne peut pas modifier son propre rôle
  if (user.id === authStore.user.id) return false
  // Ne peut pas modifier le super user principal
  if (user.email === 'admin@maplyo.com') return false
  return true
}

const canDeleteUser = (user) => {
  // Ne peut pas supprimer son propre compte
  if (user.id === authStore.user.id) return false
  // Ne peut pas supprimer le super user principal
  if (user.email === 'admin@maplyo.com') return false
  return true
}

const changeUserRole = async (user, newRole) => {
  try {
    await usersAPI.updateRole(user.id, newRole)
    user.role = newRole
    console.log(`✅ Role updated for ${user.email} to ${newRole}`)
  } catch (err) {
    console.error('Error updating role:', err)
    alert(err.response?.data?.error || 'Failed to update role')
    loadUsers() // Recharger pour réinitialiser
  }
}

const confirmDeleteUser = (user) => {
  userToDelete.value = user
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  
  try {
    await usersAPI.delete(userToDelete.value.id)
    console.log(`✅ User deleted: ${userToDelete.value.email}`)
    userToDelete.value = null
    loadUsers()
  } catch (err) {
    console.error('Error deleting user:', err)
    alert(err.response?.data?.error || 'Failed to delete user')
    userToDelete.value = null
  }
}

const getRoleLabel = (role) => {
  const labels = {
    super_user: '⭐ Super User',
    admin: '👔 Admin',
    user: '👤 User'
  }
  return labels[role] || role
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-retry:hover {
  background: #2980b9;
}

.users-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.users-table tbody tr:hover {
  background: #f8f9fa;
}

.super-user-row {
  background: #fff9e6 !important;
}

.user-email {
  font-weight: 500;
  color: #2c3e50;
}

.role-select {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.role-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-super_user {
  background: #fff3cd;
  color: #856404;
}

.role-admin {
  background: #d1ecf1;
  color: #0c5460;
}

.role-user {
  background: #d4edda;
  color: #155724;
}

.btn-delete {
  padding: 0.4rem 0.8rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-delete:hover {
  background: #c0392b;
}

.protected {
  color: #95a5a6;
  font-size: 0.85rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.modal h3 {
  margin-top: 0;
  color: #e74c3c;
}

.user-info {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.warning {
  color: #e67e22;
  font-size: 0.9rem;
  margin: 1rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.6rem 1.2rem;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-confirm-delete {
  padding: 0.6rem 1.2rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm-delete:hover {
  background: #c0392b;
}
</style>
