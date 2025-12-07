import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TournamentCard } from '@/components/tournament/tournament-card'
import { Plus, Filter } from 'lucide-react'
import { TournamentWithRelations } from '@/lib/types/database.types'

export default async function TournamentsPage() {
  const supabase = await createServerClient()

  // Get current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>()
    
    isAdmin = (profile?.role === 'admin' || profile?.role === 'ceo') ?? false
  }

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(`
      *,
      organizer:profiles!tournaments_organizer_id_fkey(username, display_name),
      registrations:tournament_registrations(count)
    `)
    .in('status', ['upcoming', 'registration_open', 'in_progress'])
    .order('tournament_start', { ascending: true }) as { data: TournamentWithRelations[] | null }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournois</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Gérez tous les tournois de la plateforme' : 'Rejoignez les tournois QSPELL'}
          </p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/tournaments/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un tournoi
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      {/* Tournaments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments && tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-card border rounded-lg p-12 text-center">
              <h3 className="text-xl font-semibold mb-2">Aucun tournoi disponible</h3>
              <p className="text-muted-foreground mb-6">
                {isAdmin ? 'Créez le premier tournoi de la plateforme !' : 'Aucun tournoi disponible pour le moment.'}
              </p>
              {isAdmin && (
                <Link href="/dashboard/tournaments/create">
                  <Button>Créer un tournoi</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

