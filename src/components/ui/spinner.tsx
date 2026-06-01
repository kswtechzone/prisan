import { cn } from "@/lib/utils"

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin",
        className
      )}
    />
  )
}

export { Spinner }
