'use client'

import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'python' | 'bash' | 'plaintext'
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case 'python':
        return python()
      case 'bash':
        return StreamLanguage.define(shell)
      case 'plaintext':
      default:
        return []
    }
  }

  const deepBlackTheme = createTheme({
    theme: 'dark',
    settings: {
      background: '#0a0a0a',
      foreground: '#f8f8f2',
      caret: '#f8f8f0',
      selection: '#44475a',
      selectionMatch: '#44475a',
      lineHighlight: '#1f1f1f',
      gutterBackground: '#0a0a0a',
      gutterForeground: '#6272a4',
    },
    styles: [
      { tag: t.comment, color: '#6272a4' },
      { tag: t.keyword, color: '#ff79c6' },
      { tag: t.string, color: '#f1fa8c' },
      { tag: t.number, color: '#bd93f9' },
      { tag: t.operator, color: '#ff79c6' },
      { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#50fa7b' },
      { tag: t.variableName, color: '#f8f8f2' },
      { tag: t.definition(t.variableName), color: '#50fa7b' },
      { tag: t.className, color: '#8be9fd' },
      { tag: t.propertyName, color: '#66d9ef' },
    ],
  })

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={deepBlackTheme}
      extensions={[getLanguageExtension(language)]}
      className="border border-gray-700 rounded custom-code-editor"
    />
  )
}

