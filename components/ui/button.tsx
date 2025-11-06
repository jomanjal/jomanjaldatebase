import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[var(--primary01)] focus-visible:ring-[var(--primary01)]/50 focus-visible:ring-[3px] aria-invalid:ring-[var(--systemDanger01)]/20 dark:aria-invalid:ring-[var(--systemDanger01)]/40 aria-invalid:border-[var(--systemDanger01)]",
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary01)] text-white hover:bg-[var(--primary02)]',
        destructive:
          'bg-[var(--systemDanger01)] text-white hover:bg-[var(--systemDanger02)] focus-visible:ring-[var(--systemDanger01)]/20 dark:focus-visible:ring-[var(--systemDanger01)]/40',
        outline:
          'bg-[var(--layer01)] border border-[var(--divider01)] hover:bg-[var(--layer02Hover)] hover:text-[var(--text01)] dark:bg-[var(--inputReadonly)] dark:border-[var(--divider01)] dark:hover:bg-[var(--layer02Hover)]',
        secondary:
          'bg-[var(--layer02)] text-[var(--text01)] hover:bg-[var(--layer02Hover)]',
        ghost:
          'hover:bg-[var(--primaryOpacity01)] hover:text-[var(--textPrimary)]',
        link: 'text-[var(--textPrimary)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-md has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-11 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={{ 
        transition: 'var(--transition)',
        fontFamily: 'var(--font-korean)'
      }}
      {...props}
    />
  )
}

export { Button, buttonVariants }
