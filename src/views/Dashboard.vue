<template>
  <div class="h-screen flex flex-col">
    <!-- Bandeau Demo Mode -->
    <div 
      v-if="isDemoMode" 
      class="bg-blue-100 border-b border-blue-300 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between flex-wrap gap-1 sm:gap-0 relative z-[60]"
    >
      <div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-blue-800">
        <svg class="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-semibold">Demo Mode</span>
        <span class="text-blue-600 hidden sm:inline">•</span>
        <span class="text-blue-700 hidden md:inline">All changes are temporary and will be lost when you close your browser</span>
        <span class="text-blue-700 md:hidden">Temporary changes</span>
      </div>
      <button
        @click="exitDemoMode"
        class="text-blue-700 hover:text-blue-900 font-medium text-xs sm:text-sm flex items-center gap-1"
      >
        <svg class="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="hidden sm:inline">Exit Demo</span>
        <span class="sm:hidden">Exit</span>
      </button>
    </div>
    
    <!-- Bandeau Read-Only Mode -->
    <div 
      v-else-if="isReadOnly" 
      class="bg-orange-100 border-b border-orange-300 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center"
    >
      <div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-orange-800">
        <svg class="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span class="font-medium">Read-Only Mode</span>
        <span class="text-orange-600 hidden sm:inline">•</span>
        <span class="text-orange-700 hidden sm:inline">View-only access - modifications disabled</span>
      </div>
    </div>

    <!-- Mobile View Selector (only on mobile) -->
    <div class="lg:hidden bg-white border-b border-gray-200 flex items-center justify-around p-2 gap-1 relative z-50">
      <button
        @click="mobileView = 'funnel'"
        :class="{
          'bg-blue-600 text-white': mobileView === 'funnel',
          'bg-gray-100 text-gray-700 hover:bg-gray-200': mobileView !== 'funnel'
        }"
        class="flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 font-medium text-xs"
      >
        <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Funnel
      </button>
      <button
        @click="mobileView = 'map'"
        :class="{
          'bg-blue-600 text-white': mobileView === 'map',
          'bg-gray-100 text-gray-700 hover:bg-gray-200': mobileView !== 'map'
        }"
        class="flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 font-medium text-xs"
      >
        <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        Map
      </button>
      <button
        @click="mobileView = 'todo'"
        :class="{
          'bg-blue-600 text-white': mobileView === 'todo',
          'bg-gray-100 text-gray-700 hover:bg-gray-200': mobileView !== 'todo'
        }"
        class="flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 font-medium text-xs"
      >
        <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Todo
      </button>
      <!-- Settings Button (only visible in funnel view) -->
      <button
        v-show="mobileView === 'funnel'"
        @click="showSettingsMenu = !showSettingsMenu"
        class="flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 font-medium text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>

    <div class="flex flex-1 min-h-0">
      <!-- Sidebar avec onglets (Desktop only or Mobile Funnel view) -->
      <div 
        v-show="!isMobile || mobileView === 'funnel'"
        class="bg-white border-r border-gray-200 flex flex-col flex-shrink-0"
        :class="{
          'fixed lg:static inset-0 z-20 pt-[60px]': isMobile && mobileView === 'funnel',
          'lg:static': !isMobile
        }"
        :style="isMobile ? 'width: 100vw' : `width: ${sidebarWidth}px`"
      >
        <!-- Header -->
        <div class="p-3 lg:p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h1 class="text-xl lg:text-2xl font-bold text-blue-600">Maplyo CRM</h1>
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
                    v-if="!isReadOnly && !isDemoMode"
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
                  <button
                    @click="openFunnelReportModal"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    📊 Funnel Report
                  </button>
                  <div class="border-t border-gray-100"></div>
                  <button
                    @click="openCompaniesModal"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    🏢 Companies & Contacts
                  </button>
                  <div v-if="!isReadOnly && !isDemoMode" class="border-t border-gray-100"></div>
                  <button
                    v-if="!isReadOnly && !isDemoMode"
                    @click="triggerFileImport"
                    class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import CSV
                  </button>
                  <!-- Indicateur read-only -->
                  <div v-if="isReadOnly" class="px-4 py-2 text-sm text-orange-600 bg-orange-50 border-t border-orange-100">
                    <div class="flex items-center">
                      <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Read-Only Mode
                    </div>
                  </div>
                  <!-- Indicateur démo -->
                  <div v-if="isDemoMode" class="px-4 py-2 text-sm text-blue-600 bg-blue-50 border-t border-blue-100">
                    <div class="flex items-center">
                      <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Demo Mode
                    </div>
                  </div>
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
      <div class="flex-1 flex flex-col min-h-0">
        <TabsManager
          ref="tabsManager"
          :lead-times="closingLeadTimes"
          :is-read-only="isReadOnly"
          @add-prospect="openAddModal"
          @edit-prospect="editProspect"
          @delete-prospect="deleteProspect"
          @select-prospect="selectProspect"
          @reorder-prospects="reorderProspects"
          @tab-changed="onTabChanged"
          @filtered-prospects="onFilteredProspects"
          @navigate-to-tab="onNavigateToTab"
          @open-company="openCompaniesModal"
        />
      </div>
    </div>

    <!-- Séparateur redimensionnable (desktop only) -->
    <div 
      class="hidden lg:block w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize relative group flex-shrink-0"
      @mousedown="startResize"
    >
      <div class="absolute inset-y-0 left-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>

    <!-- Content Area (map + todo panel) -->
    <div class="flex-1 min-h-0 flex">
      <!-- Map (Desktop always visible, Mobile only when selected) -->
      <div 
        v-show="!isMobile || mobileView === 'map'"
        class="flex-1 min-h-0"
        :class="{
          'fixed inset-0 z-20': isMobile && mobileView === 'map',
          'pt-[100px]': isMobile && mobileView === 'map' && isDemoMode,
          'pt-[60px]': isMobile && mobileView === 'map' && !isDemoMode
        }"
      >
        <MapView
          :prospects="filteredProspectsForMap"
          :all-prospects="prospectsStore.prospects"
          :selected-prospect="selectedProspect"
          @select-prospect="selectProspect"
          @open-company="openCompaniesModal"
        />
      </div>

      <!-- Global Todo Panel (Desktop always visible, Mobile only when selected) -->
      <div 
        v-show="!isMobile || mobileView === 'todo'"
        :class="{
          'fixed inset-0 z-20': isMobile && mobileView === 'todo',
          'pt-[100px]': isMobile && mobileView === 'todo' && isDemoMode,
          'pt-[60px]': isMobile && mobileView === 'todo' && !isDemoMode,
          'flex-shrink-0': !isMobile
        }"
      >
        <GlobalTodoPanel
          :prospects="prospectsStore.prospects"
          @view-prospect="viewProspectFromTodo"
          @edit-prospect="editProspectFromTodo"
          :is-mobile-fullscreen="isMobile && mobileView === 'todo'"
        />
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <FunnelProspectModal
      :show="showAddModal || showEditModal"
      :prospect="editingProspect"
      :current-tab-id="currentTabId"
      :initial-status="modalInitialStatus"
      :lead-times="closingLeadTimes"
      :key="modalKey"
      @close="closeModal"
      @save="closeModal"
      @edit="editProspect"
      @delete="deleteProspect"
      @company-changed="handleCompanyChanged"
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

            <!-- Theme Settings (Super User Only) -->
            <div v-if="authStore.isSuperUser" class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-medium text-gray-800">🎨 Theme Settings</h4>
                <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Super User</span>
              </div>
              
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="default"
                      v-model="currentTheme"
                      @change="applyTheme"
                      class="sr-only"
                    />
                    <div class="flex items-center space-x-2 p-3 border-2 rounded-lg transition-all"
                         :class="currentTheme === 'default' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                      <div class="w-4 h-4 rounded-full"
                           :class="currentTheme === 'default' ? 'bg-blue-500' : 'bg-gray-300'"></div>
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-900">Default</span>
                        <span class="text-xs text-gray-500">Modern clean interface</span>
                      </div>
                      <!-- Theme preview -->
                      <div class="ml-auto flex space-x-1">
                        <div class="w-3 h-3 bg-blue-500 rounded"></div>
                        <div class="w-3 h-3 bg-gray-200 rounded"></div>
                        <div class="w-3 h-3 bg-white border rounded"></div>
                      </div>
                    </div>
                  </label>
                </div>

                <div class="flex items-center space-x-3">
                  <label class="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="retro"
                      v-model="currentTheme"
                      @change="applyTheme"
                      class="sr-only"
                    />
                    <div class="flex items-center space-x-2 p-3 border-2 rounded-lg transition-all"
                         :class="currentTheme === 'retro' ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'">
                      <div class="w-4 h-4 rounded-full"
                           :class="currentTheme === 'retro' ? 'bg-gray-800' : 'bg-gray-300'"></div>
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-900">🕹️ Retro 8-bit</span>
                        <span class="text-xs text-gray-500">Minimalist black & white</span>
                      </div>
                      <!-- Theme preview -->
                      <div class="ml-auto flex space-x-1">
                        <div class="w-3 h-3 bg-black rounded-sm"></div>
                        <div class="w-3 h-3 bg-gray-400 rounded-sm"></div>
                        <div class="w-3 h-3 bg-white border border-black rounded-sm"></div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div class="mt-3 p-2 bg-gray-50 border border-gray-200 rounded-md">
                <p class="text-xs text-gray-600">
                  <span class="font-medium">💡 Theme Info:</span> Visual styling only - all functionality remains the same
                </p>
              </div>
            </div>

            <!-- User Management (Super User Only) -->
            <div v-if="authStore.isSuperUser && !isDemoMode" class="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-md font-medium text-gray-800">👑 User Management</h4>
                <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Super User</span>
              </div>
              
              <!-- Loading state -->
              <div v-if="usersLoading" class="text-center py-4">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                <p class="mt-2 text-sm text-gray-600">Chargement...</p>
              </div>

              <!-- Error state -->
              <div v-else-if="usersError" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p class="text-sm text-red-700">{{ usersError }}</p>
                <button @click="loadAllUsers" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">
                  Réessayer
                </button>
              </div>

              <!-- Users list -->
              <div v-else class="space-y-3">
                <div v-for="user in allUsers" :key="user.id" 
                     class="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition-colors">
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-gray-900">{{ user.name }}</span>
                        <span v-if="user.email === 'admin@maplyo.com'" 
                              class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          Protégé
                        </span>
                      </div>
                      <p class="text-sm text-gray-600">{{ user.email }}</p>
                      <p v-if="user.company" class="text-xs text-gray-500">{{ user.company }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <select
                        v-model="user.role"
                        @change="updateUserRole(user)"
                        :disabled="user.email === 'admin@maplyo.com' || updatingUserId === user.id"
                        class="text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 py-1"
                        :class="{
                          'bg-gray-100 cursor-not-allowed': user.email === 'admin@maplyo.com',
                          'opacity-50': updatingUserId === user.id
                        }"
                      >
                        <option value="user">👤 User</option>
                        <option value="admin">⭐ Admin</option>
                        <option value="super_user">👑 Super User</option>
                        <option value="read-only">🔒 Read-Only</option>
                      </select>
                      <button
                        v-if="user.email !== 'admin@maplyo.com'"
                        @click="confirmDeleteUser(user)"
                        :disabled="deletingUserId === user.id"
                        class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                        title="Supprimer"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="allUsers.length === 0" class="text-center py-4 text-gray-500 text-sm">
                  Aucun utilisateur trouvé
                </div>
              </div>

              <!-- Role info -->
              <div class="mt-3 p-2 bg-purple-50 border border-purple-200 rounded-md">
                <p class="text-xs text-purple-800">
                  <strong>Super User :</strong> Gestion complète • 
                  <strong>Admin :</strong> Accès étendu • 
                  <strong>User :</strong> Accès standard • 
                  <strong>Read-Only :</strong> Consultation uniquement (aucune modification)
                </p>
              </div>
            </div>

            <!-- Database Operations (Super User Only) -->
            <div v-if="authStore.isSuperUser" class="border rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-medium text-gray-800">Database Operations</h4>
                <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Super User</span>
              </div>
              
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
                        v-model="closingLeadTimes.coldProbability"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        @input="ensureNumberValue('coldProbability', $event)"
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
                        v-model="closingLeadTimes.warmProbability"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        @input="ensureNumberValue('warmProbability', $event)"
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
                        v-model="closingLeadTimes.hotProbability"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        @input="ensureNumberValue('hotProbability', $event)"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <!-- Recurring Leads -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                      <label class="text-sm font-medium text-gray-700">Recurring Leads</label>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        v-model.number="closingLeadTimes.recurring"
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
                        v-model="closingLeadTimes.recurringProbability"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        @input="ensureNumberValue('recurringProbability', $event)"
                        class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <!-- Auto-save info -->
                <div class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p class="text-xs text-blue-800">
                    <svg class="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    Changes will be saved when you close this window
                  </p>
                </div>
              </div>
            </div>

            <!-- Danger Zone (Super User Only) -->
            <div v-if="authStore.isSuperUser" class="border border-red-200 rounded-lg p-4 bg-red-50">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-medium text-red-800">🚨 Danger Zone</h4>
                <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Super User</span>
              </div>
              
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
                
                <!-- Full Database Dump -->
                <button
                  @click="downloadFullDatabaseDump"
                  :disabled="dumpLoading"
                  class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="!dumpLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ dumpLoading ? 'Dumping...' : 'Full Database Dump' }}
                </button>
                <p class="text-xs text-purple-700">Download a complete backup of the entire database (all users, all data). This includes database structure for intelligent imports.</p>
                
                <!-- Full Database Import -->
                <div class="relative">
                  <input
                    ref="fullImportFileInput"
                    type="file"
                    accept=".json"
                    @change="handleFullDatabaseImport"
                    class="hidden"
                  />
                  <button
                    @click="$refs.fullImportFileInput.click()"
                    :disabled="fullImportLoading"
                    class="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="!fullImportLoading" class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {{ fullImportLoading ? 'Importing...' : 'Full Database Import' }}
                  </button>
                  <p class="text-xs text-indigo-700 mt-1">Import a complete database dump. ⚠️ This will REPLACE ALL DATA in the database! Supports intelligent schema migration.</p>
                </div>
                
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

    <!-- Funnel Report Modal -->
    <FunnelReportModal
      :is-visible="showFunnelReportModal"
      :prospects="forecastProspects"
      :current-tab-name="currentTabName"
      @close="closeFunnelReportModal"
    />

    <!-- Companies Management Modal -->
    <CompanyManagementModal
      :is-visible="showCompaniesModal"
      :initial-company-id="selectedCompanyId"
      @close="closeCompaniesModal"
      @open-prospect="openProspectFromCompany"
    />
    </div>
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
import { useDemoStore } from '@/stores/demo'
import TabsManager from '@/components/TabsManager.vue'
import MapView from '@/components/MapView.vue'
import GlobalTodoPanel from '@/components/GlobalTodoPanel.vue'
import FunnelProspectModal from '@/components/FunnelProspectModal.vue'
import CsvImportModal from '@/components/CsvImportModal.vue'
import ForecastModal from '@/components/ForecastModal.vue'
import FunnelReportModal from '@/components/FunnelReportModal.vue'
import CompanyManagementModal from '@/components/CompanyManagementModal.vue'
import api, { profileAPI, usersAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const prospectsStore = useProspectsStore()
const demoStore = useDemoStore()

const showAddModal = ref(false)
const showEditModal = ref(false)
const editingProspect = ref(null)
const selectedProspect = ref(null)
const modalInitialStatus = ref('cold')
const tabsManager = ref(null)
const currentTabId = ref('default')
const showSettingsMenu = ref(false)
const showSystemSettings = ref(false)
const showDeleteAllModal = ref(false)
const deleteConfirmText = ref('')
const deleteLoading = ref(false)
const deleteMessage = ref('')
const deleteMessageType = ref('success') // 'success' or 'error'
// Database import/export variables
const importLoading = ref(false)
const exportLoading = ref(false)
// Full database dump/import variables
const dumpLoading = ref(false)
const fullImportLoading = ref(false)
const fullImportFileInput = ref(null)
const systemMessage = ref('')
const systemMessageType = ref('success') // 'success' or 'error'
const fileInput = ref(null)
const databaseFileInput = ref(null)
const filteredProspectsForMap = ref([])
const showMapOnMobile = ref(false)
const currentTheme = ref('default') // 'default' or 'retro'
const sidebarWidth = ref(400) // Largeur par défaut du sidebar
const isResizing = ref(false)
const modalKey = ref(0) // Pour forcer le re-rendu du modal
const mobileView = ref('funnel') // Vue active sur mobile: 'funnel', 'map', 'todo'
const isMobile = ref(false) // Détection mobile

// Read-only mode check
const isReadOnly = computed(() => authStore.isReadOnly)

// Demo mode check
const isDemoMode = computed(() => demoStore.isDemoMode)

// User Management (Super User)
const allUsers = ref([])
const usersLoading = ref(false)
const usersError = ref(null)
const updatingUserId = ref(null)
const deletingUserId = ref(null)
const userToDelete = ref(null)

// Closing Lead Time Settings
const closingLeadTimes = ref({
  cold: 12,  // mois
  warm: 6,   // mois
  hot: 3,    // mois
  recurring: 12, // mois
  // Probabilités de conversion par catégorie (en pourcentage)
  coldProbability: 0,  // Changé de 15 à 0 pour correspondre aux nouvelles attentes
  warmProbability: 45,
  hotProbability: 80,
  recurringProbability: 30
})
const leadTimeLoading = ref(false)

// CSV Import Modal
const showCsvImportModal = ref(false)

// Forecast Modal
const showForecastModal = ref(false)

// Funnel Report Modal
const showFunnelReportModal = ref(false)

// Companies Management Modal
const showCompaniesModal = ref(false)
const selectedCompanyId = ref(null)

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
  // Si on est sur "All Leads", retourner TOUS les prospects
  if (currentTabName.value === 'All Leads') {
    return prospectsStore.prospects
  }
  
  // Sinon, filtrer par onglet spécifique
  if (currentTabId.value === 'default') {
    return prospectsStore.prospects
  } else {
    const filtered = prospectsStore.prospects.filter(p => {
      return p.tabId === currentTabId.value || p.tab_id === currentTabId.value
    })
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
    return currentTab ? currentTab.name : 'All Leads'
  }
  return 'All Leads'
})

// Prospects for forecast (current tab only - strict)
const forecastProspects = computed(() => {
  // Si on est sur "All Leads", utiliser TOUS les prospects du système
  if (currentTabName.value === 'All Leads') {
    return prospectsStore.prospects
  }
  
  // Sinon, utiliser UNIQUEMENT les prospects de l'onglet courant
  return visibleProspects.value
})

// Gérer les prospects filtrés depuis ProspectsList
function onFilteredProspects(filteredProspects) {
  filteredProspectsForMap.value = filteredProspects
}

// Naviguer vers l'onglet d'origine d'un prospect
function onNavigateToTab(tabId, prospectId) {
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
    return
  }
  
  try {
    navigationMethod(tabId)
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

function viewProspectFromTodo(prospectId) {
  // Trouver le prospect par son ID
  const prospect = prospectsStore.prospects.find(p => p.id === prospectId)
  if (prospect) {
    // Sélectionner le prospect (cela déclenche aussi le scroll)
    selectProspect(prospect)
  }
}

function editProspectFromTodo(prospectId) {
  // Trouver le prospect par son ID
  const prospect = prospectsStore.prospects.find(p => p.id === prospectId)
  if (prospect) {
    // Ouvrir directement la modal d'édition
    editProspect(prospect)
  }
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

function openAddModal(data) {
  if (isReadOnly.value) {
    alert('Read-only mode: You cannot add prospects')
    return
  }
  
  // Gérer les deux formats : soit une string simple, soit un objet
  if (typeof data === 'string') {
    modalInitialStatus.value = data
  } else if (data && typeof data === 'object' && data.status) {
    modalInitialStatus.value = data.status
  } else if (data === undefined || data === null) {
    // Cas par défaut quand aucun paramètre n'est passé
    modalInitialStatus.value = 'cold'
  } else {
    modalInitialStatus.value = 'cold'
  }
  
  editingProspect.value = null
  showAddModal.value = true
}

function editProspect(prospect) {
  if (isReadOnly.value) {
    alert('Read-only mode: You cannot edit prospects')
    return
  }
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

async function deleteProspect(prospect) {
  if (isReadOnly.value) {
    alert('Read-only mode: You cannot delete prospects')
    return
  }
  if (confirm('Are you sure you want to delete this lead?')) {
    await prospectsStore.deleteProspect(prospect.id)
  }
}

async function reorderProspects(newOrder) {
  if (isReadOnly.value) {
    alert('Read-only mode: You cannot reorder prospects')
    return
  }
  await prospectsStore.reorderProspects(newOrder)
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingProspect.value = null
  modalInitialStatus.value = 'cold'  // Réinitialiser le status
  
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
  
  // Load all users if super user
  if (authStore.isSuperUser) {
    await loadAllUsers()
  }
}

// User Management functions (Super User only)
async function loadAllUsers() {
  usersLoading.value = true
  usersError.value = null
  
  try {
    const response = await usersAPI.getAll()
    allUsers.value = response.data
  } catch (err) {
    console.error('Error loading users:', err)
    usersError.value = err.response?.data?.error || 'Erreur lors du chargement des utilisateurs'
  } finally {
    usersLoading.value = false
  }
}

async function updateUserRole(user) {
  updatingUserId.value = user.id
  
  try {
    await usersAPI.updateRole(user.id, user.role)
    console.log(`✅ Role updated for user ${user.id} to ${user.role}`)
  } catch (err) {
    console.error('Error updating user role:', err)
    usersError.value = err.response?.data?.error || 'Erreur lors de la mise à jour du rôle'
    // Reload users to reset the role value
    await loadAllUsers()
  } finally {
    updatingUserId.value = null
  }
}

function confirmDeleteUser(user) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} (${user.email}) ?\n\nCette action est irréversible et supprimera toutes les données associées.`)) {
    deleteUserAccount(user)
  }
}

async function deleteUserAccount(user) {
  deletingUserId.value = user.id
  
  try {
    await usersAPI.delete(user.id)
    console.log(`✅ User ${user.id} deleted`)
    // Remove user from list
    allUsers.value = allUsers.value.filter(u => u.id !== user.id)
    systemMessage.value = `Utilisateur ${user.name} supprimé avec succès`
    systemMessageType.value = 'success'
  } catch (err) {
    console.error('Error deleting user:', err)
    usersError.value = err.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur'
    systemMessage.value = usersError.value
    systemMessageType.value = 'error'
  } finally {
    deletingUserId.value = null
  }
}

async function closeSystemSettings() {
  // Sauvegarder les lead times avant de fermer
  await saveClosingLeadTimes()
  
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
    const response = await api.get('/settings/closing-lead-times')
    const data = response.data
    
    if (data) {
      if (data.success && data.settings) {
        console.log('📥 Loaded settings from server:', data.settings);
        closingLeadTimes.value = {
          cold: data.settings.cold !== undefined ? data.settings.cold : 12,
          warm: data.settings.warm !== undefined ? data.settings.warm : 6,
          hot: data.settings.hot !== undefined ? data.settings.hot : 3,
          recurring: data.settings.recurring !== undefined ? data.settings.recurring : 12,
          coldProbability: data.settings.coldProbability !== undefined ? data.settings.coldProbability : 0,
          warmProbability: data.settings.warmProbability !== undefined ? data.settings.warmProbability : 45,
          hotProbability: data.settings.hotProbability !== undefined ? data.settings.hotProbability : 80,
          recurringProbability: data.settings.recurringProbability !== undefined ? data.settings.recurringProbability : 30
        }
        console.log('✅ Final closingLeadTimes after loading:', closingLeadTimes.value);
      }
    }
  } catch (error) {
    console.error('Error loading closing lead times:', error)
  }
}

async function saveClosingLeadTimes() {
  // Sauvegarde silencieuse sans spinner ni message de succès
  
  try {
    const payload = {
      cold: Number(closingLeadTimes.value.cold),
      warm: Number(closingLeadTimes.value.warm),
      hot: Number(closingLeadTimes.value.hot),
      recurring: Number(closingLeadTimes.value.recurring),
      coldProbability: Number(closingLeadTimes.value.coldProbability || 0),
      warmProbability: Number(closingLeadTimes.value.warmProbability || 0),
      hotProbability: Number(closingLeadTimes.value.hotProbability || 0),
      recurringProbability: Number(closingLeadTimes.value.recurringProbability || 0)
    }
    
    console.log('💾 Auto-saving lead times:', payload)
    
    const response = await api.post('/settings/closing-lead-times', payload)
    const data = response.data
    
    if (data.success) {
      console.log('✅ Lead times saved successfully')
      // Pas de message de succès pour éviter le spam
    } else {
      throw new Error(data.error || 'Failed to save settings')
    }
  } catch (error) {
    console.error('❌ Error saving closing lead times:', error)
    // Afficher seulement en cas d'erreur
    systemMessage.value = 'Failed to save lead time settings'
    systemMessageType.value = 'error'
  }
}

// Fonction pour s'assurer que les valeurs sont des nombres
function ensureNumberValue(field, event) {
  const value = event.target.value
  const numValue = value === '' ? 0 : Number(value)
  console.log(`🔢 Setting ${field} to:`, numValue, 'from input:', value)
  closingLeadTimes.value[field] = isNaN(numValue) ? 0 : numValue
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

// Full Database Dump function
async function downloadFullDatabaseDump() {
  if (!confirm('Download a complete dump of the entire database? This includes ALL users and data.')) {
    return
  }
  
  dumpLoading.value = true
  systemMessage.value = ''
  
  try {
    const response = await fetch('/api/database/full-dump', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Dump failed: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `maplyo-full-dump-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    systemMessage.value = 'Full database dump downloaded successfully!'
    systemMessageType.value = 'success'
    
  } catch (error) {
    console.error('Error downloading full database dump:', error)
    systemMessage.value = 'Error downloading full database dump: ' + error.message
    systemMessageType.value = 'error'
  } finally {
    dumpLoading.value = false
    
    // Clear message after 5 seconds
    setTimeout(() => {
      systemMessage.value = ''
    }, 5000)
  }
}

// Full Database Import function
async function handleFullDatabaseImport(event) {
  const file = event.target.files[0]
  if (!file) return
  
  if (!confirm('⚠️ DANGER: This will REPLACE ALL DATA in the database! Are you absolutely sure? This action cannot be undone.')) {
    // Reset file input
    event.target.value = ''
    return
  }
  
  if (!confirm('Last warning: This will delete ALL users, ALL prospects, ALL data and replace with the import file. Continue?')) {
    // Reset file input
    event.target.value = ''
    return
  }
  
  fullImportLoading.value = true
  systemMessage.value = ''
  
  try {
    const fileContent = await file.text()
    const importData = JSON.parse(fileContent)
    
    console.log('📤 Starting full database import...')
    
    const response = await fetch('/api/database/full-import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(importData)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Import failed')
    }
    
    console.log('✅ Full database import result:', result)
    
    let message = 'Full database import completed!\n'
    message += `Tables imported: ${result.imported_tables}\n`
    message += `Tables skipped: ${result.skipped_tables}\n`
    message += `Total rows imported: ${Object.values(result.imported_rows).reduce((a, b) => a + b, 0)}`
    
    if (result.schema_migrations.length > 0) {
      message += `\n\nSchema migrations:\n${result.schema_migrations.join('\n')}`
    }
    
    if (result.errors.length > 0) {
      message += `\n\nErrors (${result.errors.length}):\n${result.errors.slice(0, 5).join('\n')}`
      if (result.errors.length > 5) {
        message += `\n... and ${result.errors.length - 5} more errors`
      }
    }
    
    systemMessage.value = message
    systemMessageType.value = result.errors.length > 0 ? 'warning' : 'success'
    
    // Since this replaces all data, we should refresh everything
    await prospectsStore.fetchProspects()
    
    // Refresh tabs if using TabsManager
    if (tabsManager.value && tabsManager.value.loadTabs) {
      await tabsManager.value.loadTabs()
    }
    
    // Note: User might need to re-login if their account was replaced
    if (result.imported_tables === 0) {
      systemMessage.value = 'Import completed but no tables were imported. Check console for details.'
      systemMessageType.value = 'error'
    }
    
  } catch (error) {
    console.error('Error importing full database:', error)
    systemMessage.value = 'Error importing full database: ' + error.message
    systemMessageType.value = 'error'
  } finally {
    fullImportLoading.value = false
    // Reset file input
    event.target.value = ''
    
    // Clear message after 10 seconds (longer for import results)
    setTimeout(() => {
      systemMessage.value = ''
    }, 10000)
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

// Fonctions pour le rapport de funnel
function openFunnelReportModal() {
  showSettingsMenu.value = false
  showFunnelReportModal.value = true
}

function closeFunnelReportModal() {
  showFunnelReportModal.value = false
}

// Fonctions pour la gestion des entreprises
function openCompaniesModal(companyId = null) {
  showSettingsMenu.value = false
  selectedCompanyId.value = companyId
  showCompaniesModal.value = true
}

function closeCompaniesModal() {
  showCompaniesModal.value = false
  selectedCompanyId.value = null
}

function openProspectFromCompany(prospect) {
  // Ouvrir la modal du prospect en mode édition
  editingProspect.value = { ...prospect }
  showEditModal.value = true
}

function handleCompanyChanged(data) {
  // Propager l'événement vers CompanyManagementModal via un ref
  console.log('🔄 Dashboard: Company changed for prospect', data)
  // Le store prospectsStore a déjà été mis à jour par saveField dans FunnelProspectModal
  // On pourrait forcer un rafraîchissement si nécessaire
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
          console.error('Error during import:', result.error)
        }
      } catch (error) {
        errorCount++
        console.error('Error during import:', error)
      }
    }

    alert(`Import completed!\n${importedCount} prospects imported\n${errorCount} errors`)
    
    // Réinitialiser l'input file
    event.target.value = ''
    
  } catch (error) {
    console.error('Error reading file:', error)
    alert('Error reading CSV file')
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

// Méthode pour appliquer le thème
const applyTheme = () => {
  const body = document.body
  
  // Supprimer toutes les classes de thème existantes
  body.classList.remove('theme-default', 'theme-retro')
  
  // Appliquer le nouveau thème
  if (currentTheme.value === 'retro') {
    body.classList.add('theme-retro')
  } else {
    body.classList.add('theme-default')
  }
  
  // Sauvegarder le thème dans localStorage
  localStorage.setItem('maplyo_theme', currentTheme.value)
}

// Charger le thème sauvegardé
const loadTheme = () => {
  const savedTheme = localStorage.getItem('maplyo_theme')
  if (savedTheme) {
    currentTheme.value = savedTheme
    applyTheme()
  } else {
    // Thème par défaut
    currentTheme.value = 'default'
    applyTheme()
  }
}

// Méthode pour aller à la page d'administration
const goToAdmin = () => {
  router.push('/admin')
}

// Méthode de déconnexion avec redirection
const handleLogout = () => {
  // Nettoyer les données locales spécifiques à l'utilisateur
  localStorage.removeItem('maplyo_active_tab_id')
  localStorage.removeItem('maplyo_sidebar_width')
  
  authStore.logout()
  router.push('/login')
}

// Method to exit demo mode
const exitDemoMode = () => {
  // Exit demo mode
  demoStore.exitDemoMode()
  
  // Logout demo user
  authStore.logout()
  
  // Redirect to login page
  router.push('/login')
}

// Détecter si on est sur mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024 // lg breakpoint
}

// Gérer le changement de taille d'écran
const handleResize = () => {
  checkMobile()
}

onMounted(async () => {
  await prospectsStore.fetchProspects()
  
  // Charger le thème sauvegardé
  loadTheme()
  
  // Charger les paramètres de closing lead times
  await loadClosingLeadTimes()
  
  // Écouter les événements des onglets
  if (tabsManager.value) {
    currentTabId.value = tabsManager.value.activeTabId || 'default'
  }
  
  // Détecter le mode mobile
  checkMobile()
  window.addEventListener('resize', handleResize)
  
  // Ajouter l'écouteur pour fermer le menu
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
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

<style>
/* 🕹️ THEME RETRO 8-BIT - Styles globaux */
body.theme-retro {
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  background-color: #f8f8f8 !important;
  color: #000000 !important;
}

/* Variables CSS pour le thème rétro */
body.theme-retro {
  --retro-bg: #f8f8f8;
  --retro-fg: #000000;
  --retro-border: #000000;
  --retro-accent: #404040;
  --retro-hover: #e0e0e0;
  --retro-success: #606060;
  --retro-warning: #808080;
  --retro-error: #404040;
}

/* Interface principale */
body.theme-retro .bg-white {
  background-color: var(--retro-bg) !important;
  border: 2px solid var(--retro-border) !important;
}

body.theme-retro .bg-gray-50,
body.theme-retro .bg-gray-100 {
  background-color: #e8e8e8 !important;
  color: var(--retro-fg) !important;
}

body.theme-retro .bg-blue-600,
body.theme-retro .bg-blue-500,
body.theme-retro .bg-green-600,
body.theme-retro .bg-red-600,
body.theme-retro .bg-yellow-500,
body.theme-retro .bg-indigo-600,
body.theme-retro .bg-purple-600 {
  background-color: var(--retro-accent) !important;
  color: #ffffff !important;
  border: 2px solid var(--retro-border) !important;
  border-radius: 0 !important;
}

body.theme-retro .hover\:bg-blue-700:hover,
body.theme-retro .hover\:bg-green-700:hover,
body.theme-retro .hover\:bg-red-700:hover,
body.theme-retro .hover\:bg-yellow-600:hover,
body.theme-retro .hover\:bg-indigo-700:hover,
body.theme-retro .hover\:bg-purple-700:hover {
  background-color: var(--retro-border) !important;
}

/* Boutons et éléments interactifs */
body.theme-retro button,
body.theme-retro .btn {
  font-family: inherit !important;
  border-radius: 0 !important;
  border: 2px solid var(--retro-border) !important;
  background-color: var(--retro-hover) !important;
  color: var(--retro-fg) !important;
  font-weight: bold !important;
  text-transform: uppercase !important;
  font-size: 12px !important;
  letter-spacing: 1px !important;
}

body.theme-retro button:hover {
  background-color: var(--retro-accent) !important;
  color: #ffffff !important;
}

/* Inputs et formulaires */
body.theme-retro input,
body.theme-retro textarea,
body.theme-retro select {
  border: 2px solid var(--retro-border) !important;
  border-radius: 0 !important;
  background-color: #ffffff !important;
  color: var(--retro-fg) !important;
  font-family: inherit !important;
}

body.theme-retro input:focus,
body.theme-retro textarea:focus,
body.theme-retro select:focus {
  outline: 2px solid var(--retro-border) !important;
  outline-offset: 2px !important;
  box-shadow: none !important;
}

/* Cartes et conteneurs */
body.theme-retro .rounded,
body.theme-retro .rounded-lg,
body.theme-retro .rounded-md {
  border-radius: 0 !important;
  border: 2px solid var(--retro-border) !important;
}

body.theme-retro .shadow,
body.theme-retro .shadow-lg,
body.theme-retro .shadow-md {
  box-shadow: 4px 4px 0px var(--retro-border) !important;
}

/* Textes et titres */
body.theme-retro h1, 
body.theme-retro h2, 
body.theme-retro h3, 
body.theme-retro h4 {
  color: var(--retro-fg) !important;
  font-weight: bold !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

body.theme-retro .text-gray-600,
body.theme-retro .text-gray-700,
body.theme-retro .text-gray-800,
body.theme-retro .text-blue-600,
body.theme-retro .text-green-600,
body.theme-retro .text-red-600,
body.theme-retro .text-yellow-600,
body.theme-retro .text-indigo-600,
body.theme-retro .text-purple-600 {
  color: var(--retro-fg) !important;
}

/* Statuts colorés avec style rétro - UNIQUEMENT niveaux de gris */
body.theme-retro .prospect-status-hot {
  background-color: #202020 !important;
  color: #ffffff !important;
  border: 2px solid var(--retro-border) !important;
}

body.theme-retro .prospect-status-warm {
  background-color: #606060 !important;
  color: #ffffff !important;
  border: 2px solid var(--retro-border) !important;
}

body.theme-retro .prospect-status-cold {
  background-color: #a0a0a0 !important;
  color: #000000 !important;
  border: 2px solid var(--retro-border) !important;
}

body.theme-retro .prospect-status-won {
  background-color: #808080 !important;
  color: #ffffff !important;
  border: 2px solid var(--retro-border) !important;
}

/* Carte - Style monochrome */
body.theme-retro .mapboxgl-map,
body.theme-retro #map {
  filter: grayscale(100%) contrast(120%) brightness(90%) !important;
}

/* Marqueurs de carte en noir et blanc */
body.theme-retro .mapboxgl-marker,
body.theme-retro .marker {
  filter: grayscale(100%) contrast(150%) !important;
}

/* Popup de carte */
body.theme-retro .mapboxgl-popup,
body.theme-retro .mapboxgl-popup-content {
  background-color: var(--retro-bg) !important;
  color: var(--retro-fg) !important;
  border: 2px solid var(--retro-border) !important;
  border-radius: 0 !important;
  box-shadow: 4px 4px 0px var(--retro-border) !important;
}

/* Contrôles de carte */
body.theme-retro .mapboxgl-ctrl,
body.theme-retro .mapboxgl-ctrl-group {
  background-color: var(--retro-bg) !important;
  border: 2px solid var(--retro-border) !important;
  border-radius: 0 !important;
  box-shadow: 2px 2px 0px var(--retro-border) !important;
}

body.theme-retro .mapboxgl-ctrl-group button {
  background-color: var(--retro-hover) !important;
  color: var(--retro-fg) !important;
  border: 1px solid var(--retro-border) !important;
}

body.theme-retro .mapboxgl-ctrl-group button:hover {
  background-color: var(--retro-accent) !important;
  color: #ffffff !important;
}

/* FUNNEL - Forcer le style monochrome */
body.theme-retro .funnel-stage,
body.theme-retro .prospect-card,
body.theme-retro .prospect-item {
  background-color: var(--retro-bg) !important;
  color: var(--retro-fg) !important;
  border: 2px solid var(--retro-border) !important;
  border-radius: 0 !important;
}

/* Étapes du funnel en niveaux de gris */
body.theme-retro .funnel-stage:nth-child(1) {
  background-color: #f0f0f0 !important;
}

body.theme-retro .funnel-stage:nth-child(2) {
  background-color: #e0e0e0 !important;
}

body.theme-retro .funnel-stage:nth-child(3) {
  background-color: #d0d0d0 !important;
}

body.theme-retro .funnel-stage:nth-child(4) {
  background-color: #c0c0c0 !important;
}

/* Suppression de toutes les couleurs sur les éléments du funnel */
body.theme-retro .funnel-stage *,
body.theme-retro .prospect-card *,
body.theme-retro .prospect-item * {
  background-color: inherit !important;
  color: var(--retro-fg) !important;
}

/* Canvas et éléments graphiques - force monochrome */
body.theme-retro canvas,
body.theme-retro svg,
body.theme-retro img {
  filter: grayscale(100%) contrast(120%) !important;
}

/* Éléments spécifiques de la carte Mapbox */
body.theme-retro .mapboxgl-canvas,
body.theme-retro .mapboxgl-canvas-container {
  filter: grayscale(100%) contrast(120%) brightness(90%) !important;
}

/* Toutes les couleurs de fond forcées en monochrome */
body.theme-retro [style*="background-color"],
body.theme-retro [style*="background"],
body.theme-retro [class*="bg-"] {
  background-color: var(--retro-bg) !important;
  background-image: none !important;
}

/* Toutes les couleurs de texte forcées en noir */
body.theme-retro [style*="color"],
body.theme-retro [class*="text-"] {
  color: var(--retro-fg) !important;
}

/* Suppression des arrondis et ajout de bordures carrées */
body.theme-retro * {
  border-radius: 0 !important;
}

/* Style des onglets */
body.theme-retro .tab-button {
  border: 2px solid var(--retro-border) !important;
  background-color: var(--retro-hover) !important;
  margin-right: 4px !important;
  padding: 8px 16px !important;
}

body.theme-retro .tab-button.active {
  background-color: var(--retro-accent) !important;
  color: #ffffff !important;
}

/* Animation rétro pour les transitions */
body.theme-retro * {
  transition: none !important;
}
</style>
