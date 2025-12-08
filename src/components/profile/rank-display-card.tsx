'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Trophy, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import type { Database } from '@/lib/types/database.types'

type PlayerStats = Database['public']['Tables']['player_stats']['Row']

const RANK_EMBLEMS: Record<string, string> = {
  IRON: '/ranklogo/7574-iron.png',
  BRONZE: '/ranklogo/1184-bronze.png',
  SILVER: '/ranklogo/7455-silver.png',
  GOLD: '/ranklogo/1053-gold.png',
  PLATINUM: '/ranklogo/3978-platinum.png',
  EMERALD: '/ranklogo/emerald.png.png',
  DIAMOND: '/ranklogo/1053-diamond.png',
  MASTER: '/ranklogo/9231-master.png',
  GRANDMASTER: '/ranklogo/grandmaster.png.png',
  CHALLENGER: '/ranklogo/9476-challenger.png',
}

const RANK_ORDER = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER']
const DIVISION_ORDER = ['IV', 'III', 'II', 'I']

export function RankDisplayCard({ stats }: { stats: PlayerStats[] }) {
  const [selectedQueue, setSelectedQueue] = useState<'solo' | 'flex'>('solo')
  
  const rankedSolo = stats.find(s => s.queue_type === 'RANKED_SOLO_5x5')
  const rankedFlex = stats.find(s => s.queue_type === 'RANKED_FLEX_SR')
  
  const currentStat = selectedQueue === 'solo' ? rankedSolo : rankedFlex
  
  if (!currentStat || !currentStat.tier) {
    return (
      <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
            <Trophy className="h-5 w-5 text-[#c8ff00]" />
          </div>
          <h3 className="font-bold text-white">Rang</h3>
        </div>
        <div className="text-center py-8 text-[#666]">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Non classé</p>
        </div>
      </Card>
    )
  }

  const tierKey = (currentStat.tier || '').trim().toUpperCase()
  const emblem = RANK_EMBLEMS[tierKey]
  const currentRankIndex = RANK_ORDER.indexOf(tierKey)
  const currentDivisionIndex = DIVISION_ORDER.indexOf(currentStat.rank || 'IV')
  const nextRank = currentRankIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentRankIndex + 1] : null
  const nextDivision = currentDivisionIndex > 0 ? DIVISION_ORDER[currentDivisionIndex - 1] : (nextRank ? 'IV' : null)
  
  const totalGames = (currentStat.wins || 0) + (currentStat.losses || 0)
  const winrate = totalGames > 0 ? Math.round(((currentStat.wins || 0) / totalGames) * 100) : 0
  const lpProgress = currentStat.league_points || 0
  const lpMax = 100

  return (
    <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
            <Trophy className="h-5 w-5 text-[#c8ff00]" />
          </div>
          <h3 className="font-bold text-white">Rang</h3>
        </div>
        
        {/* Queue Selector */}
        <div className="flex items-center gap-1 bg-[#0a0a0a] rounded-lg p-1 border border-[#1a1a1a]">
          <button
            onClick={() => setSelectedQueue('solo')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedQueue === 'solo'
                ? 'bg-[#c8ff00] text-black'
                : 'text-[#666] hover:text-white'
            }`}
            disabled={!rankedSolo}
          >
            Solo
          </button>
          <button
            onClick={() => setSelectedQueue('flex')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
              selectedQueue === 'flex'
                ? 'bg-[#c8ff00] text-black'
                : 'text-[#666] hover:text-white'
            }`}
            disabled={!rankedFlex}
          >
            Flex
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Rank */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32">
            {emblem ? (
              <Image
                src={emblem}
                alt={`${currentStat.tier} emblem`}
                fill
                className="object-contain drop-shadow-lg"
                sizes="128px"
                priority
              />
            ) : null}
          </div>
          <div className="text-center">
            <p className="font-bold text-2xl text-white mb-1">{currentStat.tier} {currentStat.rank}</p>
            <p className="text-sm text-[#c8ff00] font-medium">{currentStat.league_points} LP</p>
          </div>
        </div>

        {/* LP Progress */}
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#1a1a1a]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#666] text-xs">Progression</span>
            <span className="text-[#c8ff00] font-semibold text-sm">{lpProgress} / {lpMax} LP</span>
          </div>
          <div className="relative h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#c8ff00] to-[#b8ef00] rounded-full transition-all duration-500"
              style={{ width: `${(lpProgress / lpMax) * 100}%` }}
            />
          </div>
        </div>

        {/* Next Rank */}
        {nextRank && (
          <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-[#c8ff00]" />
              <span className="text-[#666] text-xs">Prochain rang</span>
            </div>
            <p className="text-white font-semibold">
              {nextRank} {nextDivision || 'IV'}
            </p>
          </div>
        )}

        {/* Winrate */}
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-[#1a1a1a]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#666] text-xs">Winrate</span>
            <span className={`font-bold text-lg ${winrate >= 50 ? 'text-[#c8ff00]' : 'text-red-400'}`}>
              {winrate}%
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#666]">
            <span className="text-[#c8ff00]">{currentStat.wins}V</span>
            <span>•</span>
            <span className="text-red-400">{currentStat.losses}D</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

