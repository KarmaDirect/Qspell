import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  User, 
  Gamepad2, 
  Plus,
  Trophy,
  GraduationCap,
  UserPlus,
  ArrowRight,
  Swords,
  Target,
  Flame
} from 'lucide-react'
import { TeamInvitations } from '@/components/teams/team-invitations'
import { Calendar } from '@/components/calendar/calendar'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']

export default async function DashboardPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  const { data: riotAccounts } = await supabase
    .from('riot_accounts')
    .select('*')
    .eq('profile_id', user.id) as { data: RiotAccount[] | null }

  const { count: teamsCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  const { data: upcomingTournaments } = await supabase
    .from('tournaments')
    .select('*')
    .in('status', ['registration_open', 'upcoming'])
    .limit(3)
    .order('tournament_start', { ascending: true })
    .returns<Array<{
      id: string
      name: string
      tournament_start: string
      status: string
    }>>()

  const displayName = profile?.display_name || profile?.username || 'Invocateur'

  return (
    <div className="space-y-8">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-[#1a1a1a] p-8">
        <div className="relative z-10">
          <Badge className="mb-4 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20 hover:bg-[#c8ff00]/20">
            <Flame className="h-3 w-3 mr-1" />
            Dashboard
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenue, <span className="text-[#c8ff00]">{displayName}</span>
          </h1>
          <p className="text-[#666] max-w-xl">
            Gérez vos équipes, participez aux tournois et dominez la compétition sur QSPELL.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c8ff00]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#c8ff00]/10 rounded-full blur-2xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{teamsCount || 0}</p>
              <p className="text-sm text-[#666] mt-1">Équipes</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
              <Users className="h-6 w-6 text-[#c8ff00]" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{riotAccounts?.length || 0}</p>
              <p className="text-sm text-[#666] mt-1">Comptes Riot</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
              <Gamepad2 className="h-6 w-6 text-[#c8ff00]" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{upcomingTournaments?.length || 0}</p>
              <p className="text-sm text-[#666] mt-1">Tournois actifs</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
              <Trophy className="h-6 w-6 text-[#c8ff00]" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-white">-</p>
              <p className="text-sm text-[#666] mt-1">Rang moyen</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
              <Target className="h-6 w-6 text-[#c8ff00]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Actions rapides</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/dashboard/teams">
            <Card className="p-4 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 hover:bg-[#1a1a1a] transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
                  <Plus className="h-5 w-5 text-[#c8ff00]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Créer équipe</p>
                  <p className="text-xs text-[#444]">Nouvelle team</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/dashboard/tournaments">
            <Card className="p-4 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 hover:bg-[#1a1a1a] transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
                  <Swords className="h-5 w-5 text-[#c8ff00]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Tournois</p>
                  <p className="text-xs text-[#444]">Participer</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/dashboard/find-teammates">
            <Card className="p-4 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 hover:bg-[#1a1a1a] transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
                  <UserPlus className="h-5 w-5 text-[#c8ff00]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Coéquipiers</p>
                  <p className="text-xs text-[#444]">Trouver</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link href="/dashboard/coaching">
            <Card className="p-4 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 hover:bg-[#1a1a1a] transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center group-hover:bg-[#c8ff00]/20 transition-all">
                  <GraduationCap className="h-5 w-5 text-[#c8ff00]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Coaching</p>
                  <p className="text-xs text-[#444]">Progresser</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Team Invitations */}
      <TeamInvitations />

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Tournaments */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Tournois à venir</h2>
            <Link href="/dashboard/tournaments" className="text-xs text-[#c8ff00] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          {!upcomingTournaments || upcomingTournaments.length === 0 ? (
            <Card className="p-8 text-center bg-[#141414] border-[#1a1a1a]">
              <Trophy className="h-10 w-10 mx-auto text-[#333] mb-3" />
              <p className="text-sm text-[#666]">Aucun tournoi à venir</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {upcomingTournaments.map((tournament) => (
                <Link key={tournament.id} href={`/dashboard/tournaments/${tournament.id}`}>
                  <Card className="p-4 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-[#c8ff00]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">{tournament.name}</h3>
                        <p className="text-xs text-[#666]">
                          {new Date(tournament.tournament_start).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0 text-[10px]">
                        {tournament.status === 'registration_open' ? 'Ouvert' : 'À venir'}
                      </Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Calendrier</h2>
            <Link href="/dashboard/calendar" className="text-xs text-[#c8ff00] hover:underline flex items-center gap-1">
              Voir tout <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <Card className="bg-[#141414] border-[#1a1a1a] p-4">
            <Calendar compact />
          </Card>
        </div>
      </div>
    </div>
  )
}
