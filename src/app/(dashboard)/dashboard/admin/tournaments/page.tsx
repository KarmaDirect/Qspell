import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, Calendar, Users, Edit, Trash2, Eye, Trophy } from 'lucide-react'

export default async function AdminTournamentsPage() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) redirect('/dashboard')

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, organizer:profiles!tournaments_organizer_id_fkey(username)')
    .order('created_at', { ascending: false })
    .returns<Array<{
      id: string
      name: string
      tournament_start: string
      max_teams: number
      status: string
      organizer: { username: string } | null
    }>>()

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon', upcoming: 'À venir', registration_open: 'Inscriptions',
      in_progress: 'En cours', completed: 'Terminé', cancelled: 'Annulé'
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge className="mb-3 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
            <Trophy className="h-3 w-3 mr-1" />
            Gestion
          </Badge>
          <h1 className="text-2xl font-bold text-white mb-1">Tournois</h1>
          <p className="text-[#666]">Gérez les tournois de la plateforme</p>
        </div>
        <Link href="/dashboard/tournaments/create">
          <Button className="bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau tournoi
          </Button>
        </Link>
      </div>

      <Card className="bg-[#141414] border-[#1a1a1a] overflow-hidden">
        {!tournaments || tournaments.length === 0 ? (
          <div className="p-16 text-center">
            <Trophy className="h-12 w-12 mx-auto text-[#333] mb-4" />
            <p className="text-[#666]">Aucun tournoi créé</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a1a1a]">
            {tournaments.map((t) => (
              <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-[#1a1a1a]/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-[#c8ff00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{t.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-[#666] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(t.tournament_start).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      0/{t.max_teams} équipes
                    </span>
                  </div>
                </div>
                <Badge className="bg-[#c8ff00]/10 text-[#c8ff00] border-0 text-[10px]">
                  {getStatusLabel(t.status)}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[#666] hover:text-white hover:bg-[#1a1a1a]">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[#666] hover:text-white hover:bg-[#1a1a1a]">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-[#666] hover:text-red-400 hover:bg-red-400/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

