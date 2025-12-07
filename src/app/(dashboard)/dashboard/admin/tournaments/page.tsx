import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AdminTournamentsList } from '@/components/admin/tournaments-list'

export default async function AdminTournamentsPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin or CEO
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'ceo'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestion des tournois</h1>
          <p className="text-muted-foreground">
            Créer et gérer tous les tournois de la plateforme
          </p>
        </div>
        <Link href="/dashboard/tournaments/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Créer un tournoi
          </Button>
        </Link>
      </div>

      <AdminTournamentsList />
    </div>
  )
}

