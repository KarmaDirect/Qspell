import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  UserPlus, 
  Search, 
  Filter,
  MapPin,
  Gamepad2,
  Users,
  MessageCircle,
  Star
} from 'lucide-react'

export default async function FindTeammatesPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch players looking for team
  const { data: players } = await supabase
    .from('profiles')
    .select(`
      *,
      riot_accounts(game_name, tag_line, solo_rank, region)
    `)
    .eq('looking_for_team', true)
    .limit(20)
    .returns<Array<{
      id: string
      username: string
      display_name: string | null
      bio: string | null
      riot_accounts: Array<{
        game_name: string
        tag_line: string
        solo_rank: string | null
        region: string
      }> | null
    }>>()

  const getRankColor = (rank: string | null) => {
    if (!rank) return 'text-[#666]'
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
      challenger: 'text-[#c8ff00]',
    }
    return colors[tier] || 'text-[#666]'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
          <UserPlus className="h-3 w-3 mr-1" />
          Recrutement
        </Badge>
        <h1 className="text-2xl font-bold text-white mb-1">Trouver des coéquipiers</h1>
        <p className="text-[#666]">
          Trouvez les joueurs parfaits pour votre équipe
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 bg-[#141414] border-[#1a1a1a]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
            <Input 
              placeholder="Rechercher un joueur..." 
              className="pl-10 bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-[#666]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]">
              <MapPin className="h-4 w-4" />
              Région
            </Button>
            <Button variant="outline" className="gap-2 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]">
              <Gamepad2 className="h-4 w-4" />
              Rôle
            </Button>
            <Button variant="outline" className="gap-2 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]">
              <Filter className="h-4 w-4" />
              Rang
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Joueurs disponibles', value: players?.length || 0, icon: Users },
          { label: 'En ligne', value: Math.floor((players?.length || 0) * 0.3), icon: Gamepad2 },
          { label: 'Nouveaux cette semaine', value: 12, icon: UserPlus },
          { label: 'Équipes cherchent', value: 8, icon: Search },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-4 bg-[#141414] border-[#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#c8ff00]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-[#666]">{stat.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Players List */}
      {!players || players.length === 0 ? (
        <Card className="p-12 text-center bg-[#141414] border-[#1a1a1a]">
          <UserPlus className="h-12 w-12 mx-auto text-[#333] mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-white">Aucun joueur disponible</h3>
          <p className="text-[#666] mb-4">
            Soyez le premier à vous rendre disponible !
          </p>
          <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold">
            Activer ma visibilité
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const riotAccount = player.riot_accounts?.[0]
            return (
              <Card key={player.id} className="p-4 bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-lg font-bold text-[#c8ff00] shrink-0">
                    {player.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate text-white">
                        {player.display_name || player.username}
                      </h3>
                      <div className="w-2 h-2 rounded-full bg-[#c8ff00]" />
                    </div>
                    {riotAccount && (
                      <p className="text-sm text-[#666] truncate">
                        {riotAccount.game_name}#{riotAccount.tag_line}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {riotAccount?.solo_rank && (
                        <Badge className={`${getRankColor(riotAccount.solo_rank)} bg-[#1a1a1a] border-0`}>
                          {riotAccount.solo_rank}
                        </Badge>
                      )}
                      {riotAccount?.region && (
                        <Badge className="bg-[#1a1a1a] text-[#888] border-0">
                          {riotAccount.region.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {player.bio && (
                  <p className="text-sm text-[#666] mt-3 line-clamp-2">
                    {player.bio}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a1a1a]">
                  <Button size="sm" variant="outline" className="flex-1 gap-2 border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a]">
                    <MessageCircle className="h-4 w-4" />
                    Contacter
                  </Button>
                  <Button size="sm" className="flex-1 gap-2 bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold">
                    <UserPlus className="h-4 w-4" />
                    Inviter
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

