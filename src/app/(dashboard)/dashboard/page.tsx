import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Trophy, Users, GraduationCap, UserPlus, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { TeamInvitations } from '@/components/teams/team-invitations'
import { Calendar } from '@/components/calendar/calendar'
import type { Database } from '@/lib/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function DashboardPage() {
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {profile ? (profile.display_name || profile.username) : 'Invocateur'} !
        </h1>
        <p className="text-blue-100">
          Prêt à dominer la Faille de l&apos;invocateur ?
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Actions rapides</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            href="/dashboard/tournaments"
            icon={<Trophy className="h-6 w-6" />}
            title="Tournois"
            description="Rejoindre ou créer un tournoi"
          />
          <QuickActionCard
            href="/dashboard/profile"
            icon={<Users className="h-6 w-6" />}
            title="Mon profil"
            description="Gérer votre profil et stats"
          />
          <QuickActionCard
            href="/dashboard/find-teammates"
            icon={<UserPlus className="h-6 w-6" />}
            title="Trouver des coéquipiers"
            description="Chercher des joueurs"
          />
          <QuickActionCard
            href="/dashboard/leaderboard"
            icon={<TrendingUp className="h-6 w-6" />}
            title="Classements"
            description="Voir les leaderboards"
          />
          <QuickActionCard
            href="/dashboard/coaching"
            icon={<GraduationCap className="h-6 w-6" />}
            title="Coaching"
            description="Progresser avec un coach"
          />
        </div>
      </div>

      {/* Team Invitations */}
      <TeamInvitations />

      {/* Calendar Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Calendrier des événements</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Calendar />
          </div>
          <div>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Activité récente</h3>
              <p className="text-muted-foreground text-sm">
                Aucune activité récente. Commencez par rejoindre un tournoi ou créer une équipe !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ 
  href, 
  icon, 
  title, 
  description 
}: { 
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link href={href}>
      <div className="bg-card border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div className="text-primary">{icon}</div>
          <div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

