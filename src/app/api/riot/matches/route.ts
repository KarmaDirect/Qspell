import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getMatchHistory, getMatch, getPlatformRouting, type RiotRegion } from '@/lib/riot-api/client'
import type { Database } from '@/lib/types/database.types'

type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const riotAccountId = searchParams.get('riotAccountId')
    const count = parseInt(searchParams.get('count') || '10', 10)

    if (!riotAccountId) {
      return NextResponse.json({ error: 'Riot account ID required' }, { status: 400 })
    }

    // Fetch riot account
    const { data: riotAccount, error: accountError } = await supabase
      .from('riot_accounts')
      .select('*')
      .eq('id', riotAccountId)
      .eq('profile_id', user.id)
      .single() as { data: RiotAccount | null; error: any }

    if (accountError || !riotAccount) {
      return NextResponse.json({ error: 'Riot account not found' }, { status: 404 })
    }

    if (!riotAccount.puuid || !riotAccount.region) {
      return NextResponse.json({ error: 'Invalid riot account data' }, { status: 400 })
    }

    // Get platform routing
    const platform = getPlatformRouting(riotAccount.region as RiotRegion)
    
    // Get match history (just IDs, lightweight)
    const matchIds = await getMatchHistory(riotAccount.puuid, platform, count * 3)
    
    if (matchIds.length === 0) {
      return NextResponse.json({ matches: [] })
    }

    // 1. Vérifier le cache en base de données d'abord
    const { data: cachedSummaries } = await supabase
      .from('match_summaries')
      .select('*')
      .in('match_id', matchIds)
      .eq('riot_account_puuid', riotAccount.puuid)
      .in('queue_id', [420, 440]) // Seulement ranked
      .order('game_creation', { ascending: false })
      .limit(count)

    const cachedMap = new Map(
      (cachedSummaries || []).map((c: any) => [c.match_id, c])
    )

    const rankedMatches: any[] = []
    const matchesToFetch: string[] = []

    // 2. Séparer les matches en cache vs à fetch
    for (const matchId of matchIds) {
      if (rankedMatches.length >= count) break

      const cached = cachedMap.get(matchId)
      if (cached) {
        // Utiliser le cache
        rankedMatches.push({
          matchId: cached.match_id,
          gameCreation: cached.game_creation,
          gameDuration: cached.game_duration,
          queueId: cached.queue_id,
          gameMode: cached.game_mode,
          participant: cached.participant_data,
        })
      } else {
        // À fetch depuis Riot API
        matchesToFetch.push(matchId)
      }
    }

    // 3. Fetch seulement les matches manquants depuis Riot API
    const newSummaries: any[] = []
    for (const matchId of matchesToFetch) {
      if (rankedMatches.length >= count) break

      try {
        const match = await getMatch(matchId, platform)
        
        // Only include ranked queues (420 = Solo/Duo, 440 = Flex)
        if (match.info.queueId !== 420 && match.info.queueId !== 440) {
          continue
        }
        
        const participant = match.info.participants.find(p => p.puuid === riotAccount.puuid)
        if (!participant) continue

        const summary = {
          matchId: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          queueId: match.info.queueId,
          gameMode: match.info.gameMode,
          participant: {
            championName: participant.championName,
            championId: participant.championId,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            win: participant.win,
            teamPosition: participant.teamPosition,
          }
        }

        rankedMatches.push(summary)

        // Stocker dans le cache pour les prochaines fois
        newSummaries.push({
          match_id: match.metadata.matchId,
          platform: platform,
          riot_account_puuid: riotAccount.puuid,
          game_creation: match.info.gameCreation,
          game_duration: match.info.gameDuration,
          queue_id: match.info.queueId,
          game_mode: match.info.gameMode,
          participant_data: summary.participant,
        })
      } catch (error) {
        console.error('Error fetching match:', matchId, error)
        continue
      }
    }

    // 4. Insérer les nouveaux résumés dans le cache (en arrière-plan, ne bloque pas la réponse)
    if (newSummaries.length > 0) {
      supabase
        .from('match_summaries')
        .upsert(newSummaries, { onConflict: 'match_id' })
        .then(() => {
          console.log(`✅ Cached ${newSummaries.length} new match summaries`)
        })
        .catch((error) => {
          console.error('Error caching match summaries:', error)
        })
    }

    // Trier par date (plus récent en premier)
    rankedMatches.sort((a, b) => b.gameCreation - a.gameCreation)

    return NextResponse.json({ matches: rankedMatches.slice(0, count) })
  } catch (error: any) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

