import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Users, Euro } from 'lucide-react'

async function getTournamentStats() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'}/api/admin/economy/tournaments`, {
    cache: 'no-store'
  })
  if (!response.ok) return null
  return response.json()
}

export default async function TournamentsFinancePage() {
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
    .single()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const data = await getTournamentStats()
  const tournaments = data?.tournaments || []
  const stats = data?.stats || {}
  const prizePools = data?.prizePools || []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gestion Financière des Tournois</h1>
        <p className="text-muted-foreground">Prize pools et revenus des tournois</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-[#c8ff00]" />
            <div className="text-sm text-muted-foreground">Total entrées</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalEntries || 0}</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="h-5 w-5 text-[#c8ff00]" />
            <div className="text-sm text-muted-foreground">Revenus entrées</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalEntryFees?.toFixed(2) || '0.00'}€</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-[#c8ff00]" />
            <div className="text-sm text-muted-foreground">Prize pools</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalPrizePools?.toFixed(2) || '0.00'}€</div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-[#c8ff00]" />
            <div className="text-sm text-muted-foreground">Marge plateforme</div>
          </div>
          <div className="text-2xl font-bold">{stats.totalRevenue?.toFixed(2) || '0.00'}€</div>
        </Card>
      </div>

      {/* Liste des tournois */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Revenus par tournoi</h2>
        <div className="space-y-4">
          {tournaments.length > 0 ? (
            tournaments.map((t: any) => (
              <Card key={t.tournamentId} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{t.tournamentName}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Entrées</div>
                        <div className="font-semibold">{t.entries}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Frais entrées</div>
                        <div className="font-semibold">~{(t.totalEntryFees / 100).toFixed(2)}€</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Prize pool</div>
                        <div className="font-semibold text-[#c8ff00]">{t.prizePool.toFixed(2)}€</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Marge</div>
                        <div className="font-semibold text-[#c8ff00]">{t.revenue.toFixed(2)}€</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucun tournoi avec données financières</p>
          )}
        </div>
      </Card>

      {/* Prize pools actifs */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Prize Pools Actifs</h2>
        <div className="space-y-4">
          {prizePools.filter((p: any) => !p.paid_out).length > 0 ? (
            prizePools.filter((p: any) => !p.paid_out).map((pool: any) => (
              <Card key={pool.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold mb-2">
                      {pool.tournament?.name || 'Tournoi inconnu'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Prize pool</div>
                        <div className="font-semibold text-2xl">{pool.total_pool}€</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Statut</div>
                        <Badge variant={pool.paid_out ? 'default' : 'outline'}>
                          {pool.paid_out ? 'Payé' : 'En attente'}
                        </Badge>
                      </div>
                      {pool.tournament?.tournament_end && (
                        <div>
                          <div className="text-sm text-muted-foreground">Fin du tournoi</div>
                          <div className="text-sm">
                            {new Date(pool.tournament.tournament_end).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucun prize pool actif</p>
          )}
        </div>
      </Card>
    </div>
  )
}
