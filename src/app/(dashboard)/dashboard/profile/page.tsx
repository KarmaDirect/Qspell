import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/profile-header'
import { RecentGamesCard } from '@/components/profile/recent-games-card'
import { ChampionsPlayedCard } from '@/components/profile/champions-played-card'
import { RankDisplayCard } from '@/components/profile/rank-display-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Gamepad2, 
  Users, 
  Activity,
  Trophy,
  Zap,
  Info
} from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']
type PlayerStats = Database['public']['Tables']['player_stats']['Row']

export default async function ProfilePage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  // Fetch riot accounts
  const { data: riotAccounts } = await supabase
    .from('riot_accounts')
    .select('*')
    .eq('profile_id', user.id)
    .order('is_primary', { ascending: false }) as { data: RiotAccount[] | null }

  // Fetch player stats for primary account
  const primaryAccount = riotAccounts?.find(acc => acc.is_primary) || riotAccounts?.[0]
  const { data: playerStats } = primaryAccount
    ? await supabase
        .from('player_stats')
        .select('*')
        .eq('riot_account_id', primaryAccount.id) as { data: PlayerStats[] | null }
    : { data: null }

  // Fetch team membership count
  const { count: teamsCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  const hasRiotAccount = riotAccounts && riotAccounts.length > 0

  return (
    <div className="space-y-8">
      {/* Profile Header with integrated title */}
      <ProfileHeader profile={profile} />
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column - Main Content (75% de l'espace) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Recent Games */}
          {primaryAccount && (
            <RecentGamesCard riotAccount={primaryAccount} />
          )}
        </div>

        {/* Right Column - Sidebar (25% de l'espace) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Rank Display */}
          {primaryAccount && playerStats && playerStats.length > 0 && (
            <RankDisplayCard stats={playerStats} />
          )}

          {/* Champions Played */}
          {primaryAccount && (
            <ChampionsPlayedCard riotAccount={primaryAccount} />
          )}

          {/* Quick Stats */}
          <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-[#c8ff00]" />
              Statistiques rapides
            </h3>
            <div className="space-y-4">
              <StatItem 
                icon={Users} 
                label="Équipes" 
                value={String(teamsCount || 0)} 
                color="text-[#c8ff00]"
              />
              <StatItem 
                icon={Gamepad2} 
                label="Comptes Riot" 
                value={String(riotAccounts?.length || 0)} 
                color="text-blue-400"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatItem({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm text-[#666]">{label}</span>
      </div>
      <span className="font-bold text-lg text-white">{value}</span>
    </div>
  )
}
