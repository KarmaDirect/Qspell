import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy, Calendar, BarChart3, TrendingUp } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) redirect('/dashboard')

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
    { label: 'Utilisateurs', value: usersCount || 0, change: '+12%', icon: Users },
    { label: 'Équipes', value: teamsCount || 0, change: '+8%', icon: Users },
    { label: 'Tournois', value: tournamentsCount || 0, change: '+5%', icon: Trophy },
    { label: 'Événements', value: eventsCount || 0, change: '+15%', icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <BarChart3 className="h-3 w-3 mr-1" />
          Analytics
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-[#666]">Statistiques et métriques de la plateforme</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className="p-5 bg-[#141414] border-[#1a1a1a]">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#c8ff00]" />
                </div>
                <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0 text-[10px] gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {s.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-[#666] mt-1">{s.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 bg-[#141414] border-[#1a1a1a]">
          <h3 className="font-semibold text-white mb-4">Top Régions</h3>
          {[
            { region: 'EUW', percent: 45 },
            { region: 'EUNE', percent: 28 },
            { region: 'NA', percent: 17 },
            { region: 'Autres', percent: 10 },
          ].map((r, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#888]">{r.region}</span>
                <span className="text-white font-medium">{r.percent}%</span>
              </div>
              <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#c8ff00] rounded-full transition-all" 
                  style={{ width: `${r.percent}%` }} 
                />
              </div>
            </div>
          ))}
        </Card>

        <Card className="p-5 bg-[#141414] border-[#1a1a1a]">
          <h3 className="font-semibold text-white mb-4">Engagement</h3>
          {[
            { label: 'Sessions/jour', value: '324' },
            { label: 'Durée moyenne', value: '12 min' },
            { label: 'Taux de rétention', value: '68%' },
            { label: 'Nouveaux/jour', value: '45' },
          ].map((m, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-[#1a1a1a] last:border-0">
              <span className="text-sm text-[#888]">{m.label}</span>
              <span className="text-sm text-white font-medium">{m.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}

