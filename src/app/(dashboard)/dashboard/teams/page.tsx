import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamList } from '@/components/teams/team-list'
import { CreateTeamButton } from '@/components/teams/create-team-button'
import { Card } from '@/components/ui/card'
import { Users, Shield, Info } from 'lucide-react'

export default async function TeamsPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Count user's teams
  const { count: teamsCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mes Équipes</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos équipes et invitez des joueurs
            </p>
          </div>
        </div>
        <CreateTeamButton />
      </div>

      {/* Info Card */}
      {(!teamsCount || teamsCount === 0) && (
        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-200 mb-1">Créez votre première équipe !</p>
              <p className="text-sm text-blue-200/80">
                Formez votre équipe de rêve sur QSPELL. Invitez vos amis et préparez-vous à dominer la Faille ensemble.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Teams List */}
      <TeamList />
    </div>
  )
}
