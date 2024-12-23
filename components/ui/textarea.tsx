import React from 'react'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => {
    return <textarea ref={ref} {...props} className={`border rounded px-2 py-1 ${props.className || ''}`} />
  }
)
Textarea.displayName = 'Textarea'

