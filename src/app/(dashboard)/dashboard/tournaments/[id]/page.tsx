import { createServerClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TournamentDetail } from '@/components/tournament/tournament-detail'

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch tournament with organizer info
  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      organizer:profiles!tournaments_organizer_id_fkey(id, username, display_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error || !tournament) {
    notFound()
  }

  // Fetch user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, username')
    .eq('id', user.id)
    .single()

  const isOrganizer = tournament.organizer_id === user.id
  const isAdmin = profile?.role === 'admin' || profile?.role === 'ceo'
  const canManage = isOrganizer || isAdmin

  // Fetch registered teams
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select(`
      *,
      team:teams(id, name, logo_url, tag)
    `)
    .eq('tournament_id', id)

  // Fetch matches
  const { data: matches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', id)
    .order('round', { ascending: true })
    .order('match_number', { ascending: true })

  return (
    <TournamentDetail 
      tournament={tournament}
      registrations={registrations || []}
      matches={matches || []}
      canManage={canManage}
      userId={user.id}
    />
  )
}

