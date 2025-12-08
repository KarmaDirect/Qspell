'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 48, text: 'text-2xl' },
  }

  const s = sizes[size]

  return (
    <div className="flex items-center gap-2">
      {/* Q Logo */}
      <div 
        className="relative flex items-center justify-center rounded-lg bg-[#c8ff00]"
        style={{ width: s.icon, height: s.icon }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-[65%] h-[65%]"
        >
          {/* Q shape */}
          <path 
            d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C13.85 20 15.55 19.4 16.9 18.4L19 20.5L20.5 19L18.4 16.9C19.4 15.55 20 13.85 20 12C20 7.58 16.42 4 12 4ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18Z" 
            fill="#0a0a0a"
          />
          {/* Inner accent */}
          <circle cx="12" cy="12" r="4" fill="#0a0a0a" />
        </svg>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-[#c8ff00] blur-md opacity-40 -z-10" />
      </div>
      
      {showText && (
        <span className={`font-bold ${s.text} text-white tracking-tight`}>
          QSPELL
        </span>
      )}
    </div>
  )
}

