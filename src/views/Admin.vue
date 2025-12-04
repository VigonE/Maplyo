<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>⚙️ Administration</h1>
      <p class="welcome">Welcome, {{ authStore.user?.name }} ({{ roleLabel }})</p>
    </div>

    <div class="admin-container">
      <!-- Navigation tabs -->
      <div class="admin-nav">
        <button 
          v-for="tab in availableTabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="{ active: activeTab === tab.id }"
          class="nav-button"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Content area -->
      <div class="admin-content">
        <!-- Users Management (Super User only) -->
        <div v-if="activeTab === 'users' && authStore.isSuperUser" class="tab-content">
          <UsersManagement />
        </div>

        <!-- Settings (All admins) -->
        <div v-else-if="activeTab === 'settings'" class="tab-content">
          <div class="settings-section">
            <h2>⚙️ System Settings</h2>
            <p>System configuration options will appear here.</p>
          </div>
        </div>

        <!-- Statistics (All admins) -->
        <div v-else-if="activeTab === 'stats'" class="tab-content">
          <div class="stats-section">
            <h2>📊 Statistics</h2>
            <p>System statistics and analytics will appear here.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Dashboard button -->
    <div class="back-button-container">
      <button @click="goToDashboard" class="btn-back">
        ← Back to Dashboard
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UsersManagement from '@/components/UsersManagement.vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('users')

const roleLabel = computed(() => {
  const labels = {
    super_user: 'Super User',
    admin: 'Admin',
    user: 'User'
  }
  return labels[authStore.userRole] || 'User'
})

const availableTabs = computed(() => {
  const tabs = []
  
  if (authStore.isSuperUser) {
    tabs.push({ id: 'users', label: 'Users', icon: '👥' })
  }
  
  if (authStore.isAdmin) {
    tabs.push(
      { id: 'settings', label: 'Settings', icon: '⚙️' },
      { id: 'stats', label: 'Statistics', icon: '📊' }
    )
  }
  
  return tabs
})

const goToDashboard = () => {
  router.push('/')
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 2rem;
}

.admin-header {
  max-width: 1400px;
  margin: 0 auto 2rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.welcome {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.admin-nav {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.nav-button {
  flex: 1;
  padding: 1.2rem 2rem;
  border: none;
  background: transparent;
  color: #7f8c8d;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.nav-button:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.nav-button.active {
  color: #3498db;
  background: white;
  border-bottom-color: #3498db;
}

.admin-content {
  padding: 2rem;
  min-height: 500px;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-section,
.stats-section {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}

.settings-section h2,
.stats-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.back-button-container {
  max-width: 1400px;
  margin: 2rem auto 0;
}

.btn-back {
  padding: 0.8rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-back:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 1rem;
  }

  .admin-nav {
    flex-direction: column;
  }

  .nav-button {
    text-align: left;
    border-bottom: 1px solid #e9ecef;
  }

  .nav-button.active {
    border-bottom: 1px solid #e9ecef;
    border-left: 3px solid #3498db;
  }

  .admin-content {
    padding: 1rem;
  }
}
</style>
