'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Sparkles, Trophy } from 'lucide-react'

interface CoachingHeroProps {
  hasSubscription: boolean
}

export function CoachingHero({ hasSubscription }: CoachingHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-600 via-blue-600 to-purple-800 p-12 text-white">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <GraduationCap className="h-8 w-8" />
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {hasSubscription ? '✓ Abonnement Actif' : 'Premium'}
          </Badge>
        </div>

        <h1 className="text-5xl font-bold mb-4">
          Espace Coaching QSPELL
        </h1>
        
        <p className="text-xl text-blue-100 mb-6 max-w-2xl">
          Débloquez votre potentiel avec nos formations premium et nos sessions de coaching personnalisées
        </p>

        {hasSubscription && (
          <div className="flex items-center gap-2 text-green-300">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">Vous avez accès à toutes les formations</span>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
    </div>
  )
}

