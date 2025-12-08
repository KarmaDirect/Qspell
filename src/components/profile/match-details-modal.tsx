'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2, X, Trophy, Target, Sword, Shield } from 'lucide-react'
import Image from 'next/image'
import { getChampionIconUrl, getChampionById } from '@/lib/riot/champions'

interface MatchDetailsModalProps {
  matchId: string | null
  riotAccountId: string
  isOpen: boolean
  onClose: () => void
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

export function MatchDetailsModal({ matchId, riotAccountId, isOpen, onClose }: MatchDetailsModalProps) {
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !matchId) return

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
  }, [isOpen, matchId, riotAccountId])

  if (!isOpen) return null

  const getQueueName = (queueId: number) => {
    if (queueId === 420) return 'Solo/Duo'
    if (queueId === 440) return 'Flex 5v5'
    return 'Ranked'
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (days > 0) return `${days}j`
    if (hours > 0) return `${hours}h`
    return 'Récemment'
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-[#1a1a1a] p-0">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#c8ff00]" />
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-400">
            <p>{error}</p>
          </div>
        )}

        {matchData && !loading && (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#666] text-sm">{formatDuration(matchData.gameDuration)}</span>
                  <span className="text-[#666] text-sm">{formatTimeAgo(matchData.gameCreation)}</span>
                  <Badge variant="outline" className="text-xs border-[#1a1a1a] text-[#666]">
                    {getQueueName(matchData.queueId)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="font-semibold">
                    {matchData.currentPlayer.kills} / {matchData.currentPlayer.deaths} / {matchData.currentPlayer.assists}
                  </span>
                  <span className="text-[#666]">|</span>
                  <span className="text-[#c8ff00]">
                    {matchData.currentPlayer.kda ? matchData.currentPlayer.kda.toFixed(1) : '0.0'} KDA
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {getChampionById(matchData.currentPlayer.championId) && (
                    <Image
                      src={getChampionIconUrl(getChampionById(matchData.currentPlayer.championId)!.key)}
                      alt={matchData.currentPlayer.championName}
                      width={32}
                      height={32}
                      className="rounded"
                    />
                  )}
                </div>
                <Badge className={`${matchData.currentPlayer.rank === 'MVP' ? 'bg-yellow-500/20 text-yellow-400' : matchData.currentPlayer.rank === 'ACE' ? 'bg-[#c8ff00]/20 text-[#c8ff00]' : 'bg-[#1a1a1a] text-[#666]'}`}>
                  {matchData.currentPlayer.rank || 'N/A'}
                </Badge>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#666]" />
              </button>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
              {/* Team 100 (Blue) */}
              <TeamSection 
                team={matchData.team100}
                isBlue={true}
                currentPlayerPuuid={matchData.currentPlayer.puuid}
              />
              
              {/* Team 200 (Red) */}
              <TeamSection 
                team={matchData.team200}
                isBlue={false}
                currentPlayerPuuid={matchData.currentPlayer.puuid}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
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

function TeamSection({ 
  team, 
  isBlue, 
  currentPlayerPuuid 
}: { 
  team: Team
  isBlue: boolean
  currentPlayerPuuid: string
}) {

  return (
    <div className={`border rounded-lg p-4 ${team.win ? 'border-[#c8ff00]/30 bg-[#c8ff00]/5' : 'border-red-500/30 bg-red-500/5'}`}>
      {/* Team Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className={`font-bold ${team.win ? 'text-[#c8ff00]' : 'text-red-400'}`}>
            {team.win ? 'Victoire' : 'Défaite'}
          </h3>
          <span className="text-[#666] text-sm">({isBlue ? 'Côté bleu' : 'Côté rouge'})</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#666]">
          <div className="flex items-center gap-1">
            <Sword className="h-3 w-3" />
            <span>{team.objectives.kills}</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>{team.objectives.assists}</span>
          </div>
          <span>T: {team.objectives.towers}</span>
          <span>D: {team.objectives.dragons}</span>
          <span>B: {team.objectives.barons}</span>
          <span>I: {team.objectives.inhibitors}</span>
        </div>
      </div>

      {/* Players */}
      <div className="space-y-2">
        {team.participants.map((participant) => {
          const champion = getChampionById(participant.championId)
          const isCurrentPlayer = participant.puuid === currentPlayerPuuid
          const items = [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6]
          
          return (
            <div
              key={participant.puuid}
              className={`p-3 rounded-lg border ${
                isCurrentPlayer 
                  ? 'bg-[#c8ff00]/10 border-[#c8ff00]/30' 
                  : 'bg-[#141414] border-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-8 text-center">
                  <Badge className={`text-xs ${
                    participant.rank === 'MVP' ? 'bg-yellow-500/20 text-yellow-400' : 
                    participant.rank === 'ACE' ? 'bg-[#c8ff00]/20 text-[#c8ff00]' : 
                    'bg-[#1a1a1a] text-[#666]'
                  }`}>
                    {participant.rank}
                  </Badge>
                </div>

                {/* Champion */}
                <div className="relative w-12 h-12">
                  {champion && (
                    <>
                      <Image
                        src={getChampionIconUrl(champion.key)}
                        alt={champion.name}
                        fill
                        className="rounded-lg"
                        sizes="48px"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded px-1 text-[10px] text-white">
                        {participant.championLevel}
                      </div>
                    </>
                  )}
                </div>

                {/* Summoner Spells */}
                <div className="flex flex-col gap-1">
                  {participant.summoner1Id && (
                    <div className="relative w-5 h-5">
                      <Image
                        src={getSummonerSpellUrl(participant.summoner1Id)}
                        alt="Spell 1"
                        fill
                        className="rounded"
                        sizes="20px"
                      />
                    </div>
                  )}
                  {participant.summoner2Id && (
                    <div className="relative w-5 h-5">
                      <Image
                        src={getSummonerSpellUrl(participant.summoner2Id)}
                        alt="Spell 2"
                        fill
                        className="rounded"
                        sizes="20px"
                      />
                    </div>
                  )}
                </div>

                {/* Rune */}
                {participant.perks?.styles?.[0]?.selections?.[0]?.perk && (
                  <div className="w-8 h-8 relative">
                    <Image
                      src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/${participant.perks.styles[0].selections[0].perk}.png`}
                      alt="Keystone"
                      fill
                      className="rounded"
                      sizes="32px"
                    />
                  </div>
                )}

                {/* Items */}
                <div className="flex gap-1 flex-1">
                  {items.map((itemId, idx) => (
                    <div key={idx} className="relative w-8 h-8">
                      {getItemUrl(itemId) ? (
                        <Image
                          src={getItemUrl(itemId)!}
                          alt={`Item ${idx}`}
                          fill
                          className="rounded border border-[#1a1a1a]"
                          sizes="32px"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#0a0a0a] border border-[#1a1a1a] rounded" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex flex-col items-end gap-1 min-w-[120px]">
                  <div className="text-sm text-white font-semibold">
                    {participant.kills} / {participant.deaths} / {participant.assists}
                  </div>
                  <div className="text-xs text-[#666]">
                    KP: {participant.kp}%
                  </div>
                  {participant.teamPosition !== 'UTILITY' ? (
                    <div className="text-xs text-[#666]">
                      {participant.csPerMin ? participant.csPerMin.toFixed(1) : '0.0'} CS/min
                    </div>
                  ) : (
                    <div className="text-xs text-[#666]">
                      Vision: {participant.visionScore || 0}
                    </div>
                  )}
                  <div className="text-xs text-[#c8ff00] font-semibold">
                    {participant.performanceScore}
                  </div>
                </div>
              </div>

              {/* Player Name & Position */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[#666]">{participant.summonerName}</span>
                <Badge variant="outline" className="text-[10px] border-[#1a1a1a] text-[#666]">
                  {participant.teamPosition || 'N/A'}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

