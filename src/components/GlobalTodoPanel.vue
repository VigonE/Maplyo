<template>
  <div 
    class="bg-white border-l border-gray-200 flex flex-col h-full shadow-lg transition-all duration-300 ease-in-out relative"
    :class="isCollapsed ? 'w-12' : 'w-80'"
  >
    <!-- Header avec bouton de repliage -->
    <div class="p-3 border-b border-gray-200 flex items-center bg-gray-50 flex-shrink-0">
      <!-- Icône Todo toujours visible (cliquable) -->
      <div 
        class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-blue-600 transition-colors"
        @click="togglePanel"
        title="Click to collapse/expand the Todo panel"
      >
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      </div>
      
      <!-- Titre et stats (cachés si replié) -->
      <div 
        v-show="!isCollapsed"
        class="ml-3 flex-1 transition-all duration-300"
      >
        <h2 class="text-lg font-semibold text-gray-800">General Todo</h2>
        <p class="text-sm text-gray-500">
          {{ totalTodos }} tasks
          <span v-if="overdueTodos > 0" class="text-red-600 font-medium ml-1">
            • {{ overdueTodos }} overdue
          </span>
        </p>
      </div>
      
      <!-- Bouton de repliage -->
      <button
        @click="togglePanel"
        class="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
        :class="isCollapsed ? 'ml-0' : 'ml-2'"
        :title="isCollapsed ? 'Expand Todo panel' : 'Collapse Todo panel'"
      >
        <svg 
          class="h-4 w-4 transform transition-transform duration-200" 
          :class="{ 'rotate-180': !isCollapsed }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Stats rapides (cachées si replié) -->
    <div 
      v-show="!isCollapsed" 
      class="px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0"
    >
      <div class="flex justify-between text-xs">
        <span class="text-green-600 font-medium">{{ completedTodos }} completed</span>
        <span class="text-orange-600 font-medium">{{ incompleteTodos }} to do</span>
      </div>
    </div>

    <!-- Liste des todos (cachée si replié) -->
    <div 
      v-show="!isCollapsed"
      class="flex-1 overflow-y-auto"
    >
      <div v-if="loading" class="p-4 text-center text-gray-500">
        <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p class="mt-2">Loading todos...</p>
      </div>
      
      <div v-else-if="sortedTodos.length === 0" class="p-6 text-center text-gray-500">
        <svg class="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-gray-400">No tasks found</p>
      </div>
      
      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="todo in sortedTodos"
          :key="`${todo.prospect_id}-${todo.id}`"
          class="p-3 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="viewProspect(todo.prospect_id)"
        >
          <!-- Todo item -->
          <div class="flex items-start space-x-3">
            <!-- Checkbox -->
            <button
              @click.stop="toggleTodo(todo)"
              class="mt-1 flex-shrink-0"
            >
              <div class="w-4 h-4 border-2 rounded flex items-center justify-center transition-colors"
                   :class="todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'">
                <svg v-if="todo.completed" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </div>
            </button>

            <!-- Todo content -->
            <div class="flex-1 min-w-0">
              <!-- Task text -->
              <p 
                class="text-sm font-medium break-words transition-colors"
                :class="[
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-900',
                  isOverdue(todo) && !todo.completed ? 'text-red-600' : ''
                ]"
              >
                {{ todo.text }}
              </p>
              
              <!-- Prospect name -->
              <button 
                @click.stop="editProspect(todo.prospect_id)"
                class="text-xs text-blue-600 hover:text-blue-800 mt-1 underline hover:no-underline transition-all"
              >
                {{ getProspectName(todo.prospect_id) }}
              </button>
              
              <!-- Date d'échéance -->
              <div v-if="todo.due_date" class="mt-1">
                <span 
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="[
                    isOverdue(todo) && !todo.completed 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(todo.due_date) }}
                </span>
              </div>
              
              <!-- Creation date (for tasks without due date) -->
              <div v-else class="mt-1">
                <span class="text-xs text-gray-400">
                  Created on {{ formatDate(todo.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification badge when collapsed -->
    <div 
      v-if="isCollapsed && incompleteTodos > 0"
      class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold"
    >
      {{ incompleteTodos > 99 ? '99+' : incompleteTodos }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTodoSync, TODO_EVENTS } from '@/composables/useTodoSync'
import api from '@/services/api.js'

// Props
const props = defineProps({
  prospects: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['view-prospect', 'edit-prospect'])

// État local
const isCollapsed = ref(false)
const loading = ref(false)
const todos = ref([])

// Todo Sync
const { onTodoSync } = useTodoSync()
let unsubscribe = null

// État calculé
const totalTodos = computed(() => Array.isArray(todos.value) ? todos.value.length : 0)
const completedTodos = computed(() => Array.isArray(todos.value) ? todos.value.filter(todo => todo.completed).length : 0)
const incompleteTodos = computed(() => Array.isArray(todos.value) ? todos.value.filter(todo => !todo.completed).length : 0)
const overdueTodos = computed(() => 
  Array.isArray(todos.value) ? todos.value.filter(todo => !todo.completed && isOverdue(todo)).length : 0
)

// Sort todos according to requested criteria (exclude completed tasks)
const sortedTodos = computed(() => {
  if (!Array.isArray(todos.value)) return []
  
  // Filter completed tasks for general panel
  const incompleteTodos = todos.value.filter(todo => !todo.completed)
  
  return incompleteTodos.sort((a, b) => {
    // Priorité 1: Les todos avec date d'échéance
    if (a.due_date && !b.due_date) return -1
    if (!a.due_date && b.due_date) return 1
    
    // Si les deux ont une date d'échéance, trier par date (plus récent en premier)
    if (a.due_date && b.due_date) {
      return new Date(b.due_date) - new Date(a.due_date)
    }
    
    // Si aucun n'a de date d'échéance, trier par date de création (plus récent en premier)
    return new Date(b.created_at) - new Date(a.created_at)
  })
})

// Méthodes
function togglePanel() {
  isCollapsed.value = !isCollapsed.value
}

function getProspectName(prospectId) {
  const prospect = props.prospects.find(p => p.id === prospectId)
  return prospect ? prospect.name : 'Unknown prospect'
}

function isOverdue(todo) {
  if (!todo.due_date) return false
  const today = new Date()
  const dueDate = new Date(todo.due_date)
  // Réinitialiser l'heure pour comparer seulement les dates
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

async function loadTodos() {
  try {
    loading.value = true
    const response = await api.get('/todos/all')
    todos.value = response.data
  } catch (error) {
    console.error('Error loading todos:', error)
    todos.value = []
  } finally {
    loading.value = false
  }
}

async function toggleTodo(todo) {
  try {
    const response = await api.put(`/todos/${todo.id}`, {
      ...todo,
      completed: !todo.completed,
      updated_at: new Date().toISOString()
    })
    
    if (response.data) {
      // Mettre à jour la todo dans la liste locale
      const index = todos.value.findIndex(t => t.id === todo.id)
      if (index !== -1) {
        todos.value[index] = { ...todos.value[index], completed: !todo.completed }
      }
      // Note: No need to reload - the computed sortedTodos will automatically 
      // filter the completed task and it will disappear in real time
    }
  } catch (error) {
    console.error('Error updating todo:', error)
  }
}

function viewProspect(prospectId) {
  emit('view-prospect', prospectId)
}

function editProspect(prospectId) {
  emit('edit-prospect', prospectId)
}

// Lifecycle
onMounted(() => {
  loadTodos()
  
  // S'abonner aux événements de synchronisation des todos
  unsubscribe = onTodoSync((event, data) => {
    handleTodoSync(event, data)
  })
})

onUnmounted(() => {
  // Se désabonner lors du démontage du composant
  if (unsubscribe) {
    unsubscribe()
  }
})

// Gérer les événements de synchronisation
function handleTodoSync(event, data) {
  console.log('🔄 GlobalTodoPanel received sync event:', event, data)
  
  switch (event) {
    case TODO_EVENTS.ADDED:
      // Add new todo if it doesn't already exist
      if (!todos.value.find(t => t.id === data.id)) {
        todos.value.unshift(data)
      }
      break
      
    case TODO_EVENTS.TOGGLED:
      // Mettre à jour le statut completed de la todo
      const toggleIndex = todos.value.findIndex(t => t.id === data.id)
      if (toggleIndex !== -1) {
        todos.value[toggleIndex] = { ...todos.value[toggleIndex], ...data }
      }
      break
      
    case TODO_EVENTS.DELETED:
      // Delete todo from list
      const deleteIndex = todos.value.findIndex(t => t.id === data.id)
      if (deleteIndex !== -1) {
        todos.value.splice(deleteIndex, 1)
      }
      break
      
    case TODO_EVENTS.UPDATED:
      // Mettre à jour la todo complète
      const updateIndex = todos.value.findIndex(t => t.id === data.id)
      if (updateIndex !== -1) {
        todos.value[updateIndex] = { ...todos.value[updateIndex], ...data }
      }
      break
  }
}
</script>

<style scoped>
/* Transitions douces pour le repliage */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>