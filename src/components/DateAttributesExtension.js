import { Extension } from '@tiptap/core'

// Extension Tiptap pour préserver les attributs de date
const DateAttributes = Extension.create({
  name: 'dateAttributes',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'textStyle'],
        attributes: {
          'data-date': {
            default: null,
            parseHTML: element => element.getAttribute('data-date'),
            renderHTML: attributes => {
              if (!attributes['data-date']) {
                return {}
              }
              
              return {
                'data-date': attributes['data-date'],
                'title': attributes['data-date'],
                'class': 'daily-note'
              }
            },
          },
        },
      },
    ]
  },
})

export default DateAttributes