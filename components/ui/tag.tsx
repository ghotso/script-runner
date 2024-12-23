import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

const tagVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        rose: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
        pink: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
        fuchsia: "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30",
        purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
        violet: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
        indigo: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
        blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        cyan: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
        teal: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
        emerald: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        green: "bg-green-500/20 text-green-400 border border-green-500/30",
        lime: "bg-lime-500/20 text-lime-400 border border-lime-500/30",
        yellow: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        amber: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        orange: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
        red: "bg-red-500/20 text-red-400 border border-red-500/30",
      }
    },
    defaultVariants: {
      variant: "blue"
    }
  }
)

export interface TagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {}

export function Tag({ className, variant, ...props }: TagProps) {
  return (
    <span className={tagVariants({ variant, className })} {...props} />
  )
}

