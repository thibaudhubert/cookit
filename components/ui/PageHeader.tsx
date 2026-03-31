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
    <div className={cn('mb-10', className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight">{title}</h1>
          {description && (
            <p className="mt-3 text-lg text-text-secondary">{description}</p>
          )}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  )
}
