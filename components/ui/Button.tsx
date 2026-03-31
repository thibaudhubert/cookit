import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none'

    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover shadow-apple hover:shadow-apple-lg active:scale-[0.98] focus:ring-accent',
      secondary: 'bg-surface border-2 border-text-primary text-text-primary hover:bg-gray-50 shadow-apple-lg hover:shadow-apple-xl active:scale-[0.98] focus:ring-text-primary',
      ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary focus:ring-text-secondary',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-apple hover:shadow-apple-lg active:scale-[0.98] focus:ring-red-600',
      success: 'bg-green-600 text-white hover:bg-green-700 shadow-apple hover:shadow-apple-lg active:scale-[0.98] focus:ring-green-600',
      outline: 'bg-transparent border-2 border-border text-text-primary hover:bg-surface-hover shadow-apple hover:shadow-apple-lg active:scale-[0.98] focus:ring-border',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
