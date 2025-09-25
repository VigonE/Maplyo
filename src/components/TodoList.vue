<template>
  <div class="todolist-container">
    <!-- Background gradient layer -->
    <div class="bg-gradient-to-br from-yellow-50 to-amber-50 h-full">
      <div class="p-3">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center">
          <h4 class="text-sm font-semibold text-gray-800">
            Todo List
          </h4>
          <span v-if="incompleteTodoCount > 0" class="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full font-medium">
            {{ incompleteTodoCount }}
          </span>
        </div>
      </div>

      <!-- Add new todo - Compact design -->
      <div class="bg-white rounded-md p-3 mb-3 border border-yellow-200 shadow-sm">
        <div class="space-y-2">
        <!-- Input row -->
        <div class="flex gap-2">
          <div class="flex-1 relative">
            <input
              v-model="newTodoText"
              type="text"
              placeholder="Add a task..."
              class="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent bg-white"
              @keyup.enter="addTodo"
              @keyup.escape="clearNewTodo"
            >
          </div>
          <button
            @click="addTodo"
            :disabled="!newTodoText.trim()"
            class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium"
            title="Add task"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="hidden sm:inline text-xs">Add</span>
          </button>
        </div>
        
        <!-- Due date row -->
        <div class="flex items-center gap-2 text-xs">
          <svg class="w-3 h-3 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <input
            v-model="newTodoDueDate"
            type="date"
            class="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          >
          <button
            v-if="newTodoDueDate"
            @click="newTodoDueDate = ''"
            class="p-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Clear due date"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Todo list - Compact with controlled height and proper scrolling -->
    <div class="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div v-if="loading" class="text-center py-2 text-gray-500 text-sm">
        Loading...
      </div>
      
      <div v-else-if="!Array.isArray(todos) || todos.length === 0" class="text-center py-2 text-gray-500 text-sm">
        No tasks yet
      </div>
      
      <div
        v-else
        v-for="todo in todos"
        :key="todo.id"
        class="flex items-start gap-2 p-2 bg-white rounded border border-gray-100 hover:border-gray-200 transition-colors"
        :class="{ 'opacity-60 bg-gray-50': todo.completed }"
      >
        <!-- Checkbox -->
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo)"
          class="w-3 h-3 mt-0.5 text-blue-600 rounded focus:ring-1 focus:ring-blue-400"
        >

        <!-- Todo content -->
        <div class="flex-1 min-w-0">
          <div
            class="text-xs font-medium"
            :class="{ 
              'line-through text-gray-500': todo.completed, 
              'text-gray-900': !todo.completed 
            }"
          >
            {{ todo.text }}
          </div>
          
          <!-- Due date and timestamp - more compact -->
          <div class="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
            <span v-if="todo.due_date" class="flex items-center">
              {{ formatDate(todo.due_date) }}
              <span v-if="isOverdue(todo.due_date)" class="ml-1 text-red-500 font-bold">!</span>
            </span>
            <span>{{ formatDateTime(todo.created_at) }}</span>
          </div>
        </div>

        <!-- Delete button - more compact -->
        <button
          @click="deleteTodo(todo)"
          class="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
          title="Delete"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Empty state - only show when no tasks and not loading -->
      <div v-if="!loading && todos.length === 0" class="text-center py-4 text-gray-500 text-sm">
        <svg class="w-8 h-8 mx-auto mb-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p class="text-xs">No tasks yet</p>
      </div>
    </div>
    </div>

    <!-- Quick stats - always show when there are tasks, stays at bottom -->
    <div v-if="todos.length > 0" class="bg-yellow-200 bg-opacity-60 border-t border-yellow-300 px-3 py-2 flex-shrink-0">
      <div class="text-xs text-gray-700 text-center font-medium">
        {{ completedTodoCount }}/{{ todos.length }} done
        <span v-if="incompleteTodoCount > 0" class="text-orange-700 font-semibold ml-1">
          ({{ incompleteTodoCount }} left)
        </span>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const props = defineProps({
  prospectId: {
    type: [String, Number],
    required: true
  }
})

const authStore = useAuthStore()

// Reactive data
const todos = ref([])
const newTodoText = ref('')
const newTodoDueDate = ref('')
const loading = ref(false)

// Computed properties
const completedTodoCount = computed(() => {
  if (!Array.isArray(todos.value)) return 0
  return todos.value.filter(todo => todo.completed).length
})

const incompleteTodoCount = computed(() => {
  if (!Array.isArray(todos.value)) return 0
  return todos.value.filter(todo => !todo.completed).length
})

// Load todos
async function loadTodos() {
  if (!props.prospectId) return
  
  try {
    loading.value = true
    const response = await api.get(`/prospects/${props.prospectId}/todos`)
    todos.value = Array.isArray(response.data) ? response.data : []
    console.log('✅ Loaded todos:', response.data)
  } catch (error) {
    console.error('❌ Error loading todos:', error)
    // Initialize with empty array on error
    todos.value = []
  } finally {
    loading.value = false
  }
}

// Add new todo
async function addTodo() {
  if (!newTodoText.value.trim()) return

  try {
    const response = await api.post(`/prospects/${props.prospectId}/todos`, {
      text: newTodoText.value.trim(),
      due_date: newTodoDueDate.value || null
    })

    todos.value.unshift(response.data)
    clearNewTodo()
    console.log('✅ Added todo:', response.data)
  } catch (error) {
    console.error('❌ Error adding todo:', error)
  }
}

// Clear new todo form
function clearNewTodo() {
  newTodoText.value = ''
  newTodoDueDate.value = ''
}

// Toggle todo completion
async function toggleTodo(todo) {
  try {
    const response = await api.put(`/todos/${todo.id}`, {
      completed: !todo.completed
    })

    // Update local todo
    const index = todos.value.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      todos.value[index] = response.data
    }
    
    console.log('✅ Toggled todo completion:', response.data)
  } catch (error) {
    console.error('❌ Error toggling todo:', error)
  }
}

// Delete todo
async function deleteTodo(todo) {
  if (!confirm('Are you sure you want to delete this task?')) return

  try {
    await api.delete(`/todos/${todo.id}`)

    // Remove from local list
    const index = todos.value.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      todos.value.splice(index, 1)
    }
    
    console.log('✅ Deleted todo:', todo.id)
  } catch (error) {
    console.error('❌ Error deleting todo:', error)
  }
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const today = new Date()
  const diffTime = date.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffDays === 0) {
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
  }
  
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
  })
}

function isOverdue(dateString) {
  if (!dateString) return false
  const dueDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)  // Reset time to start of day
  dueDate.setHours(0, 0, 0, 0)  // Reset time to start of day
  return dueDate < today
}

// Lifecycle
onMounted(() => {
  loadTodos()
})

// Watch for prospect changes
import { watch } from 'vue'
watch(() => props.prospectId, (newId) => {
  if (newId) {
    loadTodos()
  } else {
    todos.value = []
  }
})
</script>

<style scoped>
.todolist-container {
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  overflow: hidden;
  border: 1px solid rgb(254 240 138);
  position: relative;
}

/* Force the rounded corners to be visible */
.todolist-container::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: 0.5rem;
  border: 2px solid rgb(254 240 138);
  pointer-events: none;
  z-index: 20;
}
</style>