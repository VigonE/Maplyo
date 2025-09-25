import { ref } from 'vue'

// Store global pour la synchronisation des todos
const todoSyncListeners = ref(new Set())

// Événements possibles
export const TODO_EVENTS = {
  ADDED: 'todo:added',
  UPDATED: 'todo:updated', 
  DELETED: 'todo:deleted',
  TOGGLED: 'todo:toggled'
}

export function useTodoSync() {
  // Émettre un événement de synchronisation
  function emitTodoSync(event, data) {
    console.log(`🔄 Todo Sync Event: ${event}`, data)
    todoSyncListeners.value.forEach(callback => {
      callback(event, data)
    })
  }

  // S'abonner aux événements de synchronisation
  function onTodoSync(callback) {
    todoSyncListeners.value.add(callback)
    
    // Retourner une fonction de cleanup
    return () => {
      todoSyncListeners.value.delete(callback)
    }
  }

  return {
    emitTodoSync,
    onTodoSync,
    TODO_EVENTS
  }
}