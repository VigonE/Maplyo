<template>
  <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 mt-6 border-2 border-yellow-200 shadow-lg">
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center">
        <h4 class="text-xl font-bold text-gray-800">
          Todo List
        </h4>
        <span v-if="incompleteTodoCount > 0" class="ml-3 px-3 py-1 text-sm bg-orange-500 text-white rounded-full font-medium shadow-sm">
          {{ incompleteTodoCount }} pending
        </span>
      </div>
    </div>

    <!-- Add new todo - Better contained design -->
    <div class="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-4 mb-4 border border-yellow-300 shadow-sm">
      <div class="space-y-3">
        <!-- Input row -->
        <div class="flex gap-2">
          <div class="flex-1 relative">
            <input
              v-model="newTodoText"
              type="text"
              placeholder="Add a new task..."
              class="w-full px-3 py-2.5 border border-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm bg-white shadow-sm"
              @keyup.enter="addTodo"
              @keyup.escape="clearNewTodo"
            >
          </div>
          <button
            @click="addTodo"
            :disabled="!newTodoText.trim()"
            class="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-medium shadow-sm"
            title="Add task"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="hidden sm:inline">Add</span>
          </button>
        </div>
        
        <!-- Due date row -->
        <div class="flex items-center gap-2 bg-white bg-opacity-50 rounded-md p-2">
          <svg class="w-4 h-4 text-yellow-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <label class="text-xs text-yellow-800 font-medium min-w-fit">Due date:</label>
          <input
            v-model="newTodoDueDate"
            type="date"
            class="flex-1 px-2 py-1.5 border border-yellow-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
          >
          <button
            v-if="newTodoDueDate"
            @click="newTodoDueDate = ''"
            class="p-1.5 text-yellow-600 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"
            title="Clear due date"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Todo list -->
    <div class="space-y-2 max-h-64 overflow-y-auto">
      <div v-if="loading" class="text-center py-4 text-gray-500">
        Loading todos...
      </div>
      
      <div v-else-if="!Array.isArray(todos) || todos.length === 0" class="text-center py-4 text-gray-500">
        No todos yet. Add your first task above!
      </div>
      
      <div
        v-else
        v-for="todo in todos"
        :key="todo.id"
        class="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-200 hover:border-yellow-200"
        :class="{ 'opacity-70 bg-gray-50 border-gray-200': todo.completed }"
      >
        <!-- Checkbox -->
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo)"
          class="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
        >

        <!-- Todo content -->
        <div class="flex-1 min-w-0">
          <div
            class="text-sm font-medium"
            :class="{ 
              'line-through text-gray-500': todo.completed, 
              'text-gray-900': !todo.completed 
            }"
          >
            {{ todo.text }}
          </div>
          
          <!-- Due date and timestamp -->
          <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
            <span v-if="todo.due_date" class="flex items-center bg-gray-100 px-2 py-1 rounded">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due {{ formatDate(todo.due_date) }}
              <span v-if="isOverdue(todo.due_date)" class="ml-1 text-red-500 font-medium">
                (Overdue!)
              </span>
            </span>
            <span class="flex items-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Added {{ formatDateTime(todo.created_at) }}
            </span>
          </div>
        </div>

        <!-- Delete button -->
        <button
          @click="deleteTodo(todo)"
          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0 mt-0.5"
          title="Delete task"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="todos.length === 0" class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p>No tasks yet. Add one above!</p>
      </div>
    </div>

    <!-- Quick stats -->
    <div v-if="todos.length > 0" class="mt-5 pt-4 border-t-2 border-yellow-200">
      <div class="text-sm text-gray-600 text-center font-medium bg-white bg-opacity-60 rounded-lg py-2 px-4">
        {{ completedTodoCount }} of {{ todos.length }} tasks completed
        <span v-if="incompleteTodoCount > 0" class="text-orange-600 font-semibold">
          • {{ incompleteTodoCount }} remaining
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

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
    const response = await axios.get(`http://localhost:3001/api/prospects/${props.prospectId}/todos`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
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
    const response = await axios.post(`http://localhost:3001/api/prospects/${props.prospectId}/todos`, {
      text: newTodoText.value.trim(),
      due_date: newTodoDueDate.value || null
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
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
    const response = await axios.put(`http://localhost:3001/api/todos/${todo.id}`, {
      completed: !todo.completed
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
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
    await axios.delete(`http://localhost:3001/api/todos/${todo.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

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