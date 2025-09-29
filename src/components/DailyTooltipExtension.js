import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const DailyTooltipExtension = Extension.create({
  name: 'dailyTooltip',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle', 'span'],
        attributes: {
          'data-daily-date': {
            default: null,
            parseHTML: element => element.getAttribute('data-daily-date'),
            renderHTML: attributes => {
              if (!attributes['data-daily-date']) {
                return {}
              }

              return {
                'data-daily-date': attributes['data-daily-date'],
                title: `Written on ${attributes['data-daily-date']}`,
                style: 'cursor: help;'
              }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('dailyTooltip'),
        
        props: {
          handleDOMEvents: {
            mouseover: (view, event) => {
              const target = event.target
              
              // Vérifier si c'est un span avec couleur (notre texte coloré du jour)
              const isColoredSpan = target.tagName === 'SPAN' && 
                                   target.style && 
                                   target.style.color && 
                                   target.style.color.includes('rgb(') &&
                                   target.textContent &&
                                   target.textContent.trim()
              
              console.log('🔍 EXTENSION - Mouse over on:', {
                tagName: target.tagName,
                isColoredSpan,
                style: target.getAttribute('style'),
                text: target.textContent?.substring(0, 20)
              })
              
              if (isColoredSpan) {
                console.log('🎯 TOOLTIP EXTENSION - Colored span detected!')
                
                // Remove existing tooltip
                const existing = document.querySelector('.daily-tooltip-extension')
                if (existing) existing.remove()
                
                // Create new tooltip with today's date
                const today = new Date()
                const dateStr = today.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
                
                const tooltip = document.createElement('div')
                tooltip.className = 'daily-tooltip-extension'
                tooltip.textContent = dateStr
                tooltip.style.cssText = `
                  position: fixed;
                  background: #1a202c;
                  color: white;
                  padding: 8px 12px;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 500;
                  z-index: 99999;
                  pointer-events: none;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                  border: 1px solid #4a5568;
                  max-width: 200px;
                  white-space: nowrap;
                  top: ${event.clientY - 40}px;
                  left: ${event.clientX + 10}px;
                `
                document.body.appendChild(tooltip)
                
                                console.log('✅ Tooltip created:', dateStr)
                return false // Prevent propagation
              }
            },
            
            mouseout: (view, event) => {
              const target = event.target
              const isColoredSpan = target.tagName === 'SPAN' && 
                                   target.style && 
                                   target.style.color && 
                                   target.style.color.includes('rgb(')
              
              if (isColoredSpan) {
                console.log('🎯 TOOLTIP EXTENSION - Mouse out detected!')
                const tooltip = document.querySelector('.daily-tooltip-extension')
                if (tooltip) {
                  tooltip.remove()
                  console.log('✅ Tooltip removed')
                }
                return false
              }
            }
          }
        }
      })
    ]
  }
})