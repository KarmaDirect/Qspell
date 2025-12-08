import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getMatch, getPlatformRouting, type RiotRegion } from '@/lib/riot-api/client'
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
    const matchId = searchParams.get('matchId')
    const riotAccountId = searchParams.get('riotAccountId')

    if (!matchId || !riotAccountId) {
      return NextResponse.json({ error: 'Match ID and Riot account ID required' }, { status: 400 })
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
    
    // Fetch match details
    const match = await getMatch(matchId, platform)
    
    // Find current player's participant data
    const currentPlayer = match.info.participants.find(p => p.puuid === riotAccount.puuid)
    if (!currentPlayer) {
      return NextResponse.json({ error: 'Player not found in match' }, { status: 404 })
    }

    // Separate teams
    const team100 = match.info.participants.filter(p => p.teamId === 100)
    const team200 = match.info.participants.filter(p => p.teamId === 200)
    
    // Calculate team objectives
    const team100Objectives = {
      kills: team100.reduce((sum, p) => sum + p.kills, 0),
      assists: team100.reduce((sum, p) => sum + p.assists, 0),
      towers: match.info.teams.find(t => t.teamId === 100)?.objectives?.tower?.kills || 0,
      dragons: match.info.teams.find(t => t.teamId === 100)?.objectives?.dragon?.kills || 0,
      barons: match.info.teams.find(t => t.teamId === 100)?.objectives?.baron?.kills || 0,
      inhibitors: match.info.teams.find(t => t.teamId === 100)?.objectives?.inhibitor?.kills || 0,
    }
    
    const team200Objectives = {
      kills: team200.reduce((sum, p) => sum + p.kills, 0),
      assists: team200.reduce((sum, p) => sum + p.assists, 0),
      towers: match.info.teams.find(t => t.teamId === 200)?.objectives?.tower?.kills || 0,
      dragons: match.info.teams.find(t => t.teamId === 200)?.objectives?.dragon?.kills || 0,
      barons: match.info.teams.find(t => t.teamId === 200)?.objectives?.baron?.kills || 0,
      inhibitors: match.info.teams.find(t => t.teamId === 200)?.objectives?.inhibitor?.kills || 0,
    }

    // Fetch Riot IDs for all participants (to get summoner names)
    const participantNames: Record<string, string> = {}
    
    try {
      // Try to get names from match data first (riotIdGameName or summonerName)
      for (const p of match.info.participants) {
        const participant = p as any
        if (participant.riotIdGameName) {
          participantNames[p.puuid] = participant.riotIdGameName
        } else if (p.summonerName) {
          participantNames[p.puuid] = p.summonerName
        }
      }
      
      console.log(`Found ${Object.keys(participantNames).length} names in match data`)
    } catch (error) {
      console.error('Error fetching participant names:', error)
    }

    // Calculate performance scores and rankings
    const allParticipants = match.info.participants.map(p => {
      const kda = p.deaths > 0 ? (p.kills + p.assists) / p.deaths : p.kills + p.assists
      const gameDurationMinutes = match.info.gameDuration / 60
      const csPerMin = gameDurationMinutes > 0 
        ? (p.totalMinionsKilled + p.neutralMinionsKilled) / gameDurationMinutes 
        : 0
      const goldPerMin = gameDurationMinutes > 0 ? p.goldEarned / gameDurationMinutes : 0
      const damagePerMin = gameDurationMinutes > 0 
        ? p.totalDamageDealtToChampions / gameDurationMinutes 
        : 0
      
      // Get summoner name (prefer riotIdGameName, fallback to summonerName)
      const summonerName = (p as any).riotIdGameName || p.summonerName || participantNames[p.puuid] || 'Joueur inconnu'
      
      // Simple performance score calculation
      const performanceScore = Math.round(
        (kda * 20) + 
        (csPerMin * 2) + 
        (goldPerMin / 10) + 
        (damagePerMin / 100) +
        (p.visionScore * 0.5)
      )
      
      // Calculate detailed scores on 100 scale with proper normalization
      // CS Score: Based on role expectations
      // Top/Mid/ADC: 7-10 CS/min = excellent (100), 5-7 = good (70), 3-5 = average (50), <3 = poor
      // Jungle: 5-7 CS/min = excellent (100), 3-5 = good (70), 1-3 = average (50)
      // Support: CS not important, always 50 (neutral)
      const isSupport = p.teamPosition === 'UTILITY'
      const isJungle = p.teamPosition === 'JUNGLE'
      let csScore = 50
      if (!isSupport) {
        if (isJungle) {
          // Jungle: 6 CS/min = 100, 4 = 70, 2 = 50, 0 = 0
          csScore = Math.min(100, Math.max(0, Math.round((csPerMin / 6) * 100)))
        } else {
          // Top/Mid/ADC: 8.5 CS/min = 100, 6 = 70, 4 = 50, 2 = 30, 0 = 0
          csScore = Math.min(100, Math.max(0, Math.round(((csPerMin - 2) / 6.5) * 100 + 30)))
        }
      }
      
      // Vision Score: 0-2.5 vision/min maps to 0-100
      // Support: 2.5 vision/min = 100, 1.5 = 70, 0.5 = 50
      // Others: 1.5 vision/min = 100, 1 = 70, 0.5 = 50
      const visionPerMin = gameDurationMinutes > 0 ? p.visionScore / gameDurationMinutes : 0
      const visionScoreValue = isSupport
        ? Math.min(100, Math.max(0, Math.round((visionPerMin / 2.5) * 100)))
        : Math.min(100, Math.max(0, Math.round((visionPerMin / 1.5) * 100)))
      
      // Impact Score: KDA + Damage (KP will be added after team kills calculation)
      // KDA component: 0-5 KDA maps to 0-50
      const kdaComponent = Math.min(50, Math.max(0, kda * 10))
      // Damage component: 0-800 damage/min maps to 0-30
      const damageComponent = Math.min(30, Math.max(0, (damagePerMin / 800) * 30))
      // Base impact score (KP will be added later)
      const baseImpactScore = Math.min(100, Math.max(0, Math.round(kdaComponent + damageComponent)))
      
      // Gold Score: Based on role
      // ADC: 450 gold/min = 100, 350 = 70, 250 = 50
      // Others: 400 gold/min = 100, 300 = 70, 200 = 50
      const isADC = p.teamPosition === 'BOTTOM'
      const goldTarget = isADC ? 450 : 400
      const goldScore = Math.min(100, Math.max(0, Math.round((goldPerMin / goldTarget) * 100)))
      
      // Calculate KP for impact score (needs team kills, will be added later)
      // For now, use base impact score
      
      return {
        ...p,
        summonerName, // Use the resolved name
        championLevel: p.championLevel || 1, // Ensure championLevel is present
        performanceScore,
        kda,
        csPerMin,
        goldPerMin,
        csScore,
        visionScoreValue, // Score calculé (0-100)
        impactScore: baseImpactScore,
        goldScore,
        overallScore: 0, // Will be calculated after KP is known
      }
    })

    // Sort by performance score and assign ranks
    allParticipants.sort((a, b) => b.performanceScore - a.performanceScore)
    const rankedParticipants = allParticipants.map((p, index) => {
      let rank = `${index + 1}th`
      if (index === 0) rank = 'MVP'
      else if (index === 1) rank = 'ACE'
      else if (index === 2) rank = '2nd'
      else if (index === 3) rank = '3rd'
      
      return { ...p, rank }
    })

    // Calculate KP for each player
    const teamKills100 = team100Objectives.kills
    const teamKills200 = team200Objectives.kills
    
    // Fetch player ranks from Supabase for all participants
    const participantPuuidToRank: Record<string, { tier: string | null, rank: string | null }> = {}
    
    try {
      const allPuuid = match.info.participants.map(p => p.puuid)
      const { data: allRiotAccounts } = await supabase
        .from('riot_accounts')
        .select('puuid, id')
        .in('puuid', allPuuid)
      
      if (allRiotAccounts && Array.isArray(allRiotAccounts) && allRiotAccounts.length > 0) {
        const accounts = allRiotAccounts as Array<{ puuid: string, id: string }>
        const riotAccountIds = accounts.map(acc => acc.id)
        
        // Determine queue type based on match queueId
        const queueType = match.info.queueId === 420 ? 'RANKED_SOLO_5x5' : match.info.queueId === 440 ? 'RANKED_FLEX_SR' : null
        
        if (queueType && riotAccountIds.length > 0) {
          const { data: allStats } = await supabase
            .from('player_stats')
            .select('riot_account_id, tier, rank')
            .in('riot_account_id', riotAccountIds)
            .eq('queue_type', queueType)
          
          if (allStats && Array.isArray(allStats)) {
            const stats = allStats as Array<{ riot_account_id: string, tier: string | null, rank: string | null }>
            for (const stat of stats) {
              const riotAccount = accounts.find(acc => acc.id === stat.riot_account_id)
              if (riotAccount && stat.tier && stat.rank) {
                participantPuuidToRank[riotAccount.puuid] = {
                  tier: stat.tier,
                  rank: stat.rank
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching player ranks:', error)
    }
    
    const participantsWithKP = rankedParticipants.map(p => {
      const teamKills = p.teamId === 100 ? teamKills100 : teamKills200
      const kp = teamKills > 0 ? Math.round(((p.kills + p.assists) / teamKills) * 100) : 0
      const playerRank = participantPuuidToRank[p.puuid] || { tier: null, rank: null }
      
      // Recalculate impact score with KP component
      const kdaComponent = Math.min(50, Math.max(0, p.kda * 10))
      const damagePerMin = (match.info.gameDuration / 60) > 0 
        ? p.totalDamageDealtToChampions / (match.info.gameDuration / 60) 
        : 0
      const damageComponent = Math.min(30, Math.max(0, (damagePerMin / 800) * 30))
      const kpComponent = Math.min(20, Math.max(0, (kp / 100) * 20))
      const finalImpactScore = Math.min(100, Math.max(0, Math.round(kdaComponent + damageComponent + kpComponent)))
      
      // Recalculate overall score with updated impact score
      const isSupport = p.teamPosition === 'UTILITY'
      const finalOverallScore = isSupport
        ? Math.round(
            (p.visionScore * 0.30) + 
            (finalImpactScore * 0.40) + 
            (p.goldScore * 0.20) + 
            (p.csScore * 0.10)
          )
        : Math.round(
            (p.csScore * 0.25) + 
            (finalImpactScore * 0.40) + 
            (p.goldScore * 0.25) + 
            (p.visionScore * 0.10)
          )
      
      return { 
        ...p, 
        kp,
        impactScore: finalImpactScore,
        overallScore: finalOverallScore,
        playerTier: playerRank.tier,
        playerRank: playerRank.rank,
      }
    })

    return NextResponse.json({
      match: {
        matchId: match.metadata.matchId,
        gameCreation: match.info.gameCreation,
        gameDuration: match.info.gameDuration,
        queueId: match.info.queueId,
        gameMode: match.info.gameMode,
        currentPlayer: {
          ...currentPlayer,
          rank: participantsWithKP.find(p => p.puuid === currentPlayer.puuid)?.rank || 'N/A',
          performanceScore: participantsWithKP.find(p => p.puuid === currentPlayer.puuid)?.performanceScore || 0,
          kp: participantsWithKP.find(p => p.puuid === currentPlayer.puuid)?.kp || 0,
        },
        team100: {
          participants: participantsWithKP.filter(p => p.teamId === 100).map(p => {
            const participant = p as any
            return {
              ...participant,
              championLevel: participant.championLevel || 1,
              summonerName: participant.summonerName,
              playerTier: participant.playerTier,
              playerRank: participant.playerRank,
              perks: participant.perks,
              visionScoreValue: participant.visionScoreValue,
              kda: participant.kda,
              csPerMin: participant.csPerMin,
              goldPerMin: participant.goldPerMin,
            }
          }),
          objectives: team100Objectives,
          win: match.info.teams.find(t => t.teamId === 100)?.win || false,
        },
        team200: {
          participants: participantsWithKP.filter(p => p.teamId === 200).map(p => {
            const participant = p as any
            return {
              ...participant,
              championLevel: participant.championLevel || 1,
              summonerName: participant.summonerName,
              playerTier: participant.playerTier,
              playerRank: participant.playerRank,
              perks: participant.perks,
              visionScoreValue: participant.visionScoreValue,
              kda: participant.kda,
              csPerMin: participant.csPerMin,
              goldPerMin: participant.goldPerMin,
            }
          }),
          objectives: team200Objectives,
          win: match.info.teams.find(t => t.teamId === 200)?.win || false,
        },
      }
    })
  } catch (error: any) {
    console.error('Error fetching match details:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch match details' },
      { status: 500 }
    )
  }
}

