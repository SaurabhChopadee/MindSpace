import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground leading-relaxed shadow-sm transition-all resize-none',
        'placeholder:text-muted-foreground/70',
        'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
