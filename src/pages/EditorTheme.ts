import {EditorView} from "@codemirror/view"

export const codeEditorTheme = EditorView.theme({
  "&": {
    
  },
  "&.cm-focused": {
      outline: 'none !important'
  },
  ".cm-content": {
    caretColor: "#0e9"
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#0e9"
  },
  "&.cm-focused .cm-selectionBackground, ::selection": {
    
  },
  ".cm-gutters": {
    background: 'white'
  }
}, {dark: false})