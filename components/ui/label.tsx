import React from 'react'

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = (props) => {
  return <label {...props} className={`block text-sm font-medium text-gray-700 ${props.className || ''}`} />
}

