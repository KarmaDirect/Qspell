import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { UserRole } from '@/lib/auth/roles'
import { 
  Users, 
  Calendar,
  ArrowUpRight,
  Trophy,
  Activity,
  Shield,
  TrendingUp
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single<{ role: UserRole; username: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const [
    { count: usersCount },
    { count: teamsCount },
    { count: tournamentsCount },
    { count: eventsCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('calendar_events').select('*', { count: 'exact', head: true })
  ])

  const stats = [
    { label: 'Utilisateurs', value: usersCount || 0, icon: Users, href: '/dashboard/admin/users', change: '+12%' },
    { label: 'Équipes', value: teamsCount || 0, icon: Users, href: '/dashboard/admin/users', change: '+8%' },
    { label: 'Tournois', value: tournamentsCount || 0, icon: Trophy, href: '/dashboard/admin/tournaments', change: '+5%' },
    { label: 'Finance', value: '💰', icon: TrendingUp, href: '/dashboard/admin/finance', change: 'Dashboard' },
    { label: 'Événements', value: eventsCount || 0, icon: Calendar, href: '/dashboard/admin/calendar', change: '+15%' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-[#1a1a1a] p-8">
        <div className="relative z-10">
          <Badge className="mb-4 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
            <Shield className="h-3 w-3 mr-1" />
            Administration
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard Admin
          </h1>
          <p className="text-[#666] max-w-xl">
            Vue d'ensemble de la plateforme QSPELL. Gérez les utilisateurs, tournois et événements.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8ff00]/5 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Link key={i} href={stat.href}>
              <Card className="p-5 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
                    <Icon className="h-6 w-6 text-[#c8ff00]" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#c8ff00]">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-[#666]">{stat.label}</p>
                  <ArrowUpRight className="h-4 w-4 text-[#444] group-hover:text-[#c8ff00] transition-all" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/admin/users">
          <Card className="p-6 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
                <Users className="h-7 w-7 text-[#c8ff00]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Gérer les utilisateurs</h3>
                <p className="text-sm text-[#666]">Modifier les rôles et permissions</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/admin/calendar">
          <Card className="p-6 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
                <Calendar className="h-7 w-7 text-[#c8ff00]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Gérer le calendrier</h3>
                <p className="text-sm text-[#666]">Ajouter ou modifier les événements</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Activity */}
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <h2 className="text-lg font-semibold text-white mb-4">Activité récente</h2>
        <div className="text-center py-12 text-[#666]">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune activité récente</p>
        </div>
      </Card>
    </div>
  )
}
