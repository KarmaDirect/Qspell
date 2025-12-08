import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  Plus,
  Filter,
  ArrowRight,
  Swords,
  Clock
} from 'lucide-react'

export default async function TournamentsPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  const canCreateTournament = profile && ['tournament_organizer', 'admin', 'ceo'].includes(profile.role)

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('tournament_start', { ascending: true })
    .returns<Array<{
      id: string
      name: string
      banner_url: string | null
      tournament_start: string
      max_teams: number
      format: string
      prize_pool: number | null
      status: string
    }>>()

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      draft: { label: 'Brouillon', color: 'bg-[#333] text-[#888]' },
      upcoming: { label: 'À venir', color: 'bg-blue-500/20 text-blue-400' },
      registration_open: { label: 'Inscriptions', color: 'bg-[#c8ff00]/20 text-[#c8ff00]' },
      registration_closed: { label: 'Fermé', color: 'bg-yellow-500/20 text-yellow-400' },
      in_progress: { label: 'En cours', color: 'bg-purple-500/20 text-purple-400' },
      completed: { label: 'Terminé', color: 'bg-[#333] text-[#888]' },
      cancelled: { label: 'Annulé', color: 'bg-red-500/20 text-red-400' },
    }
    return configs[status] || { label: status, color: 'bg-[#333] text-[#888]' }
  }

  const getFormatLabel = (format: string) => {
    const formats: Record<string, string> = {
      single_elimination: 'Single Elim',
      double_elimination: 'Double Elim',
      round_robin: 'Round Robin',
      swiss: 'Swiss',
      groups_then_knockout: 'Poules',
      '5v5': '5v5',
    }
    return formats[format] || format
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
            <Trophy className="h-3 w-3 mr-1" />
            Compétition
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">Tournois</h1>
          <p className="text-[#666]">Participez aux tournois et montrez votre talent</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#1a1a1a] gap-2">
            <Filter className="h-4 w-4" />
            Filtrer
          </Button>
          {canCreateTournament && (
            <Link href="/dashboard/tournaments/create">
              <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold gap-2">
                <Plus className="h-4 w-4" />
                Créer un tournoi
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tournois actifs', value: tournaments?.filter(t => t.status === 'in_progress').length || 0, color: 'text-purple-400' },
          { label: 'Inscriptions ouvertes', value: tournaments?.filter(t => t.status === 'registration_open').length || 0, color: 'text-[#c8ff00]' },
          { label: 'À venir', value: tournaments?.filter(t => t.status === 'upcoming').length || 0, color: 'text-blue-400' },
          { label: 'Total', value: tournaments?.length || 0, color: 'text-white' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 bg-[#141414] border-[#1a1a1a] text-center">
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-[#666]">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Tournaments List */}
      {!tournaments || tournaments.length === 0 ? (
        <Card className="p-16 bg-[#141414] border-[#1a1a1a] text-center">
          <Trophy className="h-12 w-12 mx-auto text-[#333] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Aucun tournoi disponible</h3>
          <p className="text-[#666] mb-4">
            Les prochains tournois apparaîtront ici
          </p>
          {canCreateTournament && (
            <Link href="/dashboard/tournaments/create">
              <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold">
                Créer le premier tournoi
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.map((tournament) => {
            const statusConfig = getStatusConfig(tournament.status)
            
            return (
              <Link key={tournament.id} href={`/dashboard/tournaments/${tournament.id}`}>
                <Card className="overflow-hidden bg-[#141414] border-[#1a1a1a] hover:border-[#c8ff00]/30 transition-all group cursor-pointer">
                  {/* Banner */}
                  <div className="h-28 bg-gradient-to-br from-[#c8ff00]/10 to-transparent relative">
                    {tournament.banner_url && (
                      <img 
                        src={tournament.banner_url} 
                        alt={tournament.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge className={statusConfig.color + ' border-0 text-[10px]'}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-[#c8ff00]" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-2 group-hover:text-[#c8ff00] transition-colors truncate">
                      {tournament.name}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-[#666] mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(tournament.tournament_start).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>0/{tournament.max_teams} équipes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Swords className="h-4 w-4" />
                        <span>{getFormatLabel(tournament.format)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                      {tournament.prize_pool ? (
                        <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0">
                          {tournament.prize_pool}€
                        </Badge>
                      ) : (
                        <Badge className="bg-[#1a1a1a] text-[#666] border-0">
                          Gloire
                        </Badge>
                      )}
                      <span className="text-sm text-[#c8ff00] group-hover:underline flex items-center gap-1">
                        Détails <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

