'use client'

import { useEffect, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { dracula } from '@uiw/codemirror-theme-dracula'

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

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={dracula}
      extensions={[getLanguageExtension(language)]}
      className="border border-gray-700 rounded"
    />
  )
}

