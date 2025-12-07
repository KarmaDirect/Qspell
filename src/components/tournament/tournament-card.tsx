import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Users, MapPin, Trophy } from 'lucide-react'
import { TournamentWithRelations } from '@/lib/types/database.types'

export function TournamentCard({ tournament }: { tournament: TournamentWithRelations }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    upcoming: 'bg-blue-500',
    registration_open: 'bg-yellow-500 text-black',
    in_progress: 'bg-green-500',
    completed: 'bg-purple-500',
    cancelled: 'bg-red-500',
  }

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    upcoming: 'À venir',
    registration_open: '📝 Inscriptions ouvertes',
    in_progress: '🎮 En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Date non définie'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const registeredTeams = tournament.registrations?.[0]?.count || 0
  
  // Check if registration is open
  const isRegistrationOpen = tournament.status === 'registration_open'
  const isInProgress = tournament.status === 'in_progress'

  return (
    <Card className="overflow-hidden hover:border-primary transition-colors">
      {/* Banner */}
      <div 
        className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative"
        style={tournament.banner_url ? { 
          backgroundImage: `url(${tournament.banner_url})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <Badge className={`${statusColors[tournament.status]} font-semibold`}>
            {statusLabels[tournament.status]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Dates importantes */}
        {isRegistrationOpen && tournament.registration_end && (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                Inscriptions jusqu&apos;au {formatDate(tournament.registration_end)}
              </span>
            </div>
          </div>
        )}

        {isInProgress && tournament.tournament_start && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-2">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Compétition démarrée le {formatDate(tournament.tournament_start)}
              </span>
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-lg line-clamp-2">
          {tournament.name}
        </h3>

        {/* Description */}
        {tournament.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tournament.description}
          </p>
        )}

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tournament.tournament_start)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {registeredTeams}{tournament.max_teams ? ` / ${tournament.max_teams}` : ''} équipes
            </span>
          </div>

          {tournament.region && tournament.region.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{tournament.region.join(', ')}</span>
            </div>
          )}

          {tournament.prize_pool && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{tournament.prize_pool}</span>
            </div>
          )}
        </div>

        {/* Format & Mode */}
        <div className="flex gap-2">
          <Badge variant="outline">{tournament.format}</Badge>
          <Badge variant="outline">{tournament.game_mode}</Badge>
        </div>

        {/* Organizer */}
        <div className="text-xs text-muted-foreground">
          Organisé par <span className="font-medium">
            {tournament.organizer?.display_name || tournament.organizer?.username || 'Inconnu'}
          </span>
        </div>

        {/* Action */}
        <Link href={`/dashboard/tournaments/${tournament.id}`}>
          <Button className="w-full" size="sm">
            Voir les détails
          </Button>
        </Link>
      </div>
    </Card>
  )
}

