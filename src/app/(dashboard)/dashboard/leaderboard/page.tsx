import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Trophy, 
  Users, 
  Crown,
  Medal,
  Star
} from 'lucide-react'

export default async function LeaderboardPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch top players by rank (from riot_accounts)
  const { data: topPlayers } = await supabase
    .from('riot_accounts')
    .select(`
      *,
      profile:profiles(username, display_name, avatar_url)
    `)
    .not('solo_rank', 'is', null)
    .limit(50)
    .returns<Array<{
      id: string
      game_name: string
      tag_line: string
      solo_rank: string | null
      solo_lp: number | null
      profile: { username: string; display_name: string | null } | null
    }>>()

  // Fetch top teams
  const { data: topTeams } = await supabase
    .from('teams')
    .select(`
      *,
      captain:profiles!teams_captain_id_fkey(username, display_name)
    `)
    .limit(20)
    .returns<Array<{
      id: string
      name: string
      tag: string
      region: string
      captain: { username: string; display_name: string | null } | null
    }>>()

  const getRankColor = (rank: string | null) => {
    if (!rank) return 'text-gray-400'
    const tier = rank.split(' ')[0].toLowerCase()
    const colors: Record<string, string> = {
      iron: 'text-gray-400',
      bronze: 'text-amber-700',
      silver: 'text-gray-300',
      gold: 'text-yellow-400',
      platinum: 'text-teal-400',
      emerald: 'text-emerald-400',
      diamond: 'text-blue-400',
      master: 'text-purple-400',
      grandmaster: 'text-red-400',
      challenger: 'text-yellow-300',
    }
    return colors[tier] || 'text-gray-400'
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-[#c8ff00]" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-300" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm text-[#666]">{index + 1}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <TrendingUp className="h-3 w-3 mr-1" />
          Compétition
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Classements</h1>
        <p className="text-[#666]">
          Les meilleurs joueurs et équipes de QSPELL
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="players" className="space-y-6">
        <TabsList className="bg-[#141414] border border-[#1a1a1a]">
          <TabsTrigger value="players" className="gap-2 data-[state=active]:bg-[#c8ff00]/10 data-[state=active]:text-[#c8ff00]">
            <Star className="h-4 w-4" />
            Joueurs
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-2 data-[state=active]:bg-[#c8ff00]/10 data-[state=active]:text-[#c8ff00]">
            <Users className="h-4 w-4" />
            Équipes
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="gap-2 data-[state=active]:bg-[#c8ff00]/10 data-[state=active]:text-[#c8ff00]">
            <Trophy className="h-4 w-4" />
            Tournois
          </TabsTrigger>
        </TabsList>

        {/* Players Leaderboard */}
        <TabsContent value="players">
          <Card className="overflow-hidden bg-[#141414] border-[#1a1a1a]">
            <div className="p-4 border-b border-[#1a1a1a] bg-gradient-to-r from-[#c8ff00]/10 to-transparent">
              <h2 className="font-bold flex items-center gap-2 text-white">
                <Star className="h-5 w-5 text-[#c8ff00]" />
                Classement SoloQ
              </h2>
            </div>
            
            {!topPlayers || topPlayers.length === 0 ? (
              <div className="p-12 text-center text-[#666]">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-white">Aucun joueur classé pour le moment</p>
                <p className="text-sm mt-1">Liez votre compte Riot pour apparaître !</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a]">
                {topPlayers.map((player, index) => (
                  <div key={player.id} className={`p-4 flex items-center gap-4 hover:bg-[#1a1a1a] transition-colors ${index < 3 ? 'bg-gradient-to-r from-[#c8ff00]/5 to-transparent' : ''}`}>
                    <div className="w-8 flex justify-center">
                      {getMedalIcon(index)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-sm font-bold text-[#c8ff00]">
                      {player.profile?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">
                        {player.profile?.display_name || player.profile?.username || 'Joueur'}
                      </p>
                      <p className="text-sm text-[#666]">
                        {player.game_name}#{player.tag_line}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getRankColor(player.solo_rank)}`}>
                        {player.solo_rank || 'Unranked'}
                      </p>
                      <p className="text-sm text-[#666]">
                        {player.solo_lp ? `${player.solo_lp} LP` : '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Teams Leaderboard */}
        <TabsContent value="teams">
          <Card className="overflow-hidden bg-[#141414] border-[#1a1a1a]">
            <div className="p-4 border-b border-[#1a1a1a] bg-gradient-to-r from-[#c8ff00]/10 to-transparent">
              <h2 className="font-bold flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-[#c8ff00]" />
                Meilleures équipes
              </h2>
            </div>
            
            {!topTeams || topTeams.length === 0 ? (
              <div className="p-12 text-center text-[#666]">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-white">Aucune équipe classée pour le moment</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1a1a]">
                {topTeams.map((team, index) => (
                  <div key={team.id} className={`p-4 flex items-center gap-4 hover:bg-[#1a1a1a] transition-colors ${index < 3 ? 'bg-gradient-to-r from-[#c8ff00]/5 to-transparent' : ''}`}>
                    <div className="w-8 flex justify-center">
                      {getMedalIcon(index)}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center text-lg font-bold text-[#c8ff00]">
                      {team.tag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">{team.name}</p>
                      <p className="text-sm text-[#666]">
                        Capitaine: {team.captain?.display_name || team.captain?.username}
                      </p>
                    </div>
                    <Badge className="bg-[#1a1a1a] text-[#888] border-[#1a1a1a]">{team.region?.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tournament Winners */}
        <TabsContent value="tournaments">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-transparent">
              <h2 className="font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Vainqueurs de tournois
              </h2>
            </div>
            
            <div className="p-12 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun tournoi terminé pour le moment</p>
              <p className="text-sm mt-1">Les vainqueurs apparaîtront ici</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

