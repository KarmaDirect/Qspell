'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  min: number
  max: number
  step?: number
  onValueChange: (value: number[]) => void
  className?: string
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, min, max, step = 1, onValueChange, className, disabled }, ref) => {
    const trackRef = React.useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = React.useState(false)

    const percentage = ((value[0] - min) / (max - min)) * 100

    const updateValue = React.useCallback((clientX: number) => {
      if (!trackRef.current || disabled) return

      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.min(Math.max(steppedValue, min), max)
      
      onValueChange([clampedValue])
    }, [min, max, step, onValueChange, disabled])

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e.clientX)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e.touches[0].clientX)
    }

    React.useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          updateValue(e.clientX)
        }
      }

      const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) {
          updateValue(e.touches[0].clientX)
        }
      }

      const handleEnd = () => {
        setIsDragging(false)
      }

      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleEnd)
        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', handleEnd)
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleEnd)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleEnd)
      }
    }, [isDragging, updateValue])

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <div
          ref={trackRef}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#1a1a1a] cursor-pointer"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Filled track */}
          <div 
            className="absolute h-full bg-[#c8ff00] transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Thumb */}
        <div
          className={cn(
            "absolute block h-5 w-5 rounded-full border-2 border-[#c8ff00] bg-[#c8ff00] transition-colors cursor-grab active:cursor-grabbing",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "pointer-events-none"
          )}
          style={{ 
            left: `calc(${percentage}% - 10px)`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
          tabIndex={disabled ? -1 : 0}
        />
      </div>
    )
  }
)

Slider.displayName = "Slider"

export { Slider }

