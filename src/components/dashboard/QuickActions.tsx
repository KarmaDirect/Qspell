'use client'

import Link from 'next/link'
import { Trophy, User, Users, TrendingUp, GraduationCap, ArrowRight } from 'lucide-react'

interface Action {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  gradient: string
  href: string
}

function ActionCard({ icon: Icon, title, description, gradient, href }: Action) {
  return (
    <Link href={href}>
      <div className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary transition-all duration-300 h-full">
        {/* Gradient hover effect */}
        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
        
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg bg-linear-to-br ${gradient} shrink-0`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            </div>
            
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>
      </div>
    </Link>
  )
}

export function QuickActions() {
  const actions: Action[] = [
    {
      icon: Trophy,
      title: 'Tournois',
      description: 'Rejoindre ou créer un tournoi',
      gradient: 'from-purple-600 to-blue-600',
      href: '/tournaments'
    },
    {
      icon: User,
      title: 'Mon profil',
      description: 'Gérer votre profil et stats',
      gradient: 'from-blue-600 to-cyan-600',
      href: '/profile'
    },
    {
      icon: Users,
      title: 'Trouver des coéquipiers',
      description: 'Chercher des joueurs',
      gradient: 'from-cyan-600 to-teal-600',
      href: '/teammates'
    },
    {
      icon: TrendingUp,
      title: 'Classements',
      description: 'Voir les leaderboards',
      gradient: 'from-orange-600 to-red-600',
      href: '/leaderboard'
    },
    {
      icon: GraduationCap,
      title: 'Coaching',
      description: 'Progresser avec un coach',
      gradient: 'from-pink-600 to-purple-600',
      href: '/coaching'
    },
  ]
  
  return (
    <section className="container py-8">
      <h2 className="text-2xl font-bold mb-6">Actions rapides</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <ActionCard key={action.title} {...action} />
        ))}
      </div>
    </section>
  )
}
