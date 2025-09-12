<template>
  <div class="h-screen flex">
    <!-- Sidebar avec onglets -->
    <div 
      class="bg-white border-r border-gray-200 flex flex-col flex-shrink-0"
      :style="`width: ${sidebarWidth}px`"
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-blue-600">Maplyo CRM</h1>
          <div class="flex items-center gap-2">
            <!-- Bouton engrenage avec menu déroulant -->
            <div class="relative">
              <button
                @click="showSettingsMenu = !showSettingsMenu"
                class="text-gray-500 hover:text-gray-700 p-1 rounded"
                title="Settings"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <!-- Menu déroulant -->
              <div
                v-if="showSettingsMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                @click.stop
              >
                <div class="py-1">
                  <button
                    @click="openSystemSettings"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    System Settings
                  </button>
                  <button
                    @click="openForecastModal"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    📈 Revenue Forecast
                  </button>
                  <div class="border-t border-gray-100"></div>
                  <button
                    @click="triggerFileImport"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import CSV
                  </button>
                </div>
              </div>
            </div>
            
            <button
              @click="handleLogout"
              class="text-gray-500 hover:text-gray-700"
              title="Logout"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Gestionnaire d'onglets avec listes -->
      <div class="flex-1 overflow-hidden">
        <TabsManager
          ref="tabsManager"
          :lead-times="closingLeadTimes"
          @add-prospect="showAddModal = true"
          @edit-prospect="editProspect"
          @delete-prospect="deleteProspect"
          @select-prospect="selectProspect"
          @reorder-prospects="reorderProspects"
          @tab-changed="onTabChanged"
          @filtered-prospects="onFilteredProspects"
          @navigate-to-tab="onNavigateToTab"
        />
      </div>
    </div>

    <!-- Séparateur redimensionnable -->
    <div 
      class="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize relative group flex-shrink-0"
      @mousedown="startResize"
    >
      <div class="absolute inset-y-0 left-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>

    <!-- Map -->
    <div class="flex-1 min-h-0">
      <MapView
        :prospects="filteredProspectsForMap"
        :all-prospects="prospectsStore.prospects"
        :selected-prospect="selectedProspect"
        @select-prospect="selectProspect"
      />
    </div>

    <!-- Add/Edit Modal -->
    <ProspectModal
      :show="showAddModal || showEditModal"
      :prospect="editingProspect"
      :current-tab-id="currentTabId"
      :key="modalKey"
      @close="closeModal"
    />

    <!-- CSV Import Modal -->
    <CsvImportModal
      :is-open="showCsvImportModal"
      :available-tabs="availableTabs"
      :current-tab-id="currentTabId"
      @close="closeCsvImportModal"
      @imported="onCsvImported"
    />

    <!-- System Settings Modal -->
    <div
      v-if="showSystemSettings"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      style="z-index: 9999;"
      @click="closeSystemSettings"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              System Settings
            </h3>
            <button @click="closeSystemSettings" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <!-- User Profile Section -->
            <div class="border rounded-lg p-4">
              <h4 class="text-md font-medium text-gray-800 mb-3">User Profile</h4>
              
              <!-- User Information -->
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <p class="mt-1 text-sm text-gray-900">{{ userProfile?.name }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <p class="mt-1 text-sm text-gray-900">{{ userProfile?.email }}</p>
                </div>
                
                <div v-if="userProfile?.company">
                  <label class="block text-sm font-medium text-gray-700">Company</label>
                  <p class="mt-1 text-sm text-gray-900">{{ userProfile?.company }}</p>
                </div>
              </div>

              <!-- Change Password -->
              <div class="mt-4 pt-4 border-t border-gray-200">
                <button
                  @click="showChangePassword = !showChangePassword"
                  class="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l6.879-6.88a6 6 0 0110.121-.12z" />
                  </svg>
                  Change Password
                </button>
                
                <!-- Password Change Form -->
                <div v-if="showChangePassword" class="mt-3 space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      v-model="passwordForm.currentPassword"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      v-model="passwordForm.newPassword"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      v-model="passwordForm.confirmPassword"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <!-- Password validation messages -->
                  <div v-if="passwordForm.newPassword && passwordForm.newPassword.length < 6" class="text-xs text-red-600">
                    Password must be at least 6 characters long
                  </div>
                  
                  <div v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="text-xs text-red-600">
                    Passwords do not match
                  </div>
                  
                  <!-- Action buttons -->
                  <div class="flex space-x-2">
                    <button
                      @click="changePassword"
                      :disabled="!canChangePassword || passwordChangeLoading"
                      class="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div v-if="passwordChangeLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {{ passwordChangeLoading ? 'Changing...' : 'Change Password' }}
                    </button>
                    
                    <button
                      @click="cancelChangePassword"
                      class="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Database Operations -->
            <div class="border rounded-lg p-4">
              <h4 class="text-md font-medium text-gray-800 mb-3">Database Operations</h4>
              
              <!-- Export Database -->
              <div class="space-y-2">
                <button
                  @click="exportDatabase"
                  :disabled="exportLoading"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!exportLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ exportLoading ? 'Exporting...' : 'Export Database (JSON)' }}
                </button>
                <p class="text-xs text-gray-500">Download all your data as a JSON file</p>
              </div>

              <!-- Import Database -->
              <div class="space-y-2 mt-4">
                <button
                  @click="triggerDatabaseImport"
                  :disabled="importLoading"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!importLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ importLoading ? 'Importing...' : 'Import Database (JSON)' }}
                </button>
                <p class="text-xs text-gray-500">Restore data from a JSON backup file</p>
              </div>

              <!-- Warning -->
              <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div class="flex">
                  <svg class="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div class="ml-3">
                    <p class="text-sm text-yellow-800">
                      <strong>Warning:</strong> Importing will replace all existing data. Make sure to export a backup first.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Closing Lead Time Settings -->
            <div class="border rounded-lg p-4">
              <h4 class="text-md font-medium text-gray-800 mb-3">⏱️ Closing Lead Time</h4>
              <p class="text-sm text-gray-600 mb-4">Set average time in months to close leads by category</p>
              
              <div class="space-y-4">
                <!-- Cold Leads -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                      <label class="text-sm font-medium text-gray-700">Cold Leads</label>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="closingLeadTimes.cold"
                        type="number"
                        min="1"
                        max="60"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">months</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between pl-5">
                    <label class="text-xs text-gray-600">Probability</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="closingLeadTimes.coldProbability"
                        type="number"
                        min="1"
                        max="100"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <!-- Warm Leads -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                      <label class="text-sm font-medium text-gray-700">Warm Leads</label>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="closingLeadTimes.warm"
                        type="number"
                        min="1"
                        max="60"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">months</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between pl-5">
                    <label class="text-xs text-gray-600">Probability</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="closingLeadTimes.warmProbability"
                        type="number"
                        min="1"
                        max="100"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <!-- Hot Leads -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                      <label class="text-sm font-medium text-gray-700">Hot Leads</label>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="closingLeadTimes.hot"
                        type="number"
                        min="1"
                        max="60"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">months</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between pl-5">
                    <label class="text-xs text-gray-600">Probability</label>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="closingLeadTimes.hotProbability"
                        type="number"
                        min="1"
                        max="100"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <div class="pt-3 border-t border-gray-200">
                  <button
                    @click="saveClosingLeadTimes"
                    :disabled="leadTimeLoading"
                    class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div v-if="leadTimeLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {{ leadTimeLoading ? 'Saving...' : 'Save Lead Time Settings' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="border border-red-200 rounded-lg p-4 bg-red-50">
              <h4 class="text-md font-medium text-red-800 mb-3">🚨 Danger Zone</h4>
              
              <div class="space-y-2">
                <button
                  @click="cleanupOrphanProspects"
                  :disabled="deleteLoading"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!deleteLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ deleteLoading ? 'Cleaning...' : 'Clean Orphan Prospects' }}
                </button>
                <p class="text-xs text-orange-700">Remove prospects that are only in "All Leads" tab or not assigned to any specific tab. This helps clean up prospects that are not properly categorized.</p>
                
                <button
                  @click="openDeleteAllDataModal"
                  :disabled="deleteLoading"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!deleteLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ deleteLoading ? 'Deleting...' : 'Delete All Data' }}
                </button>
                <p class="text-xs text-red-700">Permanently delete all your prospects, tabs, and data. This action cannot be undone.</p>
              </div>
            </div>

            <!-- Status Messages -->
            <div v-if="systemMessage" class="p-3 rounded-md" :class="systemMessageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
              <div class="flex">
                <svg v-if="systemMessageType === 'success'" class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm">{{ systemMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete All Data Confirmation Modal -->
    <div
      v-if="showDeleteAllModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      style="z-index: 10000;"
      @click="closeDeleteAllModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-red-600">
              ⚠️ Delete All Data
            </h3>
            <button @click="closeDeleteAllModal" class="text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Warning Message -->
            <div class="p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-red-800">DANGER: This action cannot be undone!</h4>
                  <div class="mt-2 text-sm text-red-700">
                    <p>This will permanently delete:</p>
                    <ul class="list-disc list-inside mt-1">
                      <li>All your prospects ({{ prospectsStore.prospects.length }} prospects)</li>
                      <li>All custom tabs and categories</li>
                      <li>All notes and data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirmation Input -->
            <div>
              <label for="confirmText" class="block text-sm font-medium text-gray-700 mb-2">
                To confirm deletion, type: <code class="bg-gray-100 px-2 py-1 rounded text-red-600 font-mono">sudo delete all</code>
              </label>
              <input
                id="confirmText"
                v-model="deleteConfirmText"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Type confirmation text here..."
                @keyup.enter="confirmDeleteAllData"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="closeDeleteAllModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                @click="confirmDeleteAllData"
                :disabled="deleteConfirmText !== 'sudo delete all' || deleteLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ deleteLoading ? 'Deleting...' : 'Delete All Data' }}
              </button>
            </div>

            <!-- Delete Status Messages -->
            <div v-if="deleteMessage" class="p-3 rounded-md" :class="deleteMessageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
              <div class="flex">
                <svg v-if="deleteMessageType === 'success'" class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm">{{ deleteMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input fichier caché pour l'import CSV -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      @change="handleFileImport"
      class="hidden"
    />

    <!-- Input fichier caché pour l'import de base de données -->
    <input
      ref="databaseFileInput"
      type="file"
      accept=".json"
      @change="handleDatabaseImport"
      class="hidden"
    />

    <!-- Forecast Modal -->
    <ForecastModal
      :is-visible="showForecastModal"
      :prospects="forecastProspects"
      :lead-times="closingLeadTimes"
      :current-tab-name="currentTabName"
      @close="closeForecastModal"
    />
  </div>
</template>

<style scoped>
/* Styles pour le curseur de redimensionnement */
.cursor-col-resize {
  cursor: col-resize;
}

/* Désactiver la sélection pendant le redimensionnement */
.select-none {
  user-select: none;
}

/* Améliorer l'indicateur de redimensionnement */
.resize-handle {
  transition: all 0.2s ease;
}

.resize-handle:hover {
  background-color: #3b82f6;
}

/* Effet de mise en évidence pour le prospect sélectionné depuis la carte */
:deep(.highlight-prospect) {
  animation: highlight-pulse 2s ease-in-out;
  transform: scale(1.02);
}

@keyframes highlight-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    background-color: rgba(59, 130, 246, 0.05);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.3);
    background-color: rgba(59, 130, 246, 0.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    background-color: transparent;
  }
}

/* Responsive breakpoints personnalisés si nécessaire */
@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProspectsStore } from '@/stores/prospects'
import TabsManager from '@/components/TabsManager.vue'
import MapView from '@/components/MapView.vue'
import ProspectModal from '@/components/ProspectModal.vue'
import CsvImportModal from '@/components/CsvImportModal.vue'
import ForecastModal from '@/components/ForecastModal.vue'
import api, { profileAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const prospectsStore = useProspectsStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingProspect = ref(null)
const selectedProspect = ref(null)
const tabsManager = ref(null)
const currentTabId = ref('default')
const showSettingsMenu = ref(false)
const showSystemSettings = ref(false)
const showDeleteAllModal = ref(false)
const deleteConfirmText = ref('')
const deleteLoading = ref(false)
const deleteMessage = ref('')
const deleteMessageType = ref('success') // 'success' or 'error'
const exportLoading = ref(false)
const importLoading = ref(false)
const systemMessage = ref('')
const systemMessageType = ref('success') // 'success' or 'error'
const fileInput = ref(null)
const databaseFileInput = ref(null)
const filteredProspectsForMap = ref([])
const showMapOnMobile = ref(false)
const sidebarWidth = ref(400) // Largeur par défaut du sidebar
const isResizing = ref(false)
const modalKey = ref(0) // Pour forcer le re-rendu du modal

// Closing Lead Time Settings
const closingLeadTimes = ref({
  cold: 12,  // mois
  warm: 6,   // mois
  hot: 3,    // mois
  // Probabilités de conversion par catégorie (en pourcentage)
  coldProbability: 15,
  warmProbability: 45,
  hotProbability: 80
})
const leadTimeLoading = ref(false)

// CSV Import Modal
const showCsvImportModal = ref(false)

// Forecast Modal
const showForecastModal = ref(false)

// User profile and password management
const userProfile = ref(null)
const showChangePassword = ref(false)
const passwordChangeLoading = ref(false)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Prospects visibles selon l'onglet actuel (fallback si pas de filtrage)
const visibleProspects = computed(() => {
  console.log('=== FILTERING PROSPECTS ===')
  console.log('Current tab ID:', currentTabId.value)
  console.log('Current tab NAME:', currentTabName.value)
  console.log('Total prospects:', prospectsStore.prospects.length)
  
  // Si on est sur "All Leads", retourner TOUS les prospects
  if (currentTabName.value === 'All Leads') {
    console.log('🌟 ALL LEADS mode - returning ALL prospects without filtering')
    // Debug: count hot prospects in store
    const hotInStore = prospectsStore.prospects.filter(p => p.status === 'hot')
    console.log('🔥 HOT in STORE:', hotInStore.length, hotInStore.map(p => ({ name: p.name, status: p.status, tab_id: p.tab_id })))
    return prospectsStore.prospects
  }
  
  // Sinon, filtrer par onglet spécifique
  if (currentTabId.value === 'default') {
    console.log('Using default tab - returning all prospects')
    return prospectsStore.prospects
  } else {
    const filtered = prospectsStore.prospects.filter(p => {
      console.log(`Prospect ${p.name}: tabId="${p.tabId}", tab_id="${p.tab_id}", comparing with "${currentTabId.value}"`)
      return p.tabId === currentTabId.value || p.tab_id === currentTabId.value
    })
    console.log(`Filtered ${filtered.length} prospects for tab "${currentTabId.value}"`)
    return filtered
  }
})

// Computed property to check if password can be changed
const canChangePassword = computed(() => {
  return (
    passwordForm.value.currentPassword.length > 0 &&
    passwordForm.value.newPassword.length >= 6 &&
    passwordForm.value.confirmPassword.length > 0 &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  )
})

// Available tabs for CSV import
const availableTabs = computed(() => {
  if (tabsManager.value && tabsManager.value.tabs) {
    return tabsManager.value.tabs
  }
  return []
})

// Current tab name for display
const currentTabName = computed(() => {
  if (tabsManager.value && tabsManager.value.tabs && currentTabId.value) {
    const currentTab = tabsManager.value.tabs.find(tab => tab.id === currentTabId.value)
    return currentTab ? currentTab.name : 'Tous les prospects'
  }
  return 'Tous les prospects'
})

// Prospects for forecast (current tab only - strict)
const forecastProspects = computed(() => {
  // Si on est sur "All Leads", utiliser TOUS les prospects du système
  if (currentTabName.value === 'All Leads') {
    console.log(`🌟 Prévisionnel "ALL LEADS": ${prospectsStore.prospects.length} prospects totaux`)
    return prospectsStore.prospects
  }
  
  // Sinon, utiliser UNIQUEMENT les prospects de l'onglet courant
  console.log(`Prévisionnel pour l'onglet "${currentTabName.value}": ${visibleProspects.value.length} prospects`)
  return visibleProspects.value
})

// Gérer les prospects filtrés depuis ProspectsList
function onFilteredProspects(filteredProspects) {
  filteredProspectsForMap.value = filteredProspects
}

// Naviguer vers l'onglet d'origine d'un prospect
function onNavigateToTab(tabId, prospectId) {
  console.log('🎯 Navigate to tab:', tabId, 'for prospect:', prospectId)
  console.log('🔍 tabsManager.value:', tabsManager.value)
  console.log('🔍 tabsManager.value?.switchToTab:', tabsManager.value?.switchToTab)
  
  if (!tabsManager.value) {
    console.error('❌ tabsManager.value is null or undefined')
    return
  }
  
  // Essayer différentes méthodes de navigation
  let navigationMethod = null
  if (tabsManager.value.switchToTab && typeof tabsManager.value.switchToTab === 'function') {
    navigationMethod = tabsManager.value.switchToTab
  } else if (tabsManager.value.selectTab && typeof tabsManager.value.selectTab === 'function') {
    navigationMethod = tabsManager.value.selectTab
  }
  
  if (!navigationMethod) {
    console.error('❌ No navigation method available')
    console.log('🔍 Available methods:', Object.keys(tabsManager.value))
    return
  }
  
  try {
    navigationMethod(tabId)
    // TODO: Optionnellement, faire défiler vers le prospect spécifique
  } catch (error) {
    console.error('❌ Error calling navigation method:', error)
  }
}

// Basculer entre carte et prospects sur mobile
function toggleMobileView() {
  showMapOnMobile.value = !showMapOnMobile.value
}

// Gestion du redimensionnement du sidebar
function startResize(event) {
  isResizing.value = true
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

function doResize(event) {
  if (!isResizing.value) return
  
  const newWidth = event.clientX
  // Limiter la largeur entre 300px et 70% de l'écran
  const minWidth = 300
  const maxWidth = window.innerWidth * 0.7
  
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
  
  // Sauvegarder la largeur dans localStorage
  localStorage.setItem('maplyo_sidebar_width', sidebarWidth.value.toString())
}

// Surveiller les changements d'onglet actif
watch(() => tabsManager.value?.activeTabId, (newTabId) => {
  if (newTabId) {
    currentTabId.value = newTabId
    // Réinitialiser avec tous les prospects de ce tab si pas de filtre actif
    filteredProspectsForMap.value = visibleProspects.value
  }
})

// Surveiller les changements de prospects pour mettre à jour la carte
watch(visibleProspects, (newProspects) => {
  // Mettre à jour seulement si on n'a pas de filtrage actif depuis ProspectsList
  if (filteredProspectsForMap.value.length === 0 || 
      filteredProspectsForMap.value.length === prospectsStore.prospects.length) {
    filteredProspectsForMap.value = newProspects
  }
})

function onTabChanged(tabId) {
  currentTabId.value = tabId
  console.log('Tab changed to:', tabId) // Debug
  // Réinitialiser la carte avec tous les prospects du nouvel onglet
  filteredProspectsForMap.value = visibleProspects.value
  // Forcer le re-rendu du modal pour mettre à jour les onglets disponibles
  modalKey.value++
}

onMounted(async () => {
  await prospectsStore.fetchProspects()
  
  // Charger les paramètres de closing lead times
  await loadClosingLeadTimes()
  
  // Écouter les événements des onglets
  if (tabsManager.value) {
    currentTabId.value = tabsManager.value.activeTabId || 'default'
  }
  
  // Initialiser la carte avec tous les prospects
  filteredProspectsForMap.value = visibleProspects.value
  
  // Charger la largeur du sidebar depuis localStorage
  const savedWidth = localStorage.getItem('maplyo_sidebar_width')
  if (savedWidth) {
    sidebarWidth.value = parseInt(savedWidth)
  }
})

onUnmounted(() => {
  // Nettoyer les event listeners
  document.removeEventListener('mousemove', doResize)
  document.removeEventListener('mouseup', stopResize)
})

function selectProspect(prospect) {
  selectedProspect.value = prospect
  
  // Scroll vers le prospect dans la liste
  scrollToProspectInList(prospect)
}

async function scrollToProspectInList(prospect) {
  // Vérifier dans quel onglet se trouve le prospect
  const prospectTabId = prospect.tabId || prospect.tab_id || 'default'
  
  // Basculer vers l'onglet approprié si nécessaire
  if (tabsManager.value && currentTabId.value !== prospectTabId) {
    // Essayer différentes méthodes de navigation
    let navigationMethod = null
    if (tabsManager.value.switchToTab && typeof tabsManager.value.switchToTab === 'function') {
      navigationMethod = tabsManager.value.switchToTab
    } else if (tabsManager.value.selectTab && typeof tabsManager.value.selectTab === 'function') {
      navigationMethod = tabsManager.value.selectTab
    }
    
    if (!navigationMethod) {
      console.error('❌ No navigation method available in scrollToProspectInList')
      console.log('🔍 Available methods:', Object.keys(tabsManager.value))
      return
    }
    
    try {
      // Changer d'onglet
      navigationMethod(prospectTabId)
      currentTabId.value = prospectTabId
      
      // Attendre que le DOM soit mis à jour
      await nextTick()
    } catch (error) {
      console.error('❌ Error calling navigation method in scrollToProspectInList:', error)
      return
    }
  }
  
  // Attendre un peu plus pour s'assurer que les composants sont rendus
  setTimeout(() => {
    // Trouver l'élément prospect dans la liste
    const prospectElement = document.querySelector(`[data-prospect-id="${prospect.id}"]`)
    
    if (prospectElement) {
      // Scroller vers l'élément avec un comportement smooth
      prospectElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
      
      // Ajouter un effet visuel temporaire pour mettre en évidence le prospect
      prospectElement.classList.add('highlight-prospect')
      setTimeout(() => {
        prospectElement.classList.remove('highlight-prospect')
      }, 2000)
    }
  }, 200)
}

function editProspect(prospect) {
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

async function deleteProspect(prospect) {
  if (confirm('Are you sure you want to delete this lead?')) {
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
  
  // Forcer le re-rendu du modal pour la prochaine ouverture
  modalKey.value++
}

// System Settings functions
async function openSystemSettings() {
  showSettingsMenu.value = false
  showSystemSettings.value = true
  systemMessage.value = ''
  
  // Load user profile
  try {
    const response = await profileAPI.get()
    userProfile.value = response.data
  } catch (error) {
    console.error('Error loading user profile:', error)
    systemMessage.value = 'Error loading user profile'
    systemMessageType.value = 'error'
  }
  
  // Load closing lead times
  await loadClosingLeadTimes()
}

function closeSystemSettings() {
  showSystemSettings.value = false
  showChangePassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  systemMessage.value = ''
}

async function exportDatabase() {
  exportLoading.value = true
  systemMessage.value = ''
  
  try {
    const response = await fetch('/api/database/export', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // The backend now includes tabs in the export data automatically
    // No need to add from localStorage anymore
    
    // Create and download the file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `maplyo-database-${timestamp}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    systemMessage.value = `Database exported successfully! Included ${data.prospects?.length || 0} prospects, ${data.tabs?.length || 0} tabs, and ${data.settings?.length || 0} settings.`
    systemMessageType.value = 'success'
    
  } catch (error) {
    console.error('Export error:', error)
    systemMessage.value = `Export failed: ${error.message}`
    systemMessageType.value = 'error'
  } finally {
    exportLoading.value = false
  }
}

function triggerDatabaseImport() {
  systemMessage.value = ''
  databaseFileInput.value?.click()
}

async function handleDatabaseImport(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.json')) {
    systemMessage.value = 'Please select a JSON file'
    systemMessageType.value = 'error'
    return
  }

  // Confirm the import action
  const confirmed = confirm(
    'WARNING: This will replace ALL existing data with the data from the backup file. ' +
    'Are you sure you want to continue? This action cannot be undone.'
  )
  
  if (!confirmed) {
    event.target.value = '' // Reset the file input
    return
  }

  importLoading.value = true
  systemMessage.value = ''

  try {
    const text = await file.text()
    let importData
    
    try {
      importData = JSON.parse(text)
    } catch (parseError) {
      throw new Error('Invalid JSON format: ' + parseError.message)
    }

    // Debug: log the structure of importData
    console.log('📋 Import data structure:', {
      hasProspects: !!importData.prospects,
      prospectsCount: Array.isArray(importData.prospects) ? importData.prospects.length : 'not array',
      hasTabs: !!importData.tabs,
      tabsCount: Array.isArray(importData.tabs) ? importData.tabs.length : 'not array',
      hasUsers: !!importData.users,
      hasSettings: !!importData.settings,
      topLevelKeys: Object.keys(importData || {})
    })

    // More flexible validation - accept files with any of these structures
    if (!importData || typeof importData !== 'object') {
      throw new Error('Import file must contain a valid JSON object.')
    }

    // If it's an old format that doesn't have prospects directly, try to find them
    if (!importData.prospects) {
      // Check if it's a nested structure or old format
      if (importData.users && typeof importData.users === 'object') {
        // Try to extract prospects from users data
        const firstUser = Object.values(importData.users)[0]
        if (firstUser && firstUser.prospects) {
          importData.prospects = firstUser.prospects
          console.log('📋 Extracted prospects from nested user data')
        }
      }
      
      // If still no prospects, create an empty array but warn
      if (!importData.prospects) {
        console.warn('⚠️ No prospects found in import data, but continuing with empty prospects')
        importData.prospects = []
      }
    }

    // Ensure prospects is an array
    if (!Array.isArray(importData.prospects)) {
      throw new Error('Invalid prospects data format. Expected an array.')
    }

    const response = await fetch('/api/database/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(importData)
    })

    if (!response.ok) {
      let errorMessage = `Import failed: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch (parseError) {
        // If we can't parse the error response, check if it's HTML (server error)
        const responseText = await response.text()
        if (responseText.includes('<!DOCTYPE')) {
          errorMessage = 'Server error occurred. Please check that the server is running and try again.'
        } else {
          errorMessage = responseText || errorMessage
        }
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    
    // Tabs are now handled by the backend database, no need to manage localStorage
    // Refresh the tabs list FIRST to show the imported tabs
    await nextTick()
    if (tabsManager.value && tabsManager.value.loadTabs) {
      await tabsManager.value.loadTabs()
    }
    
    // Wait a bit more to ensure tabs are fully loaded
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Refresh prospects AFTER tabs are loaded
    await prospectsStore.fetchProspects()
    
    // Additional delay to ensure UI updates
    await nextTick()
    
    systemMessage.value = `Database imported successfully! ${result.imported?.prospects || 0} prospects, ${result.imported?.tabs || 0} tabs, and ${result.imported?.settings || 0} settings imported.`
    systemMessageType.value = 'success'
    
    // Reload prospects data
    await prospectsStore.fetchProspects()
    
    // Force complete refresh of tabs and UI
    await nextTick()
    
    // Trigger multiple events to ensure all components update
    window.dispatchEvent(new CustomEvent('tabsChanged'))
    window.dispatchEvent(new CustomEvent('storage', { 
      detail: { key: 'maplyo_tabs', newValue: localStorage.getItem('maplyo_tabs') }
    }))
    
    // Force re-render of TabsManager
    if (tabsManager.value) {
      tabsManager.value.$forceUpdate()
    }
    
    // Close the modal and refresh the page after a short delay to ensure everything is updated
    setTimeout(() => {
      window.location.reload()
    }, 1500)
    
  } catch (error) {
    console.error('Import error:', error)
    systemMessage.value = `Import failed: ${error.message}`
    systemMessageType.value = 'error'
  } finally {
    importLoading.value = false
    event.target.value = '' // Reset the file input
  }
}

// Password management functions
async function changePassword() {
  if (!canChangePassword.value) {
    return
  }
  
  passwordChangeLoading.value = true
  systemMessage.value = ''
  
  try {
    await profileAPI.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    // Success
    systemMessage.value = 'Password changed successfully!'
    systemMessageType.value = 'success'
    
    // Reset form and close
    cancelChangePassword()
    
  } catch (error) {
    console.error('Error changing password:', error)
    let errorMessage = 'Failed to change password'
    
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    } else if (error.message) {
      errorMessage = error.message
    }
    
    systemMessage.value = errorMessage
    systemMessageType.value = 'error'
    
  } finally {
    passwordChangeLoading.value = false
  }
}

function cancelChangePassword() {
  showChangePassword.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// Closing Lead Time functions
async function loadClosingLeadTimes() {
  try {
    const response = await fetch('/api/settings/closing-lead-times', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.settings) {
        closingLeadTimes.value = {
          cold: data.settings.cold || 12,
          warm: data.settings.warm || 6,
          hot: data.settings.hot || 3,
          coldProbability: data.settings.coldProbability || 15,
          warmProbability: data.settings.warmProbability || 45,
          hotProbability: data.settings.hotProbability || 80
        }
      }
    }
  } catch (error) {
    console.error('Error loading closing lead times:', error)
  }
}

async function saveClosingLeadTimes() {
  leadTimeLoading.value = true
  systemMessage.value = ''
  
  try {
    const response = await fetch('/api/settings/closing-lead-times', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cold: closingLeadTimes.value.cold,
        warm: closingLeadTimes.value.warm,
        hot: closingLeadTimes.value.hot,
        coldProbability: closingLeadTimes.value.coldProbability,
        warmProbability: closingLeadTimes.value.warmProbability,
        hotProbability: closingLeadTimes.value.hotProbability
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      systemMessage.value = 'Closing lead time settings saved successfully!'
      systemMessageType.value = 'success'
    } else {
      throw new Error(data.error || 'Failed to save settings')
    }
  } catch (error) {
    console.error('Error saving closing lead times:', error)
    systemMessage.value = 'Error saving closing lead time settings: ' + error.message
    systemMessageType.value = 'error'
  } finally {
    leadTimeLoading.value = false
  }
}

// Cleanup orphan prospects function
async function cleanupOrphanProspects() {
  if (!confirm('Are you sure you want to delete prospects that are only in "All Leads" or not assigned to any specific tab? This will remove uncategorized prospects and cannot be undone.')) {
    return
  }
  
  deleteLoading.value = true
  systemMessage.value = ''
  
  try {
    const response = await fetch('/api/cleanup/orphan-prospects', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to cleanup orphan prospects')
    }
    
    console.log('✅ Orphan cleanup result:', data)
    
    if (data.deletedCount > 0) {
      systemMessage.value = `Successfully deleted ${data.deletedCount} orphan prospect${data.deletedCount === 1 ? '' : 's'}!`
      systemMessageType.value = 'success'
      
      // Refresh the prospects data
      await prospectsStore.fetchProspects()
      
      // Refresh tabs if using TabsManager
      if (tabsManager.value && tabsManager.value.loadTabs) {
        await tabsManager.value.loadTabs()
      }
    } else {
      systemMessage.value = 'No orphan prospects found. Your data is clean!'
      systemMessageType.value = 'success'
    }
    
  } catch (error) {
    console.error('Error cleaning up orphan prospects:', error)
    systemMessage.value = 'Error cleaning up orphan prospects: ' + error.message
    systemMessageType.value = 'error'
  } finally {
    deleteLoading.value = false
    
    // Clear message after 5 seconds
    setTimeout(() => {
      systemMessage.value = ''
    }, 5000)
  }
}

// Delete All Data functions
function openDeleteAllDataModal() {
  showSystemSettings.value = false
  showDeleteAllModal.value = true
  deleteConfirmText.value = ''
  deleteMessage.value = ''
}

function closeDeleteAllModal() {
  showDeleteAllModal.value = false
  deleteConfirmText.value = ''
  deleteMessage.value = ''
}

async function confirmDeleteAllData() {
  if (deleteConfirmText.value !== 'sudo delete all') {
    deleteMessage.value = 'Please type the exact confirmation text: sudo delete all'
    deleteMessageType.value = 'error'
    return
  }

  deleteLoading.value = true
  deleteMessage.value = ''

  try {
    const response = await fetch('/api/database/delete-all', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Delete failed: ${response.statusText}`
      try {
        // Clone the response to be able to read it multiple times
        const responseClone = response.clone()
        const errorData = await responseClone.json()
        errorMessage = errorData.error || errorMessage
      } catch (parseError) {
        try {
          const responseText = await response.text()
          if (responseText.includes('<!DOCTYPE')) {
            errorMessage = 'Server error occurred. Please check that the server is running and try again.'
          } else {
            errorMessage = responseText || errorMessage
          }
        } catch (textError) {
          // If all parsing fails, use the original error message
          console.error('Failed to parse error response:', textError)
        }
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    
    // Count tabs before clearing
    const savedTabs = localStorage.getItem('maplyo_tabs')
    let tabsCount = 0
    if (savedTabs) {
      try {
        const tabs = JSON.parse(savedTabs)
        tabsCount = tabs.filter(tab => tab.id !== 'default').length
      } catch (error) {
        console.warn('Failed to parse tabs from localStorage:', error)
      }
    }
    
    deleteMessage.value = `All data deleted successfully! ${result.deleted?.prospects || 0} prospects and ${tabsCount} tabs removed.`
    deleteMessageType.value = 'success'
    
    // Clear all local data
    prospectsStore.prospects = []
    
    // Clear tabs from localStorage
    localStorage.removeItem('maplyo_tabs')
    
    // Refresh the page after a short delay to show the success message
    setTimeout(() => {
      closeDeleteAllModal()
      window.location.reload()
    }, 2000)
    
  } catch (error) {
    console.error('Delete error:', error)
    deleteMessage.value = `Delete failed: ${error.message}`
    deleteMessageType.value = 'error'
  } finally {
    deleteLoading.value = false
  }
}

// Fonctions pour l'import CSV
function triggerFileImport() {
  showSettingsMenu.value = false
  showCsvImportModal.value = true
}

function closeCsvImportModal() {
  showCsvImportModal.value = false
}

// Fonctions pour le prévisionnel
function openForecastModal() {
  showSettingsMenu.value = false
  showForecastModal.value = true
}

function closeForecastModal() {
  showForecastModal.value = false
}

function onCsvImported(results) {
  console.log('CSV import completed:', results)
  showCsvImportModal.value = false
  
  // Afficher un message de succès
  systemMessage.value = `Import terminé avec succès ! ${results.imported} prospects importés${results.merged > 0 ? `, ${results.merged} fusionnés` : ''}${results.skipped > 0 ? `, ${results.skipped} ignorés` : ''}.`
  systemMessageType.value = 'success'
  
  // Effacer le message après 5 secondes
  setTimeout(() => {
    systemMessage.value = ''
  }, 5000)
  
  // Actualiser les données
  prospectsStore.fetchProspects()
}

async function handleFileImport(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.name.toLowerCase().endsWith('.csv')) {
    alert('Veuillez sélectionner un fichier CSV')
    return
  }

  try {
    const text = await file.text()
    const prospects = parseCSV(text)
    
    if (prospects.length === 0) {
      alert('No leads found in CSV file')
      return
    }

    let importedCount = 0
    let errorCount = 0

    for (const prospectData of prospects) {
      try {
        const result = await prospectsStore.createProspect({
          ...prospectData,
          tabId: currentTabId.value || 'default',
          status: 'cold' // Par défaut
        })
        
        if (result.success) {
          importedCount++
        } else {
          errorCount++
          console.error('Erreur lors de l\'import:', result.error)
        }
      } catch (error) {
        errorCount++
        console.error('Erreur lors de l\'import:', error)
      }
    }

    alert(`Import terminé!\n${importedCount} prospects importés\n${errorCount} erreurs`)
    
    // Réinitialiser l'input file
    event.target.value = ''
    
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier:', error)
    alert('Erreur lors de la lecture du fichier CSV')
  }
}

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données')
  }

  // Lire la ligne d'en-tête
  const headers = lines[0].split(';').map(h => h.trim().toLowerCase())
  console.log('Headers detected:', headers)

  const prospects = []

  // Traiter chaque ligne de données
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Ignorer les lignes vides

    const values = line.split(';').map(v => v.trim())
    
    // Créer un objet prospect avec mapping des colonnes
    const prospect = {
      name: '',
      email: '',
      phone: '',
      company: '',
      contact: '',
      address: '',
      revenue: 0,
      notes: ''
    }

    // Mapper les colonnes selon les en-têtes
    headers.forEach((header, index) => {
      const value = values[index] || ''
      
      switch (header) {
        case 'name':
        case 'nom':
          prospect.name = value
          break
        case 'email':
        case 'mail':
        case 'e-mail':
          prospect.email = value
          break
        case 'phone':
        case 'telephone':
        case 'téléphone':
        case 'tel':
          prospect.phone = value
          break
        case 'company':
        case 'entreprise':
        case 'société':
        case 'societe':
          prospect.company = value
          break
        case 'contact':
        case 'position':
        case 'poste':
        case 'titre':
          prospect.contact = value
          break
        case 'address':
        case 'adresse':
          prospect.address = value
          break
        case 'revenue':
        case 'revenu':
        case 'chiffre':
        case 'ca':
          // Nettoyer et convertir le revenu (enlever les espaces, virgules -> points)
          const cleanValue = value.replace(/[^\d,.-]/g, '').replace(',', '.')
          prospect.revenue = parseFloat(cleanValue) || 0
          break
        case 'notes':
        case 'note':
        case 'commentaire':
        case 'commentaires':
          prospect.notes = value
          break
      }
    })

    // Vérifier qu'on a au moins un nom
    if (prospect.name) {
      prospects.push(prospect)
    }
  }

  console.log(`${prospects.length} prospects processed from CSV`)
  return prospects
}

// Fermer le menu si on clique ailleurs
function handleClickOutside(event) {
  if (!event.target.closest('.relative')) {
    showSettingsMenu.value = false
  }
}

// Méthode de déconnexion avec redirection
const handleLogout = () => {
  // Nettoyer les données locales spécifiques à l'utilisateur
  localStorage.removeItem('maplyo_active_tab_id')
  localStorage.removeItem('maplyo_sidebar_width')
  
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await prospectsStore.fetchProspects()
  
  // Charger les paramètres de closing lead times
  await loadClosingLeadTimes()
  
  // Écouter les événements des onglets
  if (tabsManager.value) {
    currentTabId.value = tabsManager.value.activeTabId || 'default'
  }
  
  // Ajouter l'écouteur pour fermer le menu
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Styles pour le slider */
.slider {
  background: linear-gradient(to right, #3b82f6 0%, #3b82f6 var(--value), #e5e7eb var(--value), #e5e7eb 100%);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider:focus {
  outline: none;
}

.slider:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
</style>
