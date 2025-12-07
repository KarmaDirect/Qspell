'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Trophy, 
  Users, 
  GraduationCap, 
  UserPlus, 
  TrendingUp, 
  User,
  LogOut,
  Menu,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home },
  { href: '/dashboard/tournaments', label: 'Tournois', icon: Trophy },
  { href: '/dashboard/teams', label: 'Équipes', icon: Users },
  { href: '/dashboard/leaderboard', label: 'Classements', icon: TrendingUp },
  { href: '/dashboard/find-teammates', label: 'Coéquipiers', icon: UserPlus },
  { href: '/dashboard/coaching', label: 'Coaching', icon: GraduationCap },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    checkAdminRole()
  }, [])

  const checkAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single<{ role: string }>()
      
      if (profile && ['admin', 'ceo'].includes(profile.role)) {
        setIsAdmin(true)
        setUserRole(profile.role)
      }
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      toast.error('Erreur lors de la déconnexion')
      return
    }

    toast.success('Déconnecté avec succès')
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hidden sm:inline">
              QSPELL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/dashboard/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                  {userRole === 'ceo' && (
                    <Badge variant="destructive" className="ml-1">CEO</Badge>
                  )}
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}

