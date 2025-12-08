'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'
import { getChampionIconUrl, getChampionById } from '@/lib/riot/champions'
import { MatchDetailsExpanded } from './match-details-expanded'
import type { Database } from '@/lib/types/database.types'

type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']

interface Match {
  matchId: string
  gameCreation: number
  gameDuration: number
  queueId: number
  gameMode: string
  participant: {
    championName: string
    championId: number
    kills: number
    deaths: number
    assists: number
    win: boolean
    teamPosition: string
  }
}

export function RecentGamesCard({ riotAccount }: { riotAccount: RiotAccount | null }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      if (!riotAccount?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/riot/matches?riotAccountId=${riotAccount.id}&count=10`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch matches')
        }

        const { matches: matchesData } = await response.json()
        setMatches(matchesData)
      } catch (err) {
        console.error('Error fetching matches:', err)
        setError('Impossible de charger les matchs')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [riotAccount?.id])

  if (!riotAccount) {
    return null
  }

  if (loading) {
    return (
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
            <Trophy className="h-5 w-5 text-[#c8ff00]" />
          </div>
          <h3 className="font-bold text-white">10 dernières games ranked</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#c8ff00]" />
        </div>
      </Card>
    )
  }

  if (error || matches.length === 0) {
    return (
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
            <Trophy className="h-5 w-5 text-[#c8ff00]" />
          </div>
          <h3 className="font-bold text-white">10 dernières games ranked</h3>
        </div>
        <div className="text-center py-12 text-[#666]">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{error || 'Aucun match ranked trouvé'}</p>
        </div>
      </Card>
    )
  }

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
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (days > 0) return `${days}j`
    if (hours > 0) return `${hours}h`
    return `${minutes}min`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
          <Trophy className="h-5 w-5 text-[#c8ff00]" />
        </div>
        <h3 className="font-bold text-white">10 dernières games ranked</h3>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const champion = getChampionById(match.participant.championId)
          const kda = match.participant.kills + match.participant.assists
          const kdaRatio = match.participant.deaths > 0 
            ? ((match.participant.kills + match.participant.assists) / match.participant.deaths).toFixed(1)
            : 'Perfect'
          
          const isExpanded = expandedMatchId === match.matchId

          return (
            <div
              key={match.matchId}
              className={`bg-[#0a0a0a] border rounded-lg overflow-hidden ${
                match.participant.win ? 'border-[#c8ff00]/20' : 'border-red-500/20'
              }`}
            >
              <div
                onClick={() => setExpandedMatchId(isExpanded ? null : match.matchId)}
                className="p-5 hover:bg-[#141414] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  {/* Champion Icon */}
                  <div className="relative w-14 h-14 shrink-0">
                    {champion && (
                      <Image
                        src={getChampionIconUrl(champion.key)}
                        alt={champion.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="56px"
                      />
                    )}
                  </div>

                  {/* Match Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-bold text-base ${
                        match.participant.win ? 'text-[#c8ff00]' : 'text-red-400'
                      }`}>
                        {match.participant.win ? 'Victoire' : 'Défaite'}
                      </span>
                      <Badge variant="outline" className="text-xs border-[#1a1a1a] text-[#666] bg-[#0a0a0a]">
                        {getQueueName(match.queueId)}
                      </Badge>
                      <span className="text-xs text-[#888]">
                        {formatTimeAgo(match.gameCreation)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-5 text-base">
                      <span className="text-white font-semibold">
                        {champion?.name || match.participant.championName}
                      </span>
                      <span className="text-[#888]">
                        {match.participant.kills}/{match.participant.deaths}/{match.participant.assists}
                      </span>
                      <span className={`font-bold ${
                        parseFloat(kdaRatio) >= 3 ? 'text-[#c8ff00]' : 
                        parseFloat(kdaRatio) >= 2 ? 'text-yellow-400' : 'text-[#888]'
                      }`}>
                        {kdaRatio} KDA
                      </span>
                    </div>
                  </div>

                  {/* Duration & Result */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm text-[#888] font-medium">{formatDuration(match.gameDuration)}</span>
                    {match.participant.win ? (
                      <TrendingUp className="h-5 w-5 text-[#c8ff00]" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && riotAccount && (
                <MatchDetailsExpanded
                  matchId={match.matchId}
                  riotAccountId={riotAccount.id}
                  compact={true}
                />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

