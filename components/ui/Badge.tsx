// components/ui/Badge.tsx
import { cn } from '@/lib/utils'

type BadgeVariant = 'orange' | 'green' | 'purple' | 'blue' | 'red' | 'gold' | 'glass'

export function Badge({
  variant = 'glass', children, className,
}: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return <span className={cn(`badge-${variant}`, className)}>{children}</span>
}
