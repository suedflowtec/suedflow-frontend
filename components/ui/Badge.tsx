// components/ui/Badge.tsx
import { cn } from '@/lib/utils'

type BadgeVariant = 'orange' | 'green' | 'purple' | 'blue' | 'red' | 'gold' | 'glass'

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  orange: 'badge-orange',
  green: 'badge-green',
  purple: 'badge-purple',
  blue: 'badge-blue',
  red: 'badge-red',
  gold: 'badge-gold',
  glass: 'badge-gray',
}

export function Badge({
  variant = 'glass', children, className,
}: {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}) {
  return <span className={cn('badge', VARIANT_CLASS[variant], className)}>{children}</span>
}
