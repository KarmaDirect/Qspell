import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type TournamentEvent = Pick<
  Database['public']['Tables']['tournaments']['Row'],
  'id' | 'name' | 'tournament_start' | 'registration_end' | 'description' | 'format' | 'status'
>

/**
 * GET /api/events
 * Returns all events (coaching groups, tournaments, etc.) within date range
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    const events: Array<{
      id: string
      title: string
      date: string
      type: 'coaching_group' | 'tournament' | 'event'
      time?: string
      description?: string
      lane?: string
    }> = []

    // Fetch Group Coaching Sessions
    const { data: coachingSessions } = await supabase
      .from('group_coaching_sessions')
      .select(`
        id,
        title,
        scheduled_at,
        lane,
        description,
        duration_minutes,
        coach:coaches!inner (
          profile:profiles (
            username
          )
        )
      `)
      .gte('scheduled_at', startDate)
      .lte('scheduled_at', endDate)
      .in('status', ['scheduled', 'in_progress'])

    if (coachingSessions) {
      coachingSessions.forEach((session: any) => {
        const date = new Date(session.scheduled_at)
        events.push({
          id: `coaching-${session.id}`,
          title: session.title || `Coaching ${session.lane?.toUpperCase() || ''}`,
          date: session.scheduled_at,
          type: 'coaching_group',
          time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          description: session.description || `Session de coaching ${session.lane || 'générale'} (${session.duration_minutes}min)`,
          lane: session.lane,
        })
      })
    }

    // Fetch Tournaments
    const { data: tournaments } = await supabase
      .from('tournaments')
      .select(`
        id,
        name,
        tournament_start,
        registration_end,
        description,
        format,
        status
      `)
      .gte('tournament_start', startDate)
      .lte('tournament_start', endDate)
      .in('status', ['upcoming', 'registration_open', 'in_progress'])

    if (tournaments) {
      tournaments.forEach((tournament: TournamentEvent) => {
        // Add registration end date
        if (tournament.registration_end && new Date(tournament.registration_end) >= new Date(startDate)) {
          const regEndDate = new Date(tournament.registration_end)
          events.push({
            id: `tournament-reg-${tournament.id}`,
            title: `📝 ${tournament.name} - Fin inscriptions`,
            date: tournament.registration_end,
            type: 'tournament',
            time: regEndDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            description: `Dernière chance de s'inscrire au tournoi ${tournament.name}`,
          })
        }

        // Add tournament start date
        if (tournament.tournament_start) {
          const date = new Date(tournament.tournament_start)
          events.push({
            id: `tournament-${tournament.id}`,
            title: `🎮 ${tournament.name} - Début`,
            date: tournament.tournament_start,
            type: 'tournament',
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            description: tournament.description || `Tournoi ${tournament.format || ''} - Début de la compétition`,
          })
        }
      })
    }

    // Fetch Custom Calendar Events
    const { data: customEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate)

    if (customEvents) {
      customEvents.forEach((event: any) => {
        const date = new Date(event.start_date)
        events.push({
          id: `event-${event.id}`,
          title: event.title,
          date: event.start_date,
          type: event.event_type || 'event',
          time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          description: event.description,
          lane: event.lane,
        })
      })
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({
      events,
    })
  } catch (error: any) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

