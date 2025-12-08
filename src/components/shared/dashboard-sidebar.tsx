'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { 
  Home, 
  Users, 
  User,
  LogOut,
  Calendar,
  Trophy,
  TrendingUp,
  GraduationCap,
  UserPlus,
  BarChart3,
  Settings,
  Flag,
  LayoutDashboard,
  ShoppingBag,
  Wallet
} from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: Home, exact: true },
  { href: '/dashboard/teams', label: 'Équipes', icon: Users },
  { href: '/dashboard/tournaments', label: 'Tournois', icon: Trophy },
  { href: '/dashboard/leaderboard', label: 'Classements', icon: TrendingUp },
  { href: '/dashboard/coaching', label: 'Coaching', icon: GraduationCap },
  { href: '/dashboard/find-teammates', label: 'Coéquipiers', icon: UserPlus },
  { href: '/dashboard/calendar', label: 'Calendrier', icon: Calendar },
  { href: '/dashboard/wallet', label: 'Boutique QP', icon: ShoppingBag },
  { href: '/dashboard/profile', label: 'Mon Profil', icon: User },
]

const adminNavItems = [
  { href: '/dashboard/admin', label: 'Dashboard Admin', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/dashboard/admin/tournaments', label: 'Tournois', icon: Trophy },
  { href: '/dashboard/admin/calendar', label: 'Événements', icon: Calendar },
  { href: '/dashboard/admin/coaching', label: 'Coaching', icon: GraduationCap },
  { href: '/dashboard/admin/finance', label: 'Finance', icon: Wallet },
  { href: '/dashboard/admin/moderation', label: 'Modération', icon: Flag },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/settings', label: 'Paramètres', icon: Settings, ceoOnly: true },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    checkUserProfile()
  }, [])

  const checkUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, username, display_name')
        .eq('id', user.id)
        .single<{ role: string; username: string; display_name: string | null }>()
      
      if (profile) {
        const name = profile.display_name || profile.username
        setUsername(name)
        setUserRole(profile.role)
        if (['admin', 'ceo'].includes(profile.role)) {
          setIsAdmin(true)
        }
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

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-[#1a1a1a]">
        <Link href="/dashboard">
          <Logo size="md" />
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-semibold text-[#c8ff00]">
            {username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{username || 'Chargement...'}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#c8ff00]" />
              <span className="text-xs text-[#666]">En ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {/* Menu label */}
        <p className="px-3 mb-2 text-[10px] font-semibold text-[#444] uppercase tracking-widest">
          Menu
        </p>
        
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? 'bg-[#c8ff00] text-[#0a0a0a]' 
                    : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                }`}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-6">
            <p className="px-3 mb-2 text-[10px] font-semibold text-[#444] uppercase tracking-widest">
              Administration
            </p>
            <div className="space-y-0.5">
              {adminNavItems.map((item) => {
                if (item.ceoOnly && userRole !== 'ceo') return null
                
                const Icon = item.icon
                const active = isActive(item.href, item.exact)
                
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active 
                        ? 'bg-[#c8ff00] text-[#0a0a0a]' 
                        : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                    }`}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[#1a1a1a]">
        {/* Role badge */}
        {userRole && ['admin', 'ceo'].includes(userRole) && (
          <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a]">
            <div className="w-2 h-2 rounded-full bg-[#c8ff00]" />
            <span className="text-xs font-semibold text-[#c8ff00]">
              {userRole.toUpperCase()}
            </span>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#666] hover:text-white hover:bg-[#1a1a1a] transition-all"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

