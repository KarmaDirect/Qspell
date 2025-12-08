'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type ObjectiveType = 'dragon' | 'baron' | 'elder' | 'tower' | 'inhibitor'

interface ObjectiveIconProps {
  type: ObjectiveType
  count?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const objectiveConfig: Record<ObjectiveType, { 
  src: string
  alt: string
  defaultColor: string
  emoji: string
}> = {
  dragon: {
    src: '/images/objectives/drake.png',
    alt: 'Dragon',
    defaultColor: 'text-orange-400',
    emoji: '🐉' // Fallback temporaire si l'image ne charge pas
  },
  baron: {
    src: '/images/objectives/baron.png',
    alt: 'Baron Nashor',
    defaultColor: 'text-purple-400',
    emoji: '❌' // Fallback uniquement si l'image ne charge pas
  },
  elder: {
    src: '/images/objectives/elder.png',
    alt: 'Elder Dragon',
    defaultColor: 'text-red-400',
    emoji: '🔥'
  },
  tower: {
    src: '/images/objectives/tower.png',
    alt: 'Tower',
    defaultColor: 'text-yellow-400',
    emoji: '❌' // Fallback uniquement si l'image ne charge pas
  },
  inhibitor: {
    src: '/images/objectives/inhibitor.png',
    alt: 'Inhibitor',
    defaultColor: 'text-blue-400',
    emoji: '⚡'
  }
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
}

export function ObjectiveIcon({ 
  type, 
  count, 
  size = 'md',
  className 
}: ObjectiveIconProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const config = objectiveConfig[type]
  const sizeClass = sizeClasses[size]

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    console.error(`❌ Failed to load objective icon: ${config.src}`, {
      type,
      src: config.src,
      attemptedSrc: target.src,
      naturalWidth: target.naturalWidth,
      naturalHeight: target.naturalHeight,
      complete: target.complete
    })
    setImageError(true)
  }

  const handleLoad = () => {
    setImageLoaded(true)
  }

  // Fallback sur emoji si l'image ne charge pas
  if (imageError) {
    return (
      <span className={cn("text-sm leading-none", config.defaultColor, className)}>
        {config.emoji}
      </span>
    )
  }

  // Utiliser un <img> standard pour les images locales pour éviter les problèmes avec next/image
  return (
    <div className={cn("relative shrink-0 flex items-center justify-center", sizeClass, className)}>
      <img
        src={config.src}
        alt={config.alt}
        width={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
        height={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
        className="object-contain w-full h-full"
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse flex items-center justify-center">
          <div className="w-2 h-2 bg-[#888] rounded-full" />
        </div>
      )}
    </div>
  )
}

