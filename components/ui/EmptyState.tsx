import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon = '📭', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-16 px-4', className)}>
      <div className="text-7xl mb-6">{icon}</div>
      <h3 className="text-2xl font-semibold text-text-primary mb-3">{title}</h3>
      {description && (
        <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
