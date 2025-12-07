'use client'

import { User, Trophy, Award, DollarSign, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  trend?: string
}

function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="glass rounded-lg p-4 border-animated hover:scale-105 transition-transform">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        {trend && (
          <span className="text-sm text-[oklch(0.65_0.20_145)] font-medium">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

export function HeroSection({ username = 'hatim' }) {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient animé */}
      <div className="absolute inset-0 gradient-hero opacity-90" />
      
      {/* Orbes flous en arrière-plan */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[oklch(0.60_0.25_250)]/20 rounded-full blur-3xl" />
      
      <div className="relative container py-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-full bg-card/50 backdrop-blur flex items-center justify-center border-2 border-primary glow-purple">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">
              Bienvenue, {username} !
            </h1>
            <p className="text-white/80 text-lg">
              Prêt à dominer la Faille de l&apos;invocateur ?
            </p>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard icon={Trophy} label="Tournois joués" value="12" />
          <StatCard icon={Award} label="Victoires" value="8" />
          <StatCard icon={DollarSign} label="Cash gagné" value="450€" trend="+15%" />
          <StatCard icon={TrendingUp} label="Win Rate" value="66.7%" />
        </div>
      </div>
    </div>
  )
}
