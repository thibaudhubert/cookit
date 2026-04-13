import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8 sm:mb-10', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 sm:mt-3 text-base sm:text-lg text-text-secondary">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
