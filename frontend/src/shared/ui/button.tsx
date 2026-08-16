import { cloneElement, isValidElement } from 'react'
import type { ComponentProps, ReactElement } from 'react'

import { cn } from '@/shared/lib/utils'

type ButtonProps = ComponentProps<'button'> & {
  asChild?: false
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'icon'
}

type ButtonAsChildProps = {
  asChild: true
  children: ReactElement<{ className?: string }>
  className?: string
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild,
  children,
  ...props
}: ButtonProps | ButtonAsChildProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
    variant === 'default' && 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    variant === 'outline' && 'border border-input bg-card text-foreground hover:bg-secondary',
    variant === 'ghost' && 'text-foreground hover:bg-secondary',
    size === 'default' && 'h-10 px-4',
    size === 'sm' && 'h-9 px-3',
    size === 'icon' && 'size-10',
    className,
  )

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: cn(classes, children.props.className),
    })
  }

  return (
    <button className={classes} {...(props as ComponentProps<'button'>)}>
      {children}
    </button>
  )
}
