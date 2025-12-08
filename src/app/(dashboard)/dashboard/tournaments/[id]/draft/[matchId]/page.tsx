import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DraftPick } from '@/components/tournament/draft-pick'

interface PageProps {
  params: Promise<{ id: string; matchId: string }>
}

export default async function TournamentDraftPage({ params }: PageProps) {
  const { id: tournamentId, matchId } = await params
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch match details
  const { data: match } = await supabase
    .from('matches')
    .select(`
      *,
      blue_team:team1_id(id, name, tag),
      red_team:team2_id(id, name, tag)
    `)
    .eq('id', matchId)
    .eq('tournament_id', tournamentId)
    .single()

  if (!match) {
    redirect(`/dashboard/tournaments/${tournamentId}`)
  }

  return (
    <DraftPick
      tournamentId={tournamentId}
      matchId={matchId}
      blueTeam={match.blue_team || { id: '', name: 'Blue Team', tag: 'BLUE' }}
      redTeam={match.red_team || { id: '', name: 'Red Team', tag: 'RED' }}
      onComplete={(draft) => {
        console.log('Draft complete:', draft)
        // TODO: Save draft to database
      }}
    />
  )
}

