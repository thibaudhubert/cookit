import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function Section({ title, description, action, children, className }: SectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h2 className="text-xl font-semibold text-text-primary">{title}</h2>}
            {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
