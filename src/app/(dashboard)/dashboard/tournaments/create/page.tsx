import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TournamentForm } from '@/components/tournament/tournament-form'
import { Badge } from '@/components/ui/badge'
import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CreateTournamentPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user can create tournaments
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['tournament_organizer', 'admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard/tournaments')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tournaments">
          <Button variant="ghost" size="icon" className="text-[#666] hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <Badge className="mb-2 bg-[#c8ff00]/10 text-[#c8ff00] border-[#c8ff00]/20">
            <Trophy className="h-3 w-3 mr-1" />
            Nouveau tournoi
          </Badge>
          <h1 className="text-2xl font-bold text-white">Créer un tournoi</h1>
          <p className="text-[#666]">Configurez votre tournoi étape par étape</p>
        </div>
      </div>

      <TournamentForm userId={user.id} />
    </div>
  )
}

