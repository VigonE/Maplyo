<template>
  <div class="rich-text-editor">
    <!-- Barre d'outils -->
    <div class="toolbar bg-gray-50 border border-gray-300 rounded-t-md p-2 flex items-center gap-1">
      <button
        @click="execCommand('bold')"
        :class="{ 'bg-blue-100': isActive('bold') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Gras"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      
      <button
        @click="execCommand('italic')"
        :class="{ 'bg-blue-100': isActive('italic') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Italique"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4l4 16M6 8h12M4 16h12"></path>
        </svg>
      </button>
      
      <button
        @click="execCommand('underline')"
        :class="{ 'bg-blue-100': isActive('underline') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Souligné"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 19h12M8 4v12a4 4 0 0 0 8 0V4"></path>
        </svg>
      </button>
      
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      
      <button
        @click="execCommand('insertUnorderedList')"
        :class="{ 'bg-blue-100': isActive('insertUnorderedList') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Liste à puces"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      
      <button
        @click="execCommand('insertOrderedList')"
        :class="{ 'bg-blue-100': isActive('insertOrderedList') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Liste numérotée"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
      
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      
      <button
        @click="createLink"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Lien"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </button>
    </div>
    
    <!-- Zone d'édition -->
    <div
      ref="editor"
      contenteditable="true"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
      :class="editorClass"
      class="editor border border-gray-300 border-t-0 rounded-b-md p-3 min-h-[100px] max-h-[300px] overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      style="resize: vertical;"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Tapez votre texte ici...'
  },
  editorClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'keydown'])

const editor = ref(null)

// Mettre à jour le contenu de l'éditeur quand le modelValue change
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.innerHTML !== newValue) {
    editor.value.innerHTML = newValue || ''
  }
}, { immediate: true })

onMounted(() => {
  if (editor.value) {
    editor.value.innerHTML = props.modelValue || ''
    
    // Ajouter le placeholder
    if (!props.modelValue) {
      editor.value.setAttribute('data-placeholder', props.placeholder)
    }
  }
})

function execCommand(command, value = null) {
  document.execCommand(command, false, value)
  editor.value.focus()
  onInput()
}

function isActive(command) {
  return document.queryCommandState(command)
}

function createLink() {
  const url = prompt('Entrez l\'URL du lien:')
  if (url) {
    execCommand('createLink', url)
  }
}

function onInput() {
  const content = editor.value.innerHTML
  emit('update:modelValue', content)
  
  // Gérer le placeholder
  if (content.trim() === '' || content === '<br>') {
    editor.value.setAttribute('data-placeholder', props.placeholder)
  } else {
    editor.value.removeAttribute('data-placeholder')
  }
}

function onKeydown(event) {
  emit('keydown', event)
}

function onBlur() {
  emit('blur')
}

// Méthode pour focus sur l'éditeur
function focus() {
  if (editor.value) {
    editor.value.focus()
  }
}

// Exposer la méthode focus pour le composant parent
defineExpose({ focus })
</script>

<style scoped>
.editor[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  font-style: italic;
}

.editor[data-placeholder]:empty:focus::before {
  content: '';
}

.editor {
  font-size: 12px;
  line-height: 1.5;
}

.editor p {
  margin: 0 0 8px 0;
}

.editor p:last-child {
  margin-bottom: 0;
}

.editor ul, .editor ol {
  margin: 4px 0;
  padding-left: 16px;
}

.editor li {
  margin-bottom: 2px;
}

.editor strong {
  font-weight: 600;
}

.editor em {
  font-style: italic;
}

.editor a {
  color: #3b82f6;
  text-decoration: underline;
}

.editor a:hover {
  color: #1d4ed8;
}

.toolbar button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>
