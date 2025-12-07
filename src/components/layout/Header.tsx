'use client'

import Link from 'next/link'
import { Home, Trophy, Users, TrendingUp, GraduationCap, UserPlus, User, LogOut, Shield, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

function NavLink({ href, icon: Icon, children }: NavLinkProps) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors relative group"
    >
      <Icon className="h-4 w-4" />
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
    </Link>
  )
}

export function Header() {
  // TODO: Récupérer le user réel depuis l'auth
  const user = { username: 'hatim', role: 'admin' }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container flex h-16 items-center">
        {/* Logo avec glow */}
        <Link href="/" className="flex items-center gap-2 mr-8">
          <div className="relative">
            <Zap className="h-6 w-6 text-primary glow-purple" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            QSPELL
          </span>
        </Link>
        
        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          <NavLink href="/" icon={Home}>Accueil</NavLink>
          <NavLink href="/tournaments" icon={Trophy}>Tournois</NavLink>
          <NavLink href="/teams" icon={Users}>Équipes</NavLink>
          <NavLink href="/leaderboard" icon={TrendingUp}>Classements</NavLink>
          <NavLink href="/coaching" icon={GraduationCap}>Coaching</NavLink>
          <NavLink href="/teammates" icon={UserPlus}>Coéquipiers</NavLink>
        </nav>
        
        <div className="ml-auto flex items-center gap-4">
          {/* Badge Admin si role admin */}
          {user.role === 'admin' && (
            <Badge className="gradient-gold glow-gold">
              <Shield className="h-3 w-3 mr-1" />
              Admin CEO
            </Badge>
          )}
          
          {/* Profil */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  )
}
