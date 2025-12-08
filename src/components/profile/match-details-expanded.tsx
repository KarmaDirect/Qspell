'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sword, Users, Building2, Zap, Target, Gem } from 'lucide-react'
import Image from 'next/image'
import { getChampionIconUrl, getChampionById } from '@/lib/riot/champions'
import { MatchResultUltraCompact } from '@/components/match/MatchResultUltraCompact'
import type { Player as CompactPlayer, Team as CompactTeam } from '@/components/match/MatchResultCompact'

// Fonction pour traduire les rôles en français
function translateRole(role: string): string {
  const roleMap: Record<string, string> = {
    'TOP': 'Top',
    'JUNGLE': 'Jungle',
    'MIDDLE': 'Mid',
    'BOTTOM': 'ADC',
    'UTILITY': 'Support',
  }
  return roleMap[role] || role
}

// Composant pour charger les images de runes avec fallbacks
interface RuneImageProps {
  perkId: number
  styleName: string
  displayName?: string
}

function RuneImage({ perkId, styleName, displayName = 'Rune' }: RuneImageProps) {
  // Placeholder SVG par défaut
  const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="%231a1a1a"/%3E%3C/svg%3E'
  
  // Fonction pour générer l'URL Community Dragon
  const getCommunityDragonUrl = () => {
    if (!perkId || !styleName) return placeholderSvg
    return `https://raw.communitydragon.org/latest/game/assets/perks/styles/${styleName.toLowerCase()}/${perkId}.png`
  }
  
  // Fonction pour générer l'URL Data Dragon
  const getDataDragonUrl = () => {
    if (!perkId || !styleName) return placeholderSvg
    return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/${styleName}/${perkId}.png`
  }

  const [currentSrc, setCurrentSrc] = useState<string>(getCommunityDragonUrl())
  const [hasTriedFallback, setHasTriedFallback] = useState(false)

  useEffect(() => {
    // Réinitialiser l'état quand les props changent
    setHasTriedFallback(false)
    const url = getCommunityDragonUrl()
    if (url && url !== placeholderSvg) {
      setCurrentSrc(url)
    } else {
      setCurrentSrc(placeholderSvg)
    }
  }, [perkId, styleName])

  const handleError = () => {
    if (!hasTriedFallback) {
      // Premier fallback : Data Dragon
      const fallbackUrl = getDataDragonUrl()
      if (fallbackUrl && fallbackUrl !== placeholderSvg) {
        setCurrentSrc(fallbackUrl)
        setHasTriedFallback(true)
      } else {
        // Si Data Dragon URL est invalide, utiliser placeholder directement
        setCurrentSrc(placeholderSvg)
        setHasTriedFallback(true)
      }
    } else {
      // Si les deux sources ont échoué, utiliser placeholder
      setCurrentSrc(placeholderSvg)
    }
  }

  // Ne pas rendre l'image si src est vide ou invalide
  if (!currentSrc || currentSrc.trim() === '') {
    return (
      <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#1a1a1a] flex items-center justify-center">
        <span className="text-[#666] text-xs">?</span>
      </div>
    )
  }

  return (
    <img
      src={currentSrc}
      alt={displayName}
      width={32}
      height={32}
      className="rounded-lg bg-black/50 p-0.5"
      onError={handleError}
      loading="lazy"
    />
  )
}

interface MatchDetailsExpandedProps {
  matchId: string
  riotAccountId: string
  compact?: boolean // Option pour afficher en mode compact
}

interface Participant {
  puuid: string
  championName: string
  championId: number
  kills: number
  deaths: number
  assists: number
  win: boolean
  teamPosition: string
  summonerName: string
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
      }>
    }>
  }
  totalMinionsKilled: number
  neutralMinionsKilled: number
  goldEarned: number
  totalDamageDealtToChampions: number
  visionScore: number
  rank?: string
  performanceScore?: number
  kp?: number
  kda?: number
  csPerMin?: number
  goldPerMin?: number
  playerTier?: string | null
  playerRank?: string | null
  csScore?: number
  visionScoreValue?: number // Score calculé (0-100), différent de visionScore brut
  impactScore?: number
  goldScore?: number
  overallScore?: number
}

interface Team {
  participants: Participant[]
  objectives: {
    kills: number
    assists: number
    towers: number
    dragons: number
    barons: number
    inhibitors: number
  }
  win: boolean
}

interface MatchData {
  matchId: string
  gameCreation: number
  gameDuration: number
  queueId: number
  gameMode: string
  currentPlayer: Participant
  team100: Team
  team200: Team
}


function getItemUrl(itemId: number): string | null {
  if (!itemId || itemId === 0) return null
  return `https://ddragon.leagueoflegends.com/cdn/15.24.1/img/item/${itemId}.png`
}

function getSummonerSpellUrl(spellId: number): string {
  const spellMap: Record<number, string> = {
    1: 'SummonerBoost',
    3: 'SummonerExhaust',
    4: 'SummonerFlash',
    6: 'SummonerHaste',
    7: 'SummonerHeal',
    11: 'SummonerSmite',
    12: 'SummonerTeleport',
    13: 'SummonerMana',
    14: 'SummonerIgnite',
    21: 'SummonerBarrier',
  }
  const spellName = spellMap[spellId] || 'SummonerFlash'
  return `https://ddragon.leagueoflegends.com/cdn/15.24.1/img/spell/${spellName}.png`
}

// Fonction pour transformer les données MatchData vers le format compact
function transformToCompactFormat(matchData: MatchData): { blueTeam: CompactTeam; redTeam: CompactTeam; gameDuration: string; gameDate: string } {
  const formatPlayer = (participant: Participant, gameDurationMinutes: number): CompactPlayer => {
    const champion = getChampionById(participant.championId)
    const totalCS = participant.totalMinionsKilled + participant.neutralMinionsKilled
    const csPerMin = gameDurationMinutes > 0 ? totalCS / gameDurationMinutes : 0
    const goldPerMin = gameDurationMinutes > 0 ? participant.goldEarned / gameDurationMinutes : 0
    const visionPerMin = gameDurationMinutes > 0 ? participant.visionScore / gameDurationMinutes : 0
    
    return {
      summonerName: participant.summonerName || 'Joueur inconnu',
      championName: participant.championName,
      championId: participant.championId,
      championIcon: champion ? getChampionIconUrl(champion.key) : '',
      role: participant.teamPosition,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      cs: totalCS,
      csPerMin: csPerMin,
      visionScore: participant.visionScore,
      visionPerMin: visionPerMin,
      items: [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6],
      level: participant.championLevel || 1,
      goldEarned: participant.goldEarned,
      goldPerMin: goldPerMin,
      damageDealt: participant.totalDamageDealtToChampions,
      kp: participant.kp || 0,
      rank: participant.rank || '',
      playerTier: participant.playerTier || null,
      playerRank: participant.playerRank || null,
      isWinner: participant.win,
    }
  }

  const formatTeam = (team: Team, isBlue: boolean, gameDurationMinutes: number): CompactTeam => {
    // Calculer elder dragons (on suppose que c'est dans dragons pour l'instant, à ajuster selon l'API)
    return {
      isBlueTeam: isBlue,
      isWinner: team.win,
      players: team.participants.map(p => formatPlayer(p, gameDurationMinutes)),
      totalKills: team.objectives.kills,
      totalAssists: team.objectives.assists,
      dragons: team.objectives.dragons,
      barons: team.objectives.barons,
      elderDragons: 0, // À récupérer depuis l'API si disponible
      towers: team.objectives.towers,
    }
  }

  const gameDurationMinutes = Math.floor(matchData.gameDuration / 60)
  const gameDurationSeconds = matchData.gameDuration % 60
  const gameDurationStr = `${gameDurationMinutes}:${gameDurationSeconds.toString().padStart(2, '0')}`

  // Date formatée (ex: "Il y a 2 heures")
  const gameDate = new Date(matchData.gameCreation).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    blueTeam: formatTeam(matchData.team100, true, gameDurationMinutes),
    redTeam: formatTeam(matchData.team200, false, gameDurationMinutes),
    gameDuration: gameDurationStr,
    gameDate,
  }
}

export function MatchDetailsExpanded({ matchId, riotAccountId, compact = false }: MatchDetailsExpandedProps) {
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatchDetails() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/riot/match-details?matchId=${matchId}&riotAccountId=${riotAccountId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch match details')
        }

        const { match } = await response.json()
        setMatchData(match)
      } catch (err) {
        console.error('Error fetching match details:', err)
        setError(err instanceof Error ? err.message : 'Impossible de charger les détails')
      } finally {
        setLoading(false)
      }
    }

    fetchMatchDetails()
  }, [matchId, riotAccountId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 border-t border-[#1a1a1a]">
        <Loader2 className="h-6 w-6 animate-spin text-[#c8ff00]" />
      </div>
    )
  }

  if (error || !matchData) {
    return (
      <div className="p-4 border-t border-[#1a1a1a] text-center text-red-400 text-sm">
        <p>{error || 'Impossible de charger les détails'}</p>
      </div>
    )
  }

  // Mode compact
  if (compact) {
    const compactData = transformToCompactFormat(matchData)
    return (
      <div className="border-t-2 border-[#1a1a1a] bg-gradient-to-b from-[#0a0a0a] to-[#141414] p-4">
        <MatchResultUltraCompact
          blueTeam={compactData.blueTeam}
          redTeam={compactData.redTeam}
          gameDuration={compactData.gameDuration}
          gameDate={compactData.gameDate}
        />
      </div>
    )
  }

  return (
    <div className="border-t-2 border-[#1a1a1a] bg-gradient-to-b from-[#0a0a0a] to-[#141414]">
      {/* Header */}
      <div className="p-5 border-b-2 border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm text-[#888] font-medium">
              <span className="text-white font-semibold">{Math.floor(matchData.gameDuration / 60)}:{(matchData.gameDuration % 60).toString().padStart(2, '0')}</span>
              <span className="text-[#666]">•</span>
              <span>{matchData.queueId === 420 ? 'Solo/Duo' : matchData.queueId === 440 ? 'Flex 5v5' : 'Ranked'}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <span className="font-bold text-base">
                <span className="text-[#c8ff00]">{matchData.currentPlayer.kills}</span>
                <span className="text-[#666]"> / </span>
                <span className="text-red-400">{matchData.currentPlayer.deaths}</span>
                <span className="text-[#666]"> / </span>
                <span className="text-blue-400">{matchData.currentPlayer.assists}</span>
              </span>
              <span className="text-[#666]">|</span>
              <span className="text-[#c8ff00] text-base font-bold">
                {matchData.currentPlayer.kda ? matchData.currentPlayer.kda.toFixed(1) : '0.0'} KDA
              </span>
            </div>
          </div>
          <Badge className={`text-sm px-3 py-1 font-bold border-2 ${
            matchData.currentPlayer.rank === 'MVP' ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50' : 
            matchData.currentPlayer.rank === 'ACE' ? 'bg-[#c8ff00]/30 text-[#c8ff00] border-[#c8ff00]/50' : 
            'bg-[#1a1a1a] text-[#888] border-[#1a1a1a]'
          }`}>
            {matchData.currentPlayer.rank || 'N/A'}
          </Badge>
        </div>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6">
        {/* Team 100 (Blue) */}
        <TeamSection 
          team={matchData.team100}
          isBlue={true}
          currentPlayerPuuid={matchData.currentPlayer.puuid}
          gameDuration={matchData.gameDuration}
        />
        
        {/* Team 200 (Red) */}
        <TeamSection 
          team={matchData.team200}
          isBlue={false}
          currentPlayerPuuid={matchData.currentPlayer.puuid}
          gameDuration={matchData.gameDuration}
        />
      </div>
    </div>
  )
}

function TeamSection({ 
  team, 
  isBlue, 
  currentPlayerPuuid,
  gameDuration
}: { 
  team: Team
  isBlue: boolean
  currentPlayerPuuid: string
  gameDuration: number
}) {
  // Ordre des rôles : TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
  const roleOrder: Record<string, number> = {
    'TOP': 1,
    'JUNGLE': 2,
    'MIDDLE': 3,
    'BOTTOM': 4,
    'UTILITY': 5,
  }

  // Trier les participants par rôle
  const sortedParticipants = [...team.participants].sort((a, b) => {
    const aOrder = roleOrder[a.teamPosition] || 99
    const bOrder = roleOrder[b.teamPosition] || 99
    return aOrder - bOrder
  })

  return (
    <div className={`border-2 rounded-xl p-4 shadow-lg ${team.win ? 'border-[#c8ff00]/40 bg-gradient-to-br from-[#c8ff00]/10 to-[#c8ff00]/5' : 'border-red-500/40 bg-gradient-to-br from-red-500/10 to-red-500/5'}`}>
      {/* Team Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <h3 className={`font-bold text-base ${team.win ? 'text-[#c8ff00]' : 'text-red-400'}`}>
            {team.win ? 'Victoire' : 'Défaite'}
          </h3>
          <span className="text-[#888] text-xs font-medium">({isBlue ? 'Côté bleu' : 'Côté rouge'})</span>
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <Sword className="h-4 w-4 text-[#c8ff00]" />
            <span className="font-semibold text-white">{team.objectives.kills}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="font-semibold text-white">{team.objectives.assists}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <Building2 className="h-4 w-4 text-yellow-400" />
            <span className="font-semibold text-white">{team.objectives.towers}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <span className="text-orange-400 text-base leading-none">🐉</span>
            <span className="font-semibold text-white">{team.objectives.dragons}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <span className="text-purple-400 text-base leading-none">🐉</span>
            <span className="font-semibold text-white">{team.objectives.barons}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <Zap className="h-4 w-4 text-blue-300" />
            <span className="font-semibold text-white">{team.objectives.inhibitors}</span>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="space-y-3">
        {sortedParticipants.map((participant) => {
          const champion = getChampionById(participant.championId)
          const isCurrentPlayer = participant.puuid === currentPlayerPuuid
          const items = [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6]
          
          return (
            <div
              key={participant.puuid}
              className={`p-3 rounded-xl border-2 transition-all ${
                isCurrentPlayer 
                  ? 'bg-gradient-to-r from-[#c8ff00]/15 to-[#c8ff00]/5 border-[#c8ff00]/50 shadow-lg shadow-[#c8ff00]/10' 
                  : 'bg-[#141414] border-[#1a1a1a] hover:border-[#1a1a1a]/80 hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  <Badge className={`text-xs px-2 py-0.5 font-bold ${
                    participant.rank === 'MVP' ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50' : 
                    participant.rank === 'ACE' ? 'bg-[#c8ff00]/30 text-[#c8ff00] border-[#c8ff00]/50' : 
                    'bg-[#1a1a1a] text-[#888] border-[#1a1a1a]'
                  } border`}>
                    {participant.rank}
                  </Badge>
                </div>

                {/* Champion */}
                <div className="relative w-14 h-14 shrink-0">
                  {champion && (
                    <>
                      <div className="absolute inset-0 rounded-xl border-2 border-[#1a1a1a] bg-[#0a0a0a] p-0.5">
                        <Image
                          src={getChampionIconUrl(champion.key)}
                          alt={champion.name}
                          fill
                          className="rounded-lg"
                          sizes="56px"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-[#c8ff00] border-2 border-[#1a1a1a] rounded-md px-2 py-0.5 text-xs text-black font-bold shadow-lg min-w-[24px] text-center">
                        {participant.championLevel || 1}
                      </div>
                    </>
                  )}
                </div>

                {/* Summoner Spells */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {participant.summoner1Id && (
                    <div className="relative w-6 h-6 border border-[#1a1a1a] rounded-md overflow-hidden bg-[#0a0a0a]">
                      <Image
                        src={getSummonerSpellUrl(participant.summoner1Id)}
                        alt="Spell 1"
                        fill
                        className="rounded-md"
                        sizes="24px"
                      />
                    </div>
                  )}
                  {participant.summoner2Id && (
                    <div className="relative w-6 h-6 border border-[#1a1a1a] rounded-md overflow-hidden bg-[#0a0a0a]">
                      <Image
                        src={getSummonerSpellUrl(participant.summoner2Id)}
                        alt="Spell 2"
                        fill
                        className="rounded-md"
                        sizes="24px"
                      />
                    </div>
                  )}
                </div>

                {/* Rune */}
                {participant.perks?.styles?.[0]?.selections?.[0]?.perk && (() => {
                  const primaryStyle = participant.perks.styles[0]
                  const keystone = primaryStyle.selections[0]
                  // Map style ID to style name
                  const styleMap: Record<number, string> = {
                    8000: 'Precision',
                    8100: 'Domination',
                    8200: 'Sorcery',
                    8300: 'Inspiration',
                    8400: 'Resolve',
                  }
                  const styleName = styleMap[primaryStyle.style] || 'Precision'
                  
                  return (
                    <div className="w-8 h-8 relative shrink-0 border border-[#1a1a1a] rounded-lg overflow-hidden bg-[#0a0a0a] flex items-center justify-center">
                      <RuneImage
                        perkId={keystone.perk}
                        styleName={styleName}
                        displayName="Keystone"
                      />
                    </div>
                  )
                })()}

                {/* Items - Triés : items remplis à gauche, ward (item6) toujours à droite */}
                <div className="flex gap-1.5 flex-1 min-w-0 items-center">
                  {(() => {
                    // IDs des wards : tous les items de ward connus
                    const wardIds = [3340, 3361, 3362, 3363, 3364, 2051, 2052, 2054, 2055]
                    const isWard = (itemId: number) => itemId && wardIds.includes(itemId)
                    
                    // Séparer les items normaux (slots 0-5) et le ward (slot 6)
                    const normalItems = items.slice(0, 6)
                    const wardItem = items[6]
                    
                    // Items normaux remplis (sans les wards qui pourraient être dans les slots 0-5)
                    const filledNormalItems = normalItems
                      .map((itemId, idx) => ({ itemId, originalIdx: idx }))
                      .filter(item => getItemUrl(item.itemId) && !isWard(item.itemId))
                    
                    // Slots vides pour les items normaux
                    const emptyNormalSlots = Array(6 - filledNormalItems.length).fill(null)
                    
                    return (
                      <>
                        {/* Items normaux remplis */}
                        {filledNormalItems.map((item, idx) => (
                          <div key={`filled-${idx}`} className="relative w-9 h-9 shrink-0 group">
                            <div className="relative w-full h-full border-2 border-[#1a1a1a] rounded-lg overflow-hidden bg-[#0a0a0a] group-hover:border-[#c8ff00]/50 transition-all shadow-md group-hover:shadow-[#c8ff00]/20">
                              <Image
                                src={getItemUrl(item.itemId)!}
                                alt={`Item ${item.originalIdx}`}
                                fill
                                className="rounded-lg"
                                sizes="36px"
                              />
                            </div>
                          </div>
                        ))}
                        {/* Slots vides pour items normaux */}
                        {emptyNormalSlots.map((_, idx) => (
                          <div key={`empty-${idx}`} className="relative w-9 h-9 shrink-0">
                            <div className="w-full h-full bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-lg" />
                          </div>
                        ))}
                        {/* Ward (item6) toujours à droite, même si vide */}
                        <div className="relative w-9 h-9 shrink-0 ml-auto">
                          {getItemUrl(wardItem) ? (
                            <div className="relative w-full h-full border-2 border-[#1a1a1a] rounded-lg overflow-hidden bg-[#0a0a0a]">
                              <Image
                                src={getItemUrl(wardItem)!}
                                alt="Ward"
                                fill
                                className="rounded-lg"
                                sizes="36px"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-[#0a0a0a] border-2 border-[#1a1a1a] rounded-lg" />
                          )}
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1.5 min-w-[140px] shrink-0">
                  <div className="text-base text-white font-bold">
                    <span className="text-[#c8ff00]">{participant.kills}</span>
                    <span className="text-[#666]"> / </span>
                    <span className="text-red-400">{participant.deaths}</span>
                    <span className="text-[#666]"> / </span>
                    <span className="text-blue-400">{participant.assists}</span>
                  </div>
                  <div className="text-xs text-[#aaa] font-semibold bg-[#0a0a0a] px-2 py-0.5 rounded border border-[#1a1a1a]">
                    KP: <span className="text-white">{participant.kp || 0}%</span>
                  </div>
                  {participant.teamPosition !== 'UTILITY' ? (
                    <>
                      <div className="text-xs text-[#aaa] font-semibold">
                        <span className="text-white">{participant.csPerMin ? participant.csPerMin.toFixed(1) : '0.0'}</span> CS/min
                      </div>
                      <div className="text-[11px] text-[#888] font-medium">
                        <span className="text-[#c8ff00]">{participant.goldEarned ? `${(participant.goldEarned / 1000).toFixed(1)}K` : '0K'}</span> <span className="text-[#666]">({(participant.totalMinionsKilled + participant.neutralMinionsKilled)}/m)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-[#aaa] font-semibold">
                        <span className="text-white">{gameDuration ? (participant.visionScore / (gameDuration / 60)).toFixed(1) : '0.0'}</span> Vision
                      </div>
                      <div className="text-[11px] text-[#888] font-medium">
                        <span className="text-[#c8ff00]">{participant.goldEarned ? `${(participant.goldEarned / 1000).toFixed(1)}K` : '0K'}</span> <span className="text-[#666]">({participant.visionScore || 0}/m)</span>
                      </div>
                    </>
                  )}
                  <div className="mt-1.5 space-y-1">
                    <div className="text-xs text-[#c8ff00] font-bold bg-[#c8ff00]/10 px-2 py-1 rounded border border-[#c8ff00]/30 text-center">
                      {participant.overallScore || 0}/100
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <div className="text-[#888]">
                        CS: <span className="text-white font-semibold">{participant.csScore || 0}</span>
                      </div>
                      <div className="text-[#888]">
                        Vision: <span className="text-white font-semibold">{participant.visionScoreValue || 0}</span>
                      </div>
                      <div className="text-[#888]">
                        Impact: <span className="text-white font-semibold">{participant.impactScore || 0}</span>
                      </div>
                      <div className="text-[#888]">
                        Gold: <span className="text-white font-semibold">{participant.goldScore || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Name, Rank & Position */}
              <div className="mt-3 pt-2 border-t border-[#1a1a1a] space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate font-bold mb-1">
                      {participant.summonerName || 'Joueur inconnu'}
                    </div>
                    {participant.playerTier && participant.playerRank ? (
                      <div className="text-xs text-[#c8ff00] font-semibold uppercase tracking-wide">
                        {participant.playerTier} {participant.playerRank}
                      </div>
                    ) : (
                      <div className="text-xs text-[#666] italic">Rang non disponible</div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-[#1a1a1a] text-[#c8ff00] bg-[#0a0a0a] font-medium shrink-0">
                    {participant.teamPosition ? translateRole(participant.teamPosition) : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

