"use client"

import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

// Custom Dropdown Menu sans dépendance @radix-ui

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = React.useCallback((value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value)
    } else {
      setInternalOpen(value)
    }
  }, [onOpenChange])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ 
  children, 
  asChild,
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setOpen(!open)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      'aria-expanded': open,
      'aria-haspopup': 'menu',
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ 
  children, 
  className,
  align = 'start',
  sideOffset = 4,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, setOpen])

  if (!open) return null

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#1a1a1a] bg-[#141414] p-1 text-white shadow-md animate-in fade-in-0 zoom-in-95",
        alignClasses[align],
        className
      )}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      role="menu"
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ 
  children, 
  className,
  onSelect,
  disabled,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  onSelect?: () => void
  disabled?: boolean
}) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    
    if (onSelect) {
      onSelect()
    }
    setOpen(false)
    
    if (props.onClick) {
      props.onClick(e)
    }
  }

  return (
    <div
      role="menuitem"
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        disabled 
          ? "pointer-events-none opacity-50" 
          : "hover:bg-[#1a1a1a] hover:text-white focus:bg-[#1a1a1a] focus:text-white",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold text-[#888]", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-[#1a1a1a]", className)}
      {...props}
    />
  )
}

export function DropdownMenuShortcut({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}

// Exports pour compatibilité
export const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>
export const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>

export function DropdownMenuSubTrigger({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-[#1a1a1a]",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </div>
  )
}

export function DropdownMenuSubContent({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-[#1a1a1a] bg-[#141414] p-1 text-white shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuCheckboxItem({ 
  children, 
  className,
  checked,
  onCheckedChange,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  const handleClick = () => {
    if (onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-[#1a1a1a]",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

export function DropdownMenuRadioItem({ 
  children, 
  className,
  value,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string
}) {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-[#1a1a1a]",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Circle className="h-2 w-2 fill-current" />
      </span>
      {children}
    </div>
  )
}

