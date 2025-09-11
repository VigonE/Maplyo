<template>
  <div class="flex flex-col h-full">
    <!-- En-tête de l'onglet -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ tabName }}</h2>
          <p class="text-sm text-gray-500">{{ visibleProspectsCount }} lead(s) • Weighted Total: {{ totalRevenue }}</p>
        </div>
        <button
          @click="$emit('add-prospect')"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          Add
        </button>
      </div>
      
      <!-- Champ de recherche -->
      <div class="mt-4 mb-4 px-4">
        <div class="relative">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Search leads by name, company, email..."
            class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              @click="searchQuery = ''"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="searchQuery" class="text-xs text-gray-500 mt-1">
          {{ searchFilteredCount }} of {{ totalProspectsInTab }} leads match "{{ searchQuery }}"
        </div>
      </div>
      
      <!-- Slider de filtrage par revenu -->
      <div class="px-4 pb-3">
        <div class="mb-2">
          <label class="block text-xs font-medium text-gray-600 mb-1">
            Filter by minimum weighted revenue
            <span v-if="prospectsAboveSmoothedMax > 0" class="text-purple-600">
              (Smoothed at 90%)
            </span>
          </label>
          <div class="text-xs text-gray-500 mb-2">
            Filter: {{ formatCurrency(actualRevenueFilter) }} - {{ formatCurrency(maxRevenue) }} 
            ({{ visibleProspectsCount }}/{{ totalProspectsInTab }} leads)
            <span v-if="prospectsAboveSmoothedMax > 0" class="text-blue-600">
              • {{ prospectsAboveSmoothedMax }} premium lead(s) above
            </span>
          </div>
        </div>
        <div class="relative">
          <!-- Slider -->
          <input
            v-model.number="revenueFilter"
            type="range"
            :min="minRevenue"
            :max="maxRevenue"
            :step="1"
            class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer revenue-slider"
            :style="{ background: sliderBackground }"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>{{ formatCurrency(minRevenue) }}</span>
            <span>{{ formatCurrency(maxRevenue) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu scrollable -->
    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">Chargement...</p>
      </div>
      
      <div v-else-if="visibleProspectsAfterFilter.length === 0" class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <p class="mt-2 text-gray-500">No leads in this revenue range</p>
        <p class="text-sm text-gray-400">Adjust the slider or add leads</p>
      </div>

      <!-- Catégories du funnel verticales -->
      <div v-else class="space-y-4 p-4">
        <div
          v-for="status in statusOrder"
          :key="status"
          :data-status="status"
          class="border border-gray-200 rounded-lg bg-gray-50"
        >
          <!-- En-tête de catégorie -->
          <div 
            class="p-3 border-b border-gray-200 flex items-center justify-between"
            :class="getCategoryHeaderClass(status)"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: getStatusColor(status) }"
              ></div>
              <h3 class="text-sm font-semibold text-gray-900">
                {{ getStatusLabel(status) }}
              </h3>
              <span class="text-xs text-gray-500">
                ({{ getProspectsByStatus(status).length }})
              </span>
            </div>
            <div class="text-sm font-bold text-green-600">
              {{ getCategoryRevenue(status) }}
            </div>
          </div>

          <!-- Zone de drop pour cette catégorie -->
          <div 
            class="min-h-[100px] p-3"
            :class="{ 'bg-blue-50 border-blue-300': isDragOverCategory === status }"
          >
            <draggable
              :model-value="getProspectsByStatus(status)"
              :group="{ name: 'leads', pull: true, put: true }"
              item-key="id"
              @end="onStatusChange"
              @dragover.prevent="isDragOverCategory = status"
              @dragleave="isDragOverCategory = null"
              @drop="isDragOverCategory = null"
              handle=".drag-handle"
              class="space-y-2"
              :animation="200"
              ghost-class="opacity-50"
              chosen-class="dragging"
            >
              <template #item="{ element: prospect }">
                <div
                  class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
                  :class="{ 
                    'ring-2 ring-blue-500 shadow-md': selectedProspect?.id === prospect.id,
                    'opacity-75': prospect.tabId && prospect.tabId !== tabId
                  }"
                  :data-prospect-id="prospect.id"
                  @click="$emit('select', prospect)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600">
                          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                          </svg>
                        </div>
                        <h3 class="text-sm font-medium text-gray-900 truncate">
                          <span v-html="highlightSearchTerm(prospect.name, searchQuery)"></span>
                        </h3>
                        <!-- Badge d'onglet d'origine (seulement dans la vue "All Leads") -->
                        <button
                          v-if="isAllLeadsView && getProspectTabName(prospect)"
                          @click.stop="navigateToProspectTab(prospect)"
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 flex-shrink-0 transition-colors cursor-pointer"
                          :title="'Click to go to tab: ' + getProspectTabName(prospect)"
                        >
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {{ getProspectTabName(prospect) }}
                        </button>
                      </div>
                      
                      <p class="text-xs text-gray-500 mb-2 truncate">
                        📍 <span v-html="highlightSearchTerm(prospect.address || 'No address', searchQuery)"></span>
                      </p>
                      
                      <div class="space-y-2">
                        <!-- Revenue Information -->
                        <div v-if="!editingRevenue[prospect.id] && !editingProbability[prospect.id]" class="space-y-1">
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">Revenue:</span>
                            <div class="flex items-center gap-1">
                              <span class="text-sm font-medium text-gray-700">
                                {{ formatCurrency(prospect.revenue || 0) }}
                              </span>
                              <button
                                @click.stop="startEditingRevenue(prospect)"
                                class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                                title="Edit amount"
                              >
                                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">Probability:</span>
                            <div class="flex items-center gap-1">
                              <span class="text-sm font-medium text-blue-600">
                                {{ prospect.probability_coefficient || 100 }}%
                              </span>
                              <button
                                @click.stop="startEditingProbability(prospect)"
                                class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                                title="Edit probability"
                              >
                                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <div class="flex items-center justify-between border-t pt-1">
                            <span class="text-xs font-medium text-gray-700">Weighted Revenue:</span>
                            <span class="text-sm font-bold text-green-600">
                              💰 {{ formatCurrency(getWeightedRevenue(prospect)) }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Revenue Editing Mode -->
                        <div v-else-if="editingRevenue[prospect.id]" class="space-y-2">
                          <div class="flex items-center gap-2 w-full">
                            <span class="text-sm">💰</span>
                            <input
                              v-model.number="tempRevenue[prospect.id]"
                              type="number"
                              min="0"
                              step="1"
                              :data-prospect-id="prospect.id"
                              @keydown="handleRevenueKeydown($event, prospect)"
                              @blur="saveRevenue(prospect)"
                              @click.stop
                              class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Amount"
                            />
                            <button
                              @click.stop="saveRevenue(prospect)"
                              class="text-green-600 hover:text-green-700 p-1"
                              title="Validate"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              @click.stop="cancelEditingRevenue(prospect.id)"
                              class="text-red-600 hover:text-red-700 p-1"
                              title="Cancel"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">Probability:</span>
                            <span class="text-sm font-medium text-blue-600">
                              {{ prospect.probability_coefficient || 100 }}%
                            </span>
                          </div>
                          
                          <div class="flex items-center justify-between border-t pt-1">
                            <span class="text-xs font-medium text-gray-700">Weighted Revenue:</span>
                            <span class="text-sm font-bold text-green-600">
                              💰 {{ formatCurrency(getWeightedRevenue(prospect)) }}
                            </span>
                          </div>
                        </div>
                        
                        <!-- Probability Editing Mode -->
                        <div v-else-if="editingProbability[prospect.id]" class="space-y-2">
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-gray-500">Revenue:</span>
                            <span class="text-sm font-medium text-gray-700">
                              {{ formatCurrency(prospect.revenue || 0) }}
                            </span>
                          </div>
                          
                          <div class="flex items-center gap-2 w-full">
                            <span class="text-sm">📊</span>
                            <input
                              v-model.number="tempProbability[prospect.id]"
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              :data-prospect-probability-id="prospect.id"
                              @keydown="handleProbabilityKeydown($event, prospect)"
                              @blur="saveProbability(prospect)"
                              @click.stop
                              class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Probability %"
                            />
                            <span class="text-sm text-gray-500">%</span>
                            <button
                              @click.stop="saveProbability(prospect)"
                              class="text-green-600 hover:text-green-700 p-1"
                              title="Validate"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              @click.stop="cancelEditingProbability(prospect.id)"
                              class="text-red-600 hover:text-red-700 p-1"
                              title="Cancel"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div class="flex items-center justify-between border-t pt-1">
                            <span class="text-xs font-medium text-gray-700">Weighted Revenue:</span>
                            <span class="text-sm font-bold text-green-600">
                              💰 {{ formatCurrency(getWeightedRevenue(prospect)) }}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Section des notes -->
                      <div class="mt-2">
                        <div v-if="!editingNotes[prospect.id]" class="relative">
                          <div 
                            class="bg-gray-50 border border-gray-200 rounded-md p-2 min-h-[40px] cursor-pointer hover:bg-gray-100 transition-colors"
                            @click.stop="startEditingNotes(prospect)"
                            title="Click to edit notes"
                          >
                            <div class="flex items-start justify-between">
                              <div class="flex-1">
                                <div v-if="prospect.notes && prospect.notes.trim()" 
                                     class="text-xs text-gray-700 leading-relaxed break-words truncate max-w-full">
                                  {{ getPlainTextFromHtml(prospect.notes) }}
                                </div>
                                <div v-else class="text-xs text-gray-400 italic">
                                  Click to add notes...
                                </div>
                              </div>
                              <div class="flex items-center gap-1 ml-1 flex-shrink-0">
                                <!-- Bouton View -->
                                <button
                                  v-if="prospect.notes && prospect.notes.trim()"
                                  @click.stop="openNotesModal(prospect)"
                                  class="text-gray-400 hover:text-green-600 p-1 rounded hover:bg-green-50"
                                  title="View notes in full screen"
                                >
                                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>
                                <!-- Bouton Edit -->
                                <button
                                  @click.stop="startEditingNotes(prospect)"
                                  class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                                  title="Edit notes"
                                >
                                  <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div v-else class="bg-white border-2 border-blue-300 rounded-md p-2 relative">
                          <!-- Éditeur de texte riche Quill avec redimensionnement -->
                          <div class="resizable-notes-editor" :class="`prospect-notes-${prospect.id}`">
                            <QuillEditor
                              v-model:content="tempNotes[prospect.id]"
                              contentType="html"
                              :options="quillOptions"
                              @blur="saveNotes(prospect)"
                              @keydown="handleNotesKeydown($event, prospect)"
                              :style="{ 
                                minHeight: '120px', 
                                maxHeight: 'none', 
                                height: getNotesHeight(prospect.id) 
                              }"
                              class="quill-editor-compact"
                            />
                            <!-- Poignée de redimensionnement -->
                            <div 
                              class="resize-handle"
                              @mousedown="startResizeNotes($event, prospect.id)"
                              title="Drag to resize"
                            >
                              <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                              </svg>
                            </div>
                          </div>
                          <div class="flex justify-end gap-1 mt-2">
                            <button
                              @click.stop="saveNotes(prospect)"
                              class="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50"
                              title="Validate"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              @click.stop="cancelEditingNotes(prospect.id)"
                              class="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                              title="Cancel"
                            >
                              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-1 ml-4">
                      <button
                        @click.stop="$emit('edit', prospect)"
                        class="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click.stop="$emit('delete', prospect)"
                        class="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0016.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>

            <!-- Message pour catégorie vide -->
            <div v-if="getProspectsByStatus(status).length === 0" class="text-center py-6 text-gray-400">
              <p class="text-sm">No {{ getStatusLabel(status).toLowerCase() }} leads</p>
              <p class="text-xs">Drag a card here to change its status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modale pour afficher les notes en plein écran -->
  <div v-if="showNotesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeNotesModal">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] m-4 flex flex-col" @click.stop>
      <!-- En-tête de la modale -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">{{ selectedProspectForNotes?.name }}</h3>
            <p class="text-sm text-gray-500">{{ isEditingInModal ? 'Edit Notes' : 'Notes' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Boutons en mode édition -->
          <template v-if="isEditingInModal">
            <button
              @click="cancelEditingInModal"
              class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              @click="saveNotesFromModal"
              class="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
          </template>
          
          <!-- Bouton Toggle Edit/View en mode lecture -->
          <button
            v-if="!isEditingInModal"
            @click="startEditingInModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600"
            title="Edit notes"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <!-- Bouton fermer -->
          <button
            @click="closeNotesModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenu des notes -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <!-- Mode lecture -->
        <div v-if="!isEditingInModal" class="flex-1 overflow-y-auto p-6">
          <div v-if="selectedProspectForNotes?.notes && selectedProspectForNotes.notes.trim()" 
               class="prose prose-sm max-w-none text-gray-700 leading-relaxed"
               v-html="selectedProspectForNotes.notes">
          </div>
          <div v-else class="text-center py-12 text-gray-400">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-lg font-medium text-gray-500 mb-2">No notes available</p>
            <p class="text-sm text-gray-400">Click the edit button to add notes for this prospect.</p>
          </div>
        </div>

        <!-- Mode édition -->
        <div v-else class="flex-1 flex flex-col p-6">
          <div class="flex-1 border border-gray-200 rounded-lg overflow-hidden quill-editor-modal">
            <QuillEditor
              v-model:content="tempNotesForModal"
              contentType="html"
              :options="quillOptionsModal"
              class="h-full"
              @keydown="handleModalNotesKeydown"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { debounce, throttle } from 'lodash-es'
import draggable from 'vuedraggable'
import { useProspectsStore } from '../stores/prospects'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  tabId: {
    type: String,
    required: true
  },
  tabName: {
    type: String,
    default: 'Prospects'
  },
  selectedProspect: Object,
  isAllLeadsView: {
    type: Boolean,
    default: false
  },
  allTabs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete', 'reorder', 'select', 'add-prospect', 'filtered-prospects', 'navigate-to-tab'])

const prospectsStore = useProspectsStore()
const localProspects = shallowRef([]) // Utiliser shallowRef pour de meilleures performances
const isDragOverCategory = ref(null)
const revenueFilter = ref(0) // Sera mis à jour avec minRevenue quand disponible
const forceRerender = ref(0) // Trigger pour forcer le re-render
const searchQuery = ref('') // Champ de recherche
const searchInput = ref(null) // Référence au champ de recherche

// Cache pour les calculs coûteux
const filteredProspectsCache = new Map()
const revenueStatsCache = ref(null)
const lastCacheKey = ref('')

// Debouncer la recherche pour éviter trop de calculs
const debouncedSearchQuery = ref('')
const updateSearch = debounce((value) => {
  debouncedSearchQuery.value = value
}, 300)

// Watcher pour la recherche avec debounce
watch(searchQuery, (newValue) => {
  updateSearch(newValue)
})

// Fonction pour calculer le revenu pondéré
const getWeightedRevenue = (prospect) => {
  if (!prospect.revenue) return 0
  const probability = prospect.probability_coefficient || 100
  return (prospect.revenue * probability) / 100
}

// Fonction pour obtenir le nom de l'onglet d'origine d'un prospect
const getProspectTabName = (prospect) => {
  if (!props.isAllLeadsView) return null
  
  const prospectTabId = prospect.tabId || prospect.tab_id
  if (!prospectTabId || prospectTabId === 'default') {
    return 'Main Pipeline'
  }
  
  const tab = props.allTabs.find(t => t.id === prospectTabId)
  return tab ? tab.name : 'Unknown Tab'
}

// Fonction pour naviguer vers l'onglet d'origine d'un prospect
const navigateToProspectTab = (prospect) => {
  const prospectTabId = prospect.tabId || prospect.tab_id
  if (prospectTabId && prospectTabId !== 'default') {
    // Émettre un événement pour changer d'onglet
    emit('navigate-to-tab', prospectTabId, prospect.id)
  }
}

// Variables pour l'édition du montant directement sur la carte
const editingRevenue = ref({}) // { prospectId: true/false }
const tempRevenue = ref({}) // { prospectId: newAmount }

// Variables pour l'édition de la probabilité directement sur la carte
const editingProbability = ref({}) // { prospectId: true/false }
const tempProbability = ref({}) // { prospectId: newProbability }

// Variables pour l'édition des notes directement sur la carte
const editingNotes = ref({}) // { prospectId: true/false }
const tempNotes = ref({}) // { prospectId: newNotes }
const notesHeight = ref({}) // { prospectId: height in pixels }
const isResizingNotes = ref({}) // { prospectId: true/false }

// Variables pour la modale des notes
const showNotesModal = ref(false)
const selectedProspectForNotes = ref(null)
const isEditingInModal = ref(false)
const tempNotesForModal = ref('')

// Configuration pour QuillEditor
const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  },
  placeholder: 'Add your notes here... (Esc to cancel)',
  formats: ['bold', 'italic', 'underline', 'list', 'bullet', 'link']
}

// Configuration pour QuillEditor dans la modale (plus d'options)
const quillOptionsModal = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ]
  },
  placeholder: 'Add your detailed notes here... Use the rich formatting options above.',
  formats: ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block', 'header', 'list', 'bullet', 'script', 'indent', 'color', 'background', 'align', 'link']
}

// Ordre des statuts dans le funnel (du plus chaud au plus froid)
const statusOrder = ['hot', 'warm', 'cold', 'won', 'lost']

// Fonction de recherche
const searchInProspect = (prospect, query) => {
  if (!query) return true
  
  const searchTerm = query.toLowerCase()
  const searchFields = [
    prospect.name || '',
    prospect.email || '',
    prospect.company || '',
    prospect.position || '',
    prospect.address || '',
    prospect.phone || '',
    prospect.notes || ''
  ]
  
  return searchFields.some(field => 
    field.toLowerCase().includes(searchTerm)
  )
}

// Fonction pour mettre en évidence les termes de recherche
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
}

// Filtrer les prospects selon l'onglet ET la recherche avec cache optimisé
const filteredProspects = computed(() => {
  const cacheKey = `${props.tabId}-${debouncedSearchQuery.value}-${prospectsStore.prospects.length}`
  
  // Utiliser le cache si la clé n'a pas changé
  if (filteredProspectsCache.has(cacheKey)) {
    return filteredProspectsCache.get(cacheKey)
  }
  
  let prospects = []
  
  // Vérifier si c'est l'onglet "All Leads"
  const currentTab = props.allTabs.find(t => t.id === props.tabId)
  const isAllLeadsTab = props.isAllLeadsView || 
                       (props.tabId && props.tabId.includes('all-leads')) ||
                       props.tabName === 'All Leads' ||
                       (currentTab && currentTab.is_special)
  
  if (isAllLeadsTab || props.tabId === 'default') {
    prospects = prospectsStore.prospects
  } else {
    prospects = prospectsStore.prospects.filter(p => {
      const prospectTabId = p.tabId || p.tab_id
      return prospectTabId === props.tabId
    })
  }
  
  // Appliquer le filtre de recherche seulement si nécessaire
  if (debouncedSearchQuery.value) {
    prospects = prospects.filter(p => searchInProspect(p, debouncedSearchQuery.value))
  }
  
  // Mettre en cache et limiter la taille du cache
  filteredProspectsCache.set(cacheKey, prospects)
  if (filteredProspectsCache.size > 20) {
    const firstKey = filteredProspectsCache.keys().next().value
    filteredProspectsCache.delete(firstKey)
  }
  
  return prospects
})

// Compter les prospects après filtrage par recherche (avant filtrage par revenu)
const searchFilteredCount = computed(() => filteredProspects.value.length)

// Calculer le revenu total
const totalRevenue = computed(() => {
  const total = visibleProspectsAfterFilter.value.reduce((sum, prospect) => {
    return sum + prospectsStore.getWeightedRevenue(prospect)
  }, 0)
  return formatCurrency(total)
})

// Prospects dans cet onglet (avant filtrage par revenu)
const totalProspectsInTab = computed(() => filteredProspects.value.length)

// Calcul du revenu maximum avec mise en cache - seulement recalculé quand les prospects changent
const revenueStats = computed(() => {
  if (filteredProspects.value.length === 0) {
    return {
      maxRevenue: 100000,
      minRevenue: 0,
      prospectsAboveSmoothed: 0,
      smoothedMax: 100000
    }
  }

  const revenues = filteredProspects.value.map(p => getWeightedRevenue(p)).sort((a, b) => a - b)
  const minRevenue = Math.min(...revenues)
  const actualMaxRevenue = Math.max(...revenues)
  
  let smoothedMax = actualMaxRevenue
  let prospectsAboveSmoothed = 0
  
  // Si on a plus de 5 prospects, utiliser le 90e percentile pour éviter les valeurs extrêmes isolées
  if (revenues.length > 5) {
    const percentile90Index = Math.floor(revenues.length * 0.9)
    smoothedMax = revenues[percentile90Index]
    prospectsAboveSmoothed = revenues.filter(r => r > smoothedMax).length
  }
  
  // Log seulement lors du premier calcul ou si les données ont vraiment changé
  console.log('� Revenue stats calculated:', {
    prospects: filteredProspects.value.length,
    minRevenue,
    maxRevenue: actualMaxRevenue, // Le vrai maximum utilisé pour le slider
    smoothedMax,
    prospectsAboveSmoothed
  })
  
  return {
    maxRevenue: actualMaxRevenue, // Utiliser le vrai maximum pour le slider
    minRevenue,
    prospectsAboveSmoothed,
    smoothedMax
  }
})

// Accès simplifié aux statistiques
const maxRevenue = computed(() => revenueStats.value.maxRevenue)
const minRevenue = computed(() => revenueStats.value.minRevenue)
const prospectsAboveSmoothedMax = computed(() => revenueStats.value.prospectsAboveSmoothed)

// Le filtre de revenu utilise maintenant directement la valeur du slider
const actualRevenueFilter = computed(() => revenueFilter.value)

// Prospects filtrés par revenu AND par onglet
const visibleProspectsAfterFilter = computed(() => {
  return filteredProspects.value.filter(p => getWeightedRevenue(p) >= actualRevenueFilter.value)
})

// Compter les prospects visibles après filtrage
const visibleProspectsCount = computed(() => visibleProspectsAfterFilter.value.length)

// Émettre les prospects filtrés vers le parent pour la carte
watch(visibleProspectsAfterFilter, (filteredProspects) => {
  emit('filtered-prospects', filteredProspects)
}, { immediate: true })

// Initialiser le filtre de revenu avec la valeur minimale
watch(minRevenue, (newMinRevenue) => {
  if (revenueFilter.value === 0 && newMinRevenue > 0) {
    revenueFilter.value = newMinRevenue
  }
}, { immediate: true })

// Background du slider avec gradient coloré
const sliderBackground = computed(() => {
  const range = maxRevenue.value - minRevenue.value
  const position = range > 0 ? ((revenueFilter.value - minRevenue.value) / range) * 100 : 0
  return `linear-gradient(to right, 
    #ef4444 0%, 
    #f59e0b ${position/2}%, 
    #10b981 ${position}%, 
    #e5e7eb ${position}%, 
    #e5e7eb 100%)`
})

const loading = computed(() => prospectsStore.loading)

// Synchroniser localProspects avec filteredProspects, mais sans boucle
watch(filteredProspects, (newProspects) => {
  localProspects.value = [...newProspects]
}, { immediate: true })

// Watch les changements de tabId pour recalculer
watch(() => props.tabId, () => {
  localProspects.value = [...filteredProspects.value]
})

// Obtenir les prospects par statut (après filtrage par revenu)
function getProspectsByStatus(status) {
  // Utiliser forceRerender pour déclencher la réactivité si nécessaire
  const _ = forceRerender.value
  const prospects = visibleProspectsAfterFilter.value
    .filter(p => p.status === status)
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) // Trier par display_order
  console.log(`🔍 getProspectsByStatus(${status}):`, prospects.map(p => ({ id: p.id, name: p.name, display_order: p.display_order })))
  return prospects
}

// Calculer le revenu par catégorie
function getCategoryRevenue(status) {
  const prospects = getProspectsByStatus(status)
  const total = prospects.reduce((sum, prospect) => {
    return sum + prospectsStore.getWeightedRevenue(prospect)
  }, 0)
  return formatCurrency(total)
}

// Gestion du changement de statut par drag & drop
async function onStatusChange(evt) {
  console.log('🎯 onStatusChange triggered', evt)
  
  // Gérer le réordonnement au sein de la même catégorie
  if (evt.to === evt.from) {
    console.log('🔄 Reordering within same category')
    const targetCategory = evt.to.closest('[data-status]')
    const status = targetCategory?.dataset.status
    
    if (status) {
      console.log('📍 Drag event details:', {
        oldIndex: evt.oldIndex,
        newIndex: evt.newIndex,
        status: status
      })
      
      // Si l'index n'a pas changé, pas besoin de réorganiser
      if (evt.oldIndex === evt.newIndex) {
        console.log('📍 Same position, no reorder needed')
        return
      }
      
      // Récupérer la liste actuelle des prospects de cette catégorie
      const categoryProspects = getProspectsByStatus(status)
      console.log('📋 Current category prospects:', categoryProspects.map(p => ({ id: p.id, name: p.name })))
      
      // Créer le nouvel ordre en déplaçant l'élément
      const newOrder = [...categoryProspects]
      const [movedProspect] = newOrder.splice(evt.oldIndex, 1)
      newOrder.splice(evt.newIndex, 0, movedProspect)
      
      const newCategoryOrder = newOrder.map(p => p.id)
      console.log('📋 New order for category', status, ':', newCategoryOrder)
      
      // Au lieu de créer un ordre global complexe, envoyons juste l'ordre de cette catégorie
      // avec le statut pour que le serveur puisse gérer l'ordre par catégorie
      try {
        const result = await prospectsStore.reorderProspectsInCategory(status, newCategoryOrder)
        if (result.success) {
          console.log(`✅ Prospects reordered successfully within ${status}`)
          // Attendre un peu plus longtemps pour que la base de données soit bien mise à jour
          await new Promise(resolve => setTimeout(resolve, 300))
          // Recharger les données pour avoir l'ordre correct
          await prospectsStore.fetchProspects(true) // Force le refresh
          console.log('🔄 Data refreshed after reorder')
          
          // Forcer une mise à jour de Vue après rechargement des données
          await nextTick()
          forceRerender.value++ // Forcer le re-render des composants
          console.log('🔄 Vue updated after reorder')
        } else {
          console.error('❌ Failed to reorder prospects:', result.error)
        }
      } catch (error) {
        console.error('❌ Error reordering prospects:', error)
      }
    }
    return
  }

  // Ne traiter que les mouvements entre containers différents
  if (evt.to !== evt.from) {
    const targetCategory = evt.to.closest('[data-status]')
    const sourceCategory = evt.from.closest('[data-status]')
    const newStatus = targetCategory?.dataset.status
    const oldStatus = sourceCategory?.dataset.status
    const prospectId = parseInt(evt.item.dataset.prospectId)
    
    console.log('🔄 Moving prospect', prospectId, 'from', oldStatus, 'to', newStatus)
    
    if (newStatus && prospectId && newStatus !== oldStatus) {
      // Trouver le prospect dans notre liste locale
      const prospect = filteredProspects.value.find(p => p.id === prospectId)
      if (prospect) {
        try {
          // Créer un objet avec toutes les propriétés nécessaires du prospect
          const updateData = {
            name: prospect.name,
            email: prospect.email || '',
            phone: prospect.phone || '',
            company: prospect.company || '',
            position: prospect.position || '',
            address: prospect.address || '',
            status: newStatus,
            revenue: prospect.revenue || 0,
            probability_coefficient: prospect.probability_coefficient, // Préserver la probabilité existante
            notes: prospect.notes || '',
            tabId: prospect.tabId || prospect.tab_id || 'default'
          }
          
          console.log('📝 Update data:', updateData)
          
          const result = await prospectsStore.updateProspect(prospectId, updateData)
          if (result.success) {
            console.log(`✅ Prospect ${prospectId} moved to ${newStatus}`)
          } else {
            console.error('❌ Failed to update prospect:', result.error)
          }
        } catch (error) {
          console.error('❌ Error updating prospect status:', error)
        }
      }
    }
  }
}

function onReorder() {
  const newOrder = localProspects.value.map(p => p.id)
  emit('reorder', newOrder)
}

function getStatusLabel(status) {
  const labels = {
    'cold': 'Cold',
    'warm': 'Warm',
    'hot': 'Hot',
    'won': 'Won',
    'lost': 'Lost'
  }
  return labels[status] || status || 'Unknown'
}

function getStatusClass(status) {
  const classes = {
    'cold': 'bg-gray-100 text-gray-800',
    'warm': 'bg-yellow-100 text-yellow-800',
    'hot': 'bg-red-100 text-red-800',
    'won': 'bg-green-100 text-green-800',
    'lost': 'bg-gray-200 text-gray-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getCategoryHeaderClass(status) {
  const classes = {
    'cold': 'bg-gray-100',
    'warm': 'bg-yellow-50',
    'hot': 'bg-red-50',
    'won': 'bg-green-50',
    'lost': 'bg-gray-50'
  }
  return classes[status] || 'bg-gray-50'
}

function getStatusColor(status) {
  const colors = {
    'cold': '#6b7280',    // gray
    'warm': '#f59e0b',    // yellow
    'hot': '#ef4444',     // red
    'won': '#10b981',     // green
    'lost': '#374151'     // dark gray
  }
  return colors[status] || '#3b82f6' // default blue
}

// Fonctions pour l'édition du montant directement sur la carte
function startEditingRevenue(prospect) {
  editingRevenue.value[prospect.id] = true
  tempRevenue.value[prospect.id] = prospect.revenue || 0
  
  // Auto-focus sur le champ input
  nextTick(() => {
    const input = document.querySelector(`input[data-prospect-id="${prospect.id}"]`)
    if (input) {
      input.focus()
      input.select()
    }
  })
}

function cancelEditingRevenue(prospectId) {
  editingRevenue.value[prospectId] = false
  delete tempRevenue.value[prospectId]
}

async function saveRevenue(prospect) {
  const newRevenue = tempRevenue.value[prospect.id]
  if (newRevenue !== undefined && newRevenue !== prospect.revenue) {
    try {
      // Ne mettre à jour que le revenue, en gardant les autres champs intacts
      const updateData = {
        name: prospect.name,
        email: prospect.email || '',
        phone: prospect.phone || '',
        company: prospect.company || '',
        position: prospect.position || '',
        address: prospect.address || '',
        status: prospect.status,
        revenue: newRevenue,
        probability_coefficient: prospect.probability_coefficient, // Préserver la probabilité existante
        notes: prospect.notes || '',
        tabId: prospect.tabId || prospect.tab_id || 'default'
      }
      
      const result = await prospectsStore.updateProspect(prospect.id, updateData)
      
      if (result.success) {
        console.log(`✅ Revenue updated for prospect ${prospect.id}`)
      } else {
        console.error('❌ Failed to update revenue:', result.error)
      }
    } catch (error) {
      console.error('❌ Error updating revenue:', error)
    }
  }
  
  editingRevenue.value[prospect.id] = false
  delete tempRevenue.value[prospect.id]
}

function handleRevenueKeydown(event, prospect) {
  if (event.key === 'Enter') {
    saveRevenue(prospect)
  } else if (event.key === 'Escape') {
    cancelEditingRevenue(prospect.id)
  }
}

// Fonctions pour l'édition de la probabilité directement sur la carte
function startEditingProbability(prospect) {
  editingProbability.value[prospect.id] = true
  tempProbability.value[prospect.id] = prospect.probability_coefficient || 100
  
  // Auto-focus sur le champ input
  nextTick(() => {
    const input = document.querySelector(`input[data-prospect-probability-id="${prospect.id}"]`)
    if (input) {
      input.focus()
      input.select()
    }
  })
}

function cancelEditingProbability(prospectId) {
  editingProbability.value[prospectId] = false
  delete tempProbability.value[prospectId]
}

async function saveProbability(prospect) {
  const newProbability = tempProbability.value[prospect.id]
  if (newProbability !== undefined && newProbability !== prospect.probability_coefficient) {
    try {
      // Valider que la probabilité est entre 0 et 100
      const validProbability = Math.max(0, Math.min(100, newProbability))
      
      // Ne mettre à jour que la probabilité, en gardant les autres champs intacts
      const updateData = {
        name: prospect.name,
        email: prospect.email || '',
        phone: prospect.phone || '',
        company: prospect.company || '',
        position: prospect.position || '',
        address: prospect.address || '',
        status: prospect.status,
        revenue: prospect.revenue || 0,
        probability_coefficient: validProbability,
        notes: prospect.notes || '',
        tabId: prospect.tabId || prospect.tab_id || 'default'
      }
      
      const result = await prospectsStore.updateProspect(prospect.id, updateData)
      
      if (result.success) {
        console.log(`✅ Probability updated for prospect ${prospect.id}`)
      } else {
        console.error('❌ Failed to update probability:', result.error)
      }
    } catch (error) {
      console.error('❌ Error updating probability:', error)
    }
  }
  
  editingProbability.value[prospect.id] = false
  delete tempProbability.value[prospect.id]
}

function handleProbabilityKeydown(event, prospect) {
  if (event.key === 'Enter') {
    saveProbability(prospect)
  } else if (event.key === 'Escape') {
    cancelEditingProbability(prospect.id)
  }
}

// Fonctions pour l'édition des notes directement sur la carte
function startEditingNotes(prospect) {
  editingNotes.value[prospect.id] = true
  tempNotes.value[prospect.id] = prospect.notes || ''
  
  // Initialiser la hauteur par défaut si elle n'existe pas
  if (!notesHeight.value[prospect.id]) {
    notesHeight.value[prospect.id] = '150px'
  }
  
  // Auto-focus sur le champ textarea
  nextTick(() => {
    const textarea = document.querySelector(`textarea[data-prospect-notes-id="${prospect.id}"]`)
    if (textarea) {
      textarea.focus()
      textarea.select()
    }
  })
}

function getNotesHeight(prospectId) {
  return notesHeight.value[prospectId] || '150px'
}

function startResizeNotes(event, prospectId) {
  isResizingNotes.value[prospectId] = true
  const startY = event.clientY
  const startHeight = parseInt(getNotesHeight(prospectId))
  
  const doResize = (e) => {
    if (!isResizingNotes.value[prospectId]) return
    
    const deltaY = e.clientY - startY
    const newHeight = Math.max(120, Math.min(500, startHeight + deltaY))
    notesHeight.value[prospectId] = `${newHeight}px`
  }
  
  const stopResize = () => {
    isResizingNotes.value[prospectId] = false
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
  }
  
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  event.preventDefault()
}

function cancelEditingNotes(prospectId) {
  editingNotes.value[prospectId] = false
  delete tempNotes.value[prospectId]
}

async function saveNotes(prospect) {
  const newNotes = tempNotes.value[prospect.id]
  if (newNotes !== undefined && newNotes !== prospect.notes) {
    try {
      // Ne mettre à jour que les notes, en gardant les autres champs intacts
      const updateData = {
        name: prospect.name,
        email: prospect.email || '',
        phone: prospect.phone || '',
        company: prospect.company || '',
        position: prospect.position || '',
        address: prospect.address || '',
        status: prospect.status,
        revenue: prospect.revenue || 0,
        notes: newNotes,
        tabId: prospect.tabId || prospect.tab_id || 'default'
      }
      
      const result = await prospectsStore.updateProspect(prospect.id, updateData)
      
      if (result.success) {
        console.log(`✅ Notes updated for prospect ${prospect.id}`)
      } else {
        console.error('❌ Failed to update notes:', result.error)
      }
    } catch (error) {
      console.error('❌ Error updating notes:', error)
    }
  }
  
  editingNotes.value[prospect.id] = false
  delete tempNotes.value[prospect.id]
}

function handleNotesKeydown(event, prospect) {
  if (event.key === 'Escape') {
    cancelEditingNotes(prospect.id)
  }
}

// Fonction pour nettoyer le HTML et obtenir le texte brut pour l'affichage
function getPlainTextFromHtml(html) {
  if (!html) return ''
  
  // Créer un élément temporaire pour parser le HTML
  const div = document.createElement('div')
  div.innerHTML = html
  
  // Remplacer les balises par des équivalents texte
  // Remplacer les <br> par des retours à la ligne
  div.innerHTML = div.innerHTML.replace(/<br\s*\/?>/gi, '\n')
  
  // Remplacer les </p> par des retours à la ligne
  div.innerHTML = div.innerHTML.replace(/<\/p>/gi, '\n')
  
  // Remplacer les <li> par des puces
  div.innerHTML = div.innerHTML.replace(/<li>/gi, '• ')
  div.innerHTML = div.innerHTML.replace(/<\/li>/gi, '\n')
  
  // Obtenir le texte brut
  let text = div.textContent || div.innerText || ''
  
  // Nettoyer les retours à la ligne multiples
  text = text.replace(/\n\s*\n/g, '\n').trim()
  
  return text
}

// Fonction pour vérifier si les notes contiennent du HTML
function hasHtmlContent(notes) {
  if (!notes) return false
  return /<[^>]*>/g.test(notes)
}

// Fonctions pour la modale des notes
function openNotesModal(prospect) {
  selectedProspectForNotes.value = prospect
  isEditingInModal.value = false
  showNotesModal.value = true
  
  // Ajouter un event listener pour la touche Escape
  document.addEventListener('keydown', handleModalKeydown)
}

function closeNotesModal() {
  showNotesModal.value = false
  selectedProspectForNotes.value = null
  isEditingInModal.value = false
  tempNotesForModal.value = ''
  
  // Supprimer l'event listener
  document.removeEventListener('keydown', handleModalKeydown)
}

function handleModalKeydown(event) {
  if (event.key === 'Escape') {
    if (isEditingInModal.value) {
      cancelEditingInModal()
    } else {
      closeNotesModal()
    }
  }
}

// Gestion des raccourcis clavier globaux
function handleGlobalKeydown(event) {
  // Ctrl+F ou Cmd+F pour se concentrer sur la recherche
  if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
    event.preventDefault()
    if (searchInput.value) {
      searchInput.value.focus()
      searchInput.value.select()
      
      // Ajouter l'animation de focus
      searchInput.value.classList.add('search-focus-animation')
      setTimeout(() => {
        if (searchInput.value) {
          searchInput.value.classList.remove('search-focus-animation')
        }
      }, 300)
    }
  }
  
  // Escape pour vider la recherche si elle est active
  if (event.key === 'Escape' && searchQuery.value && document.activeElement === searchInput.value) {
    searchQuery.value = ''
  }
}

function startEditingInModal() {
  if (selectedProspectForNotes.value) {
    isEditingInModal.value = true
    tempNotesForModal.value = selectedProspectForNotes.value.notes || ''
  }
}

function cancelEditingInModal() {
  isEditingInModal.value = false
  tempNotesForModal.value = ''
}

async function saveNotesFromModal() {
  if (selectedProspectForNotes.value) {
    try {
      // Sauvegarder via le store
      await prospectsStore.updateProspect(selectedProspectForNotes.value.id, {
        notes: tempNotesForModal.value
      })
      
      // Mettre à jour les données locales
      selectedProspectForNotes.value.notes = tempNotesForModal.value
      
      // Quitter le mode édition
      isEditingInModal.value = false
      tempNotesForModal.value = ''
      
      console.log('Notes saved successfully')
    } catch (error) {
      console.error('Error saving notes:', error)
    }
  }
}

function handleModalNotesKeydown(event) {
  if (event.key === 'Escape') {
    cancelEditingInModal()
  }
}

// Réinitialiser le filtre de revenu
function resetRevenueFilter() {
  revenueFilter.value = minRevenue.value
}

// Formater les devises
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Setup lors du montage du composant
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

// Cleanup lors du démontage du composant
onUnmounted(() => {
  document.removeEventListener('keydown', handleModalKeydown)
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
/* Styles pour le slider de revenu */
.revenue-slider {
  appearance: none;
  -webkit-appearance: none;
  height: 12px;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
}

.revenue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 3px solid #3b82f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.revenue-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.revenue-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 3px solid #3b82f6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.revenue-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.revenue-slider:focus {
  outline: none;
}

.revenue-slider:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
}

/* Style pour l'élément en cours de drag */
.dragging {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border: 2px solid #3b82f6;
}

/* Styles pour le redimensionnement des notes */
.resize-y {
  resize: vertical !important;
}

.resize-y::-webkit-resizer {
  background: linear-gradient(-45deg, transparent 0px, transparent 2px, #cbd5e1 2px, #cbd5e1 4px, transparent 4px, transparent 6px, #cbd5e1 6px, #cbd5e1 8px, transparent 8px);
  border-radius: 0 0 4px 0;
}

/* Améliorer l'apparence du redimensionnement sur Firefox */
@-moz-document url-prefix() {
  .resize-y {
    resize: vertical;
  }
}

/* Styles pour l'éditeur de notes redimensionnable */
.resizable-notes-editor {
  position: relative;
}

.resize-handle {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #d1d5db;
  border-radius: 3px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}

.resize-handle:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.resize-handle:hover svg {
  color: #3b82f6;
}

/* Styles pour QuillEditor compact */
.quill-editor-compact :deep(.ql-toolbar) {
  border: 1px solid #d1d5db;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  padding: 4px;
  background: #f9fafb;
}

.quill-editor-compact :deep(.ql-container) {
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  font-size: 12px;
  line-height: 1.4;
}

.quill-editor-compact :deep(.ql-editor) {
  min-height: 80px;
  overflow-y: auto;
  padding: 8px 20px 8px 8px; /* Padding à droite pour la poignée */
  resize: none; /* Désactiver le resize par défaut */
}

.quill-editor-compact :deep(.ql-toolbar button) {
  width: 24px;
  height: 24px;
  padding: 2px;
  margin: 1px;
}

.quill-editor-compact :deep(.ql-toolbar button svg) {
  width: 14px;
  height: 14px;
}

.quill-editor-compact :deep(.ql-editor p) {
  margin: 0 0 4px 0;
}

.quill-editor-compact :deep(.ql-editor p:last-child) {
  margin-bottom: 0;
}

.quill-editor-compact :deep(.ql-editor ul), 
.quill-editor-compact :deep(.ql-editor ol) {
  margin: 4px 0;
  padding-left: 16px;
}

.quill-editor-compact :deep(.ql-editor li) {
  margin-bottom: 2px;
}

.quill-editor-compact :deep(.ql-editor strong) {
  font-weight: 600;
}

.quill-editor-compact :deep(.ql-editor em) {
  font-style: italic;
}

.quill-editor-compact :deep(.ql-editor a) {
  color: #3b82f6;
  text-decoration: underline;
}

.quill-editor-compact :deep(.ql-editor a:hover) {
  color: #1d4ed8;
}

/* Styles pour la modale des notes */
.prose {
  line-height: 1.6;
}

.prose ul {
  list-style-type: disc;
  padding-left: 1.5em;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.5em;
}

.prose li {
  margin: 0.25em 0;
}

.prose p {
  margin: 0.75em 0;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
}

.prose a:hover {
  color: #1d4ed8;
}

/* Style pour les touches clavier */
kbd {
  font-family: 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-weight: 500;
  font-size: 0.875rem;
}

/* Styles pour l'éditeur Quill dans la modale */
.quill-editor-modal :deep(.ql-toolbar) {
  border: 1px solid #d1d5db;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: #f9fafb;
  padding: 8px;
}

.quill-editor-modal :deep(.ql-container) {
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 8px 8px;
  font-size: 14px;
  line-height: 1.6;
  height: calc(100% - 42px); /* Ajuster selon la hauteur de la toolbar */
}

.quill-editor-modal :deep(.ql-editor) {
  min-height: 300px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.quill-editor-modal :deep(.ql-toolbar .ql-formats) {
  margin-right: 12px;
}

.quill-editor-modal :deep(.ql-toolbar button) {
  width: 28px;
  height: 28px;
  margin: 1px;
  border-radius: 4px;
}

.quill-editor-modal :deep(.ql-toolbar button:hover) {
  background-color: #e5e7eb;
}

.quill-editor-modal :deep(.ql-toolbar button.ql-active) {
  background-color: #dbeafe;
  color: #1e40af;
}

.quill-editor-modal :deep(.ql-editor h1) {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 1rem 0;
}

.quill-editor-modal :deep(.ql-editor h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.875rem 0;
}

.quill-editor-modal :deep(.ql-editor p) {
  margin: 0.75rem 0;
}

.quill-editor-modal :deep(.ql-editor blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.quill-editor-modal :deep(.ql-editor code) {
  background-color: #f3f4f6;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'SFMono-Regular', 'Menlo', 'Monaco', monospace;
  font-size: 0.875rem;
}

.quill-editor-modal :deep(.ql-editor pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

/* Styles pour la recherche */
mark {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

/* Animation pour le champ de recherche quand il reçoit le focus via raccourci */
.search-focus-animation {
  animation: searchFocus 0.3s ease-out;
}

@keyframes searchFocus {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}
</style>
