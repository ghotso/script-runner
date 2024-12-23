import * as React from "react"

interface SelectProps<T extends string> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: T) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps<string>>(
  ({ className = '', onValueChange, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background 
          file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50 text-foreground
          bg-white/5 border-white/10 focus:border-white/20 [&>option]:text-black ${className}`}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      >
        {props.children}
      </select>
    )
  }
)
Select.displayName = 'Select'

