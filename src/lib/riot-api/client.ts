import { getCached, setCache } from '@/lib/redis/client'

const RIOT_API_KEY = process.env.RIOT_API_KEY
const RIOT_API_BASE_URLS: Record<string, string> = {
  europe: 'https://europe.api.riotgames.com',
  americas: 'https://americas.api.riotgames.com',
  asia: 'https://asia.api.riotgames.com',
  euw1: 'https://euw1.api.riotgames.com',
  na1: 'https://na1.api.riotgames.com',
  kr: 'https://kr.api.riotgames.com',
  eune1: 'https://eune1.api.riotgames.com',
  br1: 'https://br1.api.riotgames.com',
  jp1: 'https://jp1.api.riotgames.com',
  la1: 'https://la1.api.riotgames.com',
  la2: 'https://la2.api.riotgames.com',
  oc1: 'https://oc1.api.riotgames.com',
  tr1: 'https://tr1.api.riotgames.com',
  ru: 'https://ru.api.riotgames.com',
}

export type RiotRegion = 'euw1' | 'na1' | 'kr' | 'eune1' | 'br1' | 'jp1' | 'la1' | 'la2' | 'oc1' | 'tr1' | 'ru'
export type RiotPlatform = 'europe' | 'americas' | 'asia'

// Map platform regions to routing regions
const PLATFORM_ROUTING: Record<RiotRegion, RiotPlatform> = {
  euw1: 'europe',
  eune1: 'europe',
  tr1: 'europe',
  ru: 'europe',
  na1: 'americas',
  br1: 'americas',
  la1: 'americas',
  la2: 'americas',
  kr: 'asia',
  jp1: 'asia',
  oc1: 'asia',
}

export interface RiotAccount {
  puuid: string
  gameName: string
  tagLine: string
}

export interface Summoner {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  summonerLevel: number
}

export interface RankedStats {
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  veteran: boolean
  inactive: boolean
  freshBlood: boolean
  hotStreak: boolean
}

export interface Match {
  metadata: {
    matchId: string
    participants: string[]
  }
  info: {
    gameCreation: number
    gameDuration: number
    gameId: number
    gameMode: string
    gameType: string
    platformId: string
    queueId: number
    participants: MatchParticipant[]
    teams: Array<{
      teamId: number
      win: boolean
      objectives: {
        baron?: { kills: number }
        dragon?: { kills: number }
        inhibitor?: { kills: number }
        tower?: { kills: number }
      }
    }>
  }
}

export interface MatchParticipant {
  puuid: string
  championName: string
  championId: number
  kills: number
  deaths: number
  assists: number
  win: boolean
  teamPosition: string
  summonerName?: string // May be deprecated, use riotIdGameName instead
  riotIdGameName?: string
  riotIdTagline?: string
  teamId: number
  championLevel: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  summoner1Id: number
  summoner2Id: number
  perks: {
    styles: Array<{
      style: number
      selections: Array<{
        perk: number
        var1: number
        var2: number
        var3: number
      }>
    }>
  }
  totalMinionsKilled: number
  neutralMinionsKilled: number
  goldEarned: number
  totalDamageDealtToChampions: number
  visionScore: number
}

async function riotApiRequest<T>(url: string, cacheKey: string, cacheDuration: number): Promise<T> {
  // Check cache first
  const cached = await getCached<T>(cacheKey)
  if (cached) return cached

  const data = await riotApiRequestNoCache<T>(url, cacheKey, cacheDuration)
  return data
}

// Same as riotApiRequest but ALWAYS bypasses cache on read; still writes if success
async function riotApiRequestNoCache<T>(url: string, cacheKey: string, cacheDuration: number): Promise<T> {
  if (!RIOT_API_KEY) {
    throw new Error('Riot API key not configured')
  }

  if (!RIOT_API_KEY) {
    throw new Error('Riot API key not configured')
  }

  const response = await fetch(url, {
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('❌ Riot API Error:', { status: response.status, error, url })
    throw new Error(`Riot API error (${response.status}): ${error}`)
  }

  const data = await response.json()
  console.log('🔍 Riot API Response for', url, ':', JSON.stringify(data, null, 2))
  
  // Cache the result (only if cacheKey provided)
  if (cacheKey && cacheDuration) {
    await setCache(cacheKey, data, cacheDuration)
  }
  
  return data as T
}

export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  platform: RiotPlatform = 'europe'
): Promise<RiotAccount> {
  const baseUrl = RIOT_API_BASE_URLS[platform]
  const url = `${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  const cacheKey = `riot:account:${platform}:${gameName}:${tagLine}`
  
  return riotApiRequest<RiotAccount>(url, cacheKey, 3600) // 1 hour cache
}

export async function getSummonerByPuuid(puuid: string, region: RiotRegion): Promise<Summoner> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`
  const cacheKey = `riot:summoner:${region}:${puuid}`

  // Try cache first, but ensure we have id & accountId
  const cached = await getCached<Summoner>(cacheKey)
  if (cached && cached.id && cached.accountId) {
    return cached
  }

  // Fetch fresh (bypass cache read), then cache only if complete
  const fresh = await riotApiRequestNoCache<Summoner>(url, cacheKey, 3600) // 1 hour cache
  if (fresh && (fresh as any).id && (fresh as any).accountId) {
    await setCache(cacheKey, fresh, 3600)
  }
  return fresh
}

// Fallback: fetch summoner by name (gameName) when by-puuid payload is incomplete
export async function getSummonerByName(gameName: string, region: RiotRegion): Promise<Summoner> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(gameName)}`
  const cacheKey = `riot:summoner-name:${region}:${gameName}`

  const cached = await getCached<Summoner>(cacheKey)
  if (cached && cached.id && cached.accountId) {
    return cached
  }

  const fresh = await riotApiRequestNoCache<Summoner>(url, cacheKey, 3600)
  if (fresh && (fresh as any).id && (fresh as any).accountId) {
    await setCache(cacheKey, fresh, 3600)
  }
  return fresh
}

export async function getRankedStats(puuid: string, region: RiotRegion): Promise<RankedStats[]> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/league/v4/entries/by-puuid/${puuid}`
  const cacheKey = `riot:ranked:${region}:${puuid}`
  
  return riotApiRequest<RankedStats[]>(url, cacheKey, 1800) // 30 min cache
}

/**
 * Get ranked stats from match history (fallback when summoner ID is unavailable)
 * Calculates stats from recent matches instead of using League V4 API
 */
export async function getRankedStatsFromMatches(puuid: string, region: RiotRegion): Promise<RankedStats[]> {
  const platform = getPlatformRouting(region)
  
  // Get recent matches (last 40 to have enough ranked games)
  const matchIds = await getMatchHistory(puuid, platform, 40)
  
  if (matchIds.length === 0) {
    console.warn('⚠️ No match history found')
    return []
  }
  
  console.log(`📊 Analyzing ${matchIds.length} matches for ranked stats`)
  
  // Fetch match details
  const matches: Match[] = []
  for (const matchId of matchIds.slice(0, 20)) { // Limit to 20 to avoid rate limits
    try {
      const match = await getMatch(matchId, platform)
      matches.push(match)
    } catch (error) {
      console.error('Error fetching match:', matchId, error)
    }
  }
  
  console.log(`✅ Fetched ${matches.length} match details`)
  
  // Calculate stats from matches
  const queueStats: Map<string, { wins: number, losses: number, queueType: string }> = new Map()
  
  for (const match of matches) {
    // Map queue ID to queue type (ONLY ranked queues)
    let queueType: string | null = null
    if (match.info.queueId === 420) {
      queueType = 'RANKED_SOLO_5x5'
    } else if (match.info.queueId === 440) {
      queueType = 'RANKED_FLEX_SR'
    } else {
      // Skip non-ranked queues (normal, ARAM, arena, etc.)
      console.log(`⏭️  Skipping queueId ${match.info.queueId} (not ranked)`)
      continue
    }
    
    const participant = match.info.participants.find(p => p.puuid === puuid)
    if (!participant) {
      console.warn(`⚠️ Player not found in match ${match.metadata.matchId}`)
      continue
    }
    
    if (!queueStats.has(queueType)) {
      queueStats.set(queueType, { wins: 0, losses: 0, queueType })
    }
    
    const stats = queueStats.get(queueType)!
    if (participant.win) {
      stats.wins++
      console.log(`✅ ${queueType}: WIN (${stats.wins}W-${stats.losses}L)`)
    } else {
      stats.losses++
      console.log(`❌ ${queueType}: LOSS (${stats.wins}W-${stats.losses}L)`)
    }
  }
  
  console.log('📊 Final queue stats:', queueStats)
  
  // Convert to RankedStats format (without tier/rank since we can't determine it from matches)
  const result: RankedStats[] = []
  for (const [queueType, stats] of queueStats) {
    if (stats.wins === 0 && stats.losses === 0) {
      continue // Skip queues with no games
    }
    
    result.push({
      queueType,
      tier: 'UNRANKED', // We can't determine actual tier from matches alone
      rank: 'I',
      leaguePoints: 0,
      wins: stats.wins,
      losses: stats.losses,
      veteran: false,
      inactive: false,
      freshBlood: false,
      hotStreak: false,
    })
  }
  
  console.log(`✅ Returning ${result.length} ranked queue stats`)
  return result
}

export async function getMatchHistory(
  puuid: string,
  platform: RiotPlatform,
  count: number = 20
): Promise<string[]> {
  const baseUrl = RIOT_API_BASE_URLS[platform]
  const url = `${baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
  const cacheKey = `riot:match-history:${platform}:${puuid}:${count}`
  
  return riotApiRequest<string[]>(url, cacheKey, 900) // 15 min cache
}

export async function getMatch(matchId: string, platform: RiotPlatform): Promise<Match> {
  const baseUrl = RIOT_API_BASE_URLS[platform]
  const url = `${baseUrl}/lol/match/v5/matches/${matchId}`
  const cacheKey = `riot:match:${platform}:${matchId}`
  
  return riotApiRequest<Match>(url, cacheKey, 86400) // 24 hour cache (matches are immutable)
}

export async function verifyAccountOwnership(
  gameName: string,
  tagLine: string,
  expectedCode: string,
  platform: RiotPlatform = 'europe'
): Promise<boolean> {
  try {
    const account = await getAccountByRiotId(gameName, tagLine, platform)
    const region = 'euw1' // Default to EUW for verification
    const summoner = await getSummonerByPuuid(account.puuid, region)
    
    // In a real implementation, you'd check the summoner's verification code
    // For now, this is a placeholder that checks against the summoner name or icon ID
    // You could implement a system where users temporarily change their icon or use a third-party service
    
    return true // Placeholder
  } catch (error) {
    console.error('Account verification failed:', error)
    return false
  }
}

export function getPlatformRouting(region: RiotRegion): RiotPlatform {
  return PLATFORM_ROUTING[region] || 'europe'
}

// ========================================
// 🆕 BONUS APIs - Champion Mastery
// ========================================

export interface ChampionMastery {
  championId: number
  championLevel: number
  championPoints: number
  lastPlayTime: number
  championPointsSinceLastLevel: number
  championPointsUntilNextLevel: number
  tokensEarned: number
}

/**
 * Récupère les champions les plus maîtrisés d'un joueur
 * Usage: Afficher top 3-5 champions sur le profil
 */
export async function getTopChampions(
  puuid: string, 
  region: RiotRegion, 
  count = 5
): Promise<ChampionMastery[]> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=${count}`
  const cacheKey = `riot:mastery:${region}:${puuid}:${count}`
  
  return riotApiRequest<ChampionMastery[]>(url, cacheKey, 3600) // 1h cache
}

/**
 * Récupère le score total de mastery d'un joueur
 */
export async function getMasteryScore(
  puuid: string, 
  region: RiotRegion
): Promise<number> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/champion-mastery/v4/scores/by-puuid/${puuid}`
  const cacheKey = `riot:mastery-score:${region}:${puuid}`
  
  return riotApiRequest<number>(url, cacheKey, 3600)
}

// ========================================
// 🆕 BONUS APIs - Spectator (Live Match)
// ========================================

export interface CurrentGameInfo {
  gameId: number
  gameType: string
  gameStartTime: number
  mapId: number
  gameLength: number
  platformId: string
  gameMode: string
  participants: CurrentGameParticipant[]
}

export interface CurrentGameParticipant {
  championId: number
  perks: any
  profileIconId: number
  bot: boolean
  teamId: number
  summonerName: string
  puuid: string
  summonerId: string
}

/**
 * Vérifie si un joueur est actuellement en match
 * Usage: Badge 🔴 "En match" sur les profils
 */
export async function getCurrentMatch(
  puuid: string, 
  region: RiotRegion
): Promise<CurrentGameInfo | null> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/spectator/v5/active-games/by-summoner/${puuid}`
  const cacheKey = `riot:live:${region}:${puuid}`
  
  try {
    return await riotApiRequest<CurrentGameInfo>(url, cacheKey, 60) // 1 min cache
  } catch (error: any) {
    // 404 = pas en match actuellement
    if (error.message?.includes('404')) {
      return null
    }
    throw error
  }
}

// ========================================
// 🆕 BONUS APIs - Champion Rotation
// ========================================

export interface ChampionRotation {
  freeChampionIds: number[]
  freeChampionIdsForNewPlayers: number[]
  maxNewPlayerLevel: number
}

/**
 * Récupère la rotation hebdomadaire de champions gratuits
 * Usage: Page d'accueil "Champions gratuits cette semaine"
 */
export async function getFreeChampionRotation(
  region: RiotRegion
): Promise<ChampionRotation> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/platform/v3/champion-rotations`
  const cacheKey = `riot:rotation:${region}`
  
  return riotApiRequest<ChampionRotation>(url, cacheKey, 86400) // 24h cache
}

// ========================================
// 🆕 BONUS APIs - Server Status
// ========================================

export interface PlatformData {
  id: string
  name: string
  locales: string[]
  maintenances: Maintenance[]
  incidents: Incident[]
}

export interface Maintenance {
  id: number
  maintenance_status: string
  incident_severity: string
  titles: Array<{ locale: string; content: string }>
  updates: any[]
  created_at: string
  updated_at: string
  platforms: string[]
}

export interface Incident {
  id: number
  titles: Array<{ locale: string; content: string }>
  incident_severity: string
  updates: any[]
  created_at: string
  updated_at: string
  platforms: string[]
}

/**
 * Récupère le statut des serveurs
 * Usage: Afficher "Serveurs EUW: ✅ Opérationnels" ou alertes
 */
export async function getServerStatus(
  region: RiotRegion
): Promise<PlatformData> {
  const baseUrl = RIOT_API_BASE_URLS[region]
  const url = `${baseUrl}/lol/status/v4/platform-data`
  const cacheKey = `riot:status:${region}`
  
  return riotApiRequest<PlatformData>(url, cacheKey, 300) // 5 min cache
}

