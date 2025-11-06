'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlightMenuProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  triggerClassName?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

interface FlightMenuItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

function FlightMenu({
  value,
  onValueChange,
  placeholder = '선택하세요',
  children,
  triggerClassName,
  contentClassName,
  align = 'start',
  side = 'bottom',
}: FlightMenuProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>()

  // FlightMenuItem을 직접 찾는 방식으로 변경
  const items = React.Children.toArray(children)
    .filter((child) => {
      if (React.isValidElement(child)) {
        // FlightMenuItem 컴포넌트인지 확인
        const type = child.type as any
        return type === FlightMenuItem || 
               (type && (type.displayName === 'FlightMenuItem' || type.name === 'FlightMenuItem'))
      }
      return false
    })
    .map((child) => {
      if (React.isValidElement(child)) {
        const props = child.props as FlightMenuItemProps
        return {
          value: props.value,
          children: props.children,
          className: props.className,
        }
      }
      return null
    })
    .filter((item): item is { value: string; children: React.ReactNode; className?: string } => item !== null)

  const selectedItem = items.find((item) => item.value === value)
  const displayText = selectedItem ? selectedItem.children : placeholder

  React.useEffect(() => {
    if (triggerRef.current && open) {
      setTriggerWidth(triggerRef.current.offsetWidth)
    }
  }, [open])

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg bg-[var(--layer02)] px-3 py-2 text-sm text-[var(--text01)] border border-[var(--divider01)] hover:bg-[var(--layer02Hover)] outline-none focus-visible:ring-[var(--primary01)]/20 focus-visible:ring-[3px] transition-colors',
            triggerClassName
          )}
          aria-label={placeholder}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          side={side}
          sideOffset={8}
          style={{ 
            width: triggerWidth,
          }}
          data-flight-menu
          className={cn(
            'z-[60] rounded-lg border border-[var(--divider01)] bg-[var(--layer01)] text-[var(--text01)] p-1 shadow-[var(--shadow-lg)] outline-none !animate-none',
            contentClassName
          )}
        >
          <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
            {items.map((item) => {
              const isSelected = item.value === value
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onValueChange?.(item.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-[var(--text01)] outline-none transition-colors',
                    'hover:bg-[var(--layer02)] focus:bg-[var(--layer02)]',
                    item.className
                  )}
                >
                  <span className="flex-1 text-left text-[var(--text01)]">{item.children}</span>
                  {isSelected && (
                    <Check className="ml-2 h-4 w-4 text-[var(--textPrimary)]" />
                  )}
                </button>
              )
            })}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

function FlightMenuItem({ value, children, className }: FlightMenuItemProps) {
  // FlightMenuItem은 실제로 렌더링되지 않고, FlightMenu에서 children을 파싱할 때만 사용됩니다
  return null
}

FlightMenuItem.displayName = 'FlightMenuItem'

export { FlightMenu, FlightMenuItem }

