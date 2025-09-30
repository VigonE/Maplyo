<template>
  <div class="rich-text-editor">
    <!-- Barre d'outils Tiptap -->
    <div class="toolbar bg-gray-50 border border-gray-300 rounded-t-md p-2 flex items-center gap-1 flex-wrap">
      <!-- Formatage de base -->
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'bg-blue-100': editor?.isActive('bold') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Bold (Ctrl+B)"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'bg-blue-100': editor?.isActive('italic') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Italic (Ctrl+I)"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4l4 16M6 8h12M4 16h12"></path>
        </svg>
      </button>
      
      <button
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'bg-blue-100': editor?.isActive('underline') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Underline (Ctrl+U)"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 19h12M8 4v12a4 4 0 0 0 8 0V4"></path>
        </svg>
      </button>
      
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'bg-blue-100': editor?.isActive('strike') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Strikethrough"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h12M8 7h8m-8 10h8"></path>
        </svg>
      </button>
      
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      
      <!-- Listes -->
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'bg-blue-100': editor?.isActive('bulletList') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Bullet list"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="1.5" fill="currentColor"></circle>
          <circle cx="6" cy="12" r="1.5" fill="currentColor"></circle>
          <circle cx="6" cy="18" r="1.5" fill="currentColor"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6h10M10 12h10M10 18h10"></path>
        </svg>
      </button>
      
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'bg-blue-100': editor?.isActive('orderedList') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Numbered list"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h1m0 0V3m0 3v3m5-6h10M9 12h10M9 18h10"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h1m0 0v3m0-3v-3m0 6h1"></path>
          <circle cx="3.5" cy="18" r="0.5" fill="currentColor"></circle>
        </svg>
      </button>
      
      <button
        @click="editor.chain().focus().toggleTaskList().run()"
        :class="{ 'bg-blue-100': editor?.isActive('taskList') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Task list"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </button>
      
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      
      <!-- Alignement -->
      <button
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'bg-blue-100': editor?.isActive({ textAlign: 'left' }) }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Align left"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h10M4 12h16M4 18h10"></path>
        </svg>
      </button>
      
      <button
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'bg-blue-100': editor?.isActive({ textAlign: 'center' }) }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Center"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h10M4 12h16M7 18h10"></path>
        </svg>
      </button>
      
      <button
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'bg-blue-100': editor?.isActive({ textAlign: 'right' }) }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Align right"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6h10M4 12h16M10 18h10"></path>
        </svg>
      </button>
      
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      
      <!-- Colors -->
      <select
        @change="changeTextColor($event)"
        class="p-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
        title="Text color"
      >
        <option value="">Color</option>
        <option value="#000000">Black</option>
        <option value="#dc2626">Red</option>
        <option value="#059669">Green</option>
        <option value="#2563eb">Blue</option>
        <option value="#7c3aed">Purple</option>
        <option value="#ea580c">Orange</option>
      </select>
      
      <div class="w-px h-4 bg-gray-300 mx-1"></div>
      
      <!-- Liens -->
      <button
        @click="setLink"
        :class="{ 'bg-blue-100': editor?.isActive('link') }"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Link (Ctrl+K)"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </button>
      
      <!-- Actions -->
      <button
        @click="editor.chain().focus().clearNodes().unsetAllMarks().run()"
        class="p-1 rounded hover:bg-gray-200 transition-colors"
        title="Remove formatting"
        type="button"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
    
    <!-- Zone d'édition Tiptap -->
    <EditorContent 
      :editor="editor" 
      :class="editorClass"
      class="editor border border-gray-300 border-t-0 rounded-b-md p-3 min-h-[100px] max-h-[300px] overflow-y-auto"
      style="resize: vertical;"
      :data-notes-last-updated="props.notesLastUpdated"
    />
  </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { DailyTooltipExtension } from './DailyTooltipExtension.js'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import { watch, onBeforeUnmount, onMounted, nextTick } from 'vue'

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
  },
  applyDailyColors: {
    type: Boolean,
    default: false
  },
  notesLastUpdated: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'keydown', 'input'])

// Palette of 15 colors for days
const dayColors = [
  '#e11d48', // Rose
  '#0ea5e9', // Sky blue  
  '#22c55e', // Green
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#10b981', // Emeraude
  '#f97316', // Dark orange
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#ec4899', // Rose vif
  '#14b8a6', // Teal
  '#f43f5e', // Red pink
  '#3b82f6'  // Blue
]

// Get color for today
const getTodayColor = () => {
  if (!props.applyDailyColors) return { color: '#000000', date: null }
  
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const color = dayColors[dayOfYear % dayColors.length]
  const dateString = today.toISOString().split('T')[0] // Format YYYY-MM-DD
  
  return { color, date: dateString }
}

// Formater la date pour le tooltip
const getTodayDateForTooltip = () => {
  const today = new Date()
  return today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      history: {
        depth: 50,
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Color.configure({
      types: ['textStyle'],
    }),
    TextStyle,
    DailyTooltipExtension,
    TaskList.configure({
      HTMLAttributes: {
        class: 'tiptap-task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'tiptap-task-item',
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'tiptap-link',
      },
    }),
    Underline,
    Strike,
  ],
  editorProps: {
    attributes: {
      placeholder: props.placeholder,
      class: 'tiptap-editor prose prose-sm max-w-none focus:outline-none',
    },
    handleKeyDown: (view, event) => {
      emit('keydown', event)
      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
    emit('input')
    
    // If applyDailyColors is enabled, post-process DOM to add tooltips
    // Mais seulement après un délai pour éviter de bloquer la frappe
    if (props.applyDailyColors) {
      // Débounce plus long pour éviter d'interférer avec la frappe
      clearTimeout(addDateTooltips.debounceTimer)
      addDateTooltips.debounceTimer = setTimeout(() => {
        nextTick(() => {
          addDateTooltips()
        })
      }, 500) // 500ms au lieu de 100ms
    }
  },
  onSelectionUpdate: ({ editor }) => {
    // Automatically apply day color when making selection/typing
    if (props.applyDailyColors) {
      const todayData = getTodayColor()
      // Appliquer la couleur seulement si l'utilisateur n'a pas de couleur active
      const currentColor = editor.getAttributes('textStyle').color
      if (!currentColor) {
        setTimeout(() => {
          applyTodayColorToSelection()
        }, 50)
      }
    }
  },
  onBlur: () => {
    emit('blur')
  },
})

// Mettre à jour le contenu de l'éditeur quand le modelValue change
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue || '', false)
  }
})

// Fonctions pour la barre d'outils
function changeTextColor(event) {
  const color = event.target.value
  if (color && editor.value) {
    editor.value.chain().focus().setColor(color).run()
    event.target.value = '' // Reset select
  }
}

function setLink() {
  if (!editor.value) return
  
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL du lien:', previousUrl)
  
  // cancelled
  if (url === null) {
    return
  }
  
  // empty
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  
  // update link
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Méthode pour focus sur l'éditeur
function focus() {
  if (editor.value) {
    editor.value.commands.focus()
  }
}

// Add date tooltips to DOM
function addDateTooltips() {
  // Cette fonction n'est plus nécessaire car l'extension TipTap gère les tooltips
  console.log('🔧 Tooltips gérés par l\'extension TipTap DailyTooltipExtension')
}

// Appliquer la couleur du jour au texte sélectionné  
function applyTodayColorToSelection() {
  if (!editor.value || !props.applyDailyColors) return
  
  const todayData = getTodayColor()
  
  console.log('🔧 Application couleur du jour:', todayData)
  
  // Appliquer la couleur et l'attribut de date
  editor.value.chain().focus().setColor(todayData.color).run()
  
  // Pour ajouter l'attribut data-daily-date, nous devons le faire directement sur le DOM
  // après que TipTap ait appliqué la couleur
  setTimeout(() => {
    const editorElement = editor.value.view.dom
    const selection = editor.value.state.selection
    
    // Parcourir tous les spans colorés dans la sélection et ajouter l'attribut date
    const spans = editorElement.querySelectorAll('span[style*="color"]')
    spans.forEach(span => {
      if (span.style.color && !span.getAttribute('data-daily-date')) {
        span.setAttribute('data-daily-date', todayData.date)
        console.log('📅 Attribut date ajouté à un span:', todayData.date)
      }
    })
  }, 10)
  
  console.log('✅ Couleur et date appliquées - tooltips gérés par l\'extension')
}

// Raccourcis clavier personnalisés
if (editor.value) {
  editor.value.setOptions({
    editorProps: {
      ...editor.value.options.editorProps,
      handleKeyDown: (view, event) => {
        emit('keydown', event)
        
        // Laisser Tiptap gérer ses propres raccourcis
        return false
      },
    },
  })
}

// Nettoyer l'éditeur à la destruction du composant
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

// Exposer les méthodes pour le composant parent
defineExpose({ 
  focus,
  editor: editor.value
})
</script>

<style scoped>
/* Styles généraux pour l'éditeur */
.editor {
  font-size: 12px;
  line-height: 1.5;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.editor:focus-within {
  border-color: #9ca3af;
  box-shadow: 0 0 0 1px rgba(156, 163, 175, 0.3);
}

/* Styles Tiptap personnalisés */
:deep(.tiptap-editor) {
  outline: none;
  padding: 0;
  margin: 0;
}

:deep(.tiptap-editor:focus) {
  outline: none;
  box-shadow: none;
}

:deep(.tiptap-editor[data-placeholder]:empty::before) {
  content: attr(data-placeholder);
  color: #9ca3af;
  font-style: italic;
  height: 0;
  float: left;
  pointer-events: none;
}

:deep(.tiptap-editor p) {
  margin: 0 0 8px 0;
}

:deep(.tiptap-editor p:last-child) {
  margin-bottom: 0;
}

:deep(.tiptap-editor ul, .tiptap-editor ol) {
  margin: 4px 0;
  padding-left: 20px;
}

:deep(.tiptap-editor ul) {
  list-style-type: disc;
}

:deep(.tiptap-editor ol) {
  list-style-type: decimal;
}

:deep(.tiptap-editor li) {
  margin-bottom: 2px;
  display: list-item;
}

:deep(.tiptap-editor ul ul) {
  list-style-type: circle;
  margin-top: 2px;
  margin-bottom: 2px;
}

:deep(.tiptap-editor ul ul ul) {
  list-style-type: square;
}

:deep(.tiptap-editor strong) {
  font-weight: 600;
}

:deep(.tiptap-editor em) {
  font-style: italic;
}

:deep(.tiptap-editor u) {
  text-decoration: underline;
}

:deep(.tiptap-editor s) {
  text-decoration: line-through;
}

/* Styles pour les liens */
:deep(.tiptap-link) {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

:deep(.tiptap-link:hover) {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Styles for task lists */
:deep(.tiptap-task-list) {
  list-style: none !important;
  padding: 0;
  margin: 4px 0;
}

:deep(.tiptap-task-item) {
  display: flex;
  align-items: flex-start;
  margin: 4px 0;
  list-style: none !important;
}

:deep(.tiptap-task-item::marker) {
  display: none;
}

:deep(.tiptap-task-item > label) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  width: 100%;
}

:deep(.tiptap-task-item > label > input[type="checkbox"]) {
  margin: 2px 0 0 0;
  cursor: pointer;
  border-radius: 3px;
  border: 1px solid #d1d5db;
  color: #3b82f6;
  flex-shrink: 0;
}

:deep(.tiptap-task-item > label > input[type="checkbox"]:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

:deep(.tiptap-task-item > label > div) {
  flex: 1;
  cursor: text;
  outline: none;
  transition: all 0.2s ease;
}

:deep(.tiptap-task-item > label > div:focus) {
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 2px;
  padding: 1px 2px;
}

/* Styles pour l'alignement du texte */
:deep(.tiptap-editor [style*="text-align: center"]) {
  text-align: center;
}

:deep(.tiptap-editor [style*="text-align: right"]) {
  text-align: right;
}

:deep(.tiptap-editor [style*="text-align: left"]) {
  text-align: left;
}

:deep(.tiptap-editor [style*="text-align: justify"]) {
  text-align: justify;
}

/* Amélioration des boutons de la barre d'outils */
.toolbar button {
  transition: all 0.2s ease;
  border-radius: 4px;
  padding: 6px;
}

.toolbar button:hover {
  background-color: #e5e7eb;
  transform: scale(1.05);
}

.toolbar button:active {
  transform: scale(0.95);
}

.toolbar button.bg-blue-100 {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.toolbar select {
  transition: all 0.2s ease;
  font-size: 11px;
  min-width: 70px;
}

.toolbar select:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.toolbar select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-color: #3b82f6;
}

.toolbar button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

/* Styles pour les titres */
:deep(.tiptap-editor h1) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 12px 0 8px 0;
}

:deep(.tiptap-editor h2) {
  font-size: 1.3em;
  font-weight: 600;
  margin: 10px 0 6px 0;
}

:deep(.tiptap-editor h3) {
  font-size: 1.1em;
  font-weight: 600;
  margin: 8px 0 4px 0;
}

/* Styles pour les citations */
:deep(.tiptap-editor blockquote) {
  border-left: 3px solid #d1d5db;
  padding-left: 12px;
  margin: 8px 0;
  font-style: italic;
  color: #6b7280;
}

/* Styles pour le code */
:deep(.tiptap-editor code) {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
}

:deep(.tiptap-editor pre) {
  background-color: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

:deep(.tiptap-editor pre code) {
  background: none;
  padding: 0;
}

/* Tooltips pour les dates - UNIQUEMENT tooltips natifs */
:deep(.tiptap-editor .daily-note) {
  cursor: help !important;
}

:deep(.tiptap-editor .daily-note:hover) {
  background-color: rgba(59, 130, 246, 0.1) !important;
  border-radius: 3px !important;
}

/* Responsive design pour la barre d'outils */
@media (max-width: 640px) {
  .toolbar {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .toolbar button {
    padding: 4px;
  }
  
  .toolbar svg {
    width: 14px;
    height: 14px;
  }
  
  .toolbar select {
    min-width: 60px;
    font-size: 10px;
  }
}

/* Animation pour les transitions */
.rich-text-editor {
  transition: all 0.2s ease;
}

/* Amélioration de l'accessibilité */
.toolbar button:focus-visible {
  outline: 2px solid #9ca3af;
  outline-offset: 2px;
}
</style>
