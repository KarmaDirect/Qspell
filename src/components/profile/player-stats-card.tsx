'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, TrendingUp, Target } from 'lucide-react'
import Image from 'next/image'
import type { Database } from '@/lib/types/database.types'

type RiotAccount = Database['public']['Tables']['riot_accounts']['Row']
type PlayerStats = Database['public']['Tables']['player_stats']['Row']

const RANK_COLORS: Record<string, string> = {
  IRON: 'bg-gray-600',
  BRONZE: 'bg-orange-700',
  SILVER: 'bg-gray-400',
  GOLD: 'bg-yellow-500',
  PLATINUM: 'bg-cyan-500',
  EMERALD: 'bg-emerald-500',
  DIAMOND: 'bg-blue-500',
  MASTER: 'bg-purple-500',
  GRANDMASTER: 'bg-red-500',
  CHALLENGER: 'bg-amber-500',
}

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

export function PlayerStatsCard({ 
  account, 
  stats 
}: { 
  account: RiotAccount
  stats: PlayerStats[]
}) {
  const rankedSolo = stats.find(s => s.queue_type === 'RANKED_SOLO_5x5')
  const rankedFlex = stats.find(s => s.queue_type === 'RANKED_FLEX_SR')

  return (
    <Card className="p-6 bg-[#141414] border-[#1a1a1a]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#c8ff00]/10 rounded-lg">
          <Trophy className="h-5 w-5 text-[#c8ff00]" />
        </div>
        <h2 className="text-xl font-bold text-white">Statistiques Ranked</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Solo/Duo */}
        <RankedStatsSection 
          title="Solo/Duo"
          stat={rankedSolo}
        />

        {/* Flex */}
        <RankedStatsSection 
          title="Flex 5v5"
          stat={rankedFlex}
        />
      </div>

      {/* Champion Mastery */}
      {rankedSolo?.champion_mastery && (
        <div className="mt-8 pt-6 border-t border-[#1a1a1a]">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <Target className="h-4 w-4 text-[#c8ff00]" />
            Champions maîtrisés
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {/* Placeholder - would need champion icons from Data Dragon */}
            <div className="text-center">
              <div className="h-16 w-16 bg-[#1a1a1a] rounded-lg mx-auto mb-2 border border-[#1a1a1a]" />
              <p className="text-xs font-medium text-white">Champion</p>
              <p className="text-xs text-[#666]">M7</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

function RankedStatsSection({ 
  title, 
  stat 
}: { 
  title: string
  stat?: PlayerStats
}) {
  if (!stat || !stat.tier) {
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-5">
        <h3 className="font-semibold mb-4 text-[#888] text-sm uppercase tracking-wide">{title}</h3>
        <div className="text-center py-12 text-[#666]">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Non classé</p>
        </div>
      </div>
    )
  }

  const totalGames = (stat.wins || 0) + (stat.losses || 0)
  const winrate = totalGames > 0 ? Math.round(((stat.wins || 0) / totalGames) * 100) : 0
  const tierKey = (stat.tier || '').trim().toUpperCase()
  const rankColor = RANK_COLORS[tierKey] || 'bg-gray-500'
  const emblem = RANK_EMBLEMS[tierKey]

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-5 hover:border-[#c8ff00]/20 transition-colors">
      <h3 className="font-semibold mb-4 text-[#888] text-sm uppercase tracking-wide">{title}</h3>
      
      <div className="space-y-5">
        {/* Rank Badge */}
        <div className="flex flex-col items-center gap-4">
          {/* Icon above text */}
          <div className="relative w-28 h-28 flex-shrink-0">
            {emblem ? (
              <Image
                src={emblem}
                alt={`${stat.tier} emblem`}
                fill
                className="object-contain drop-shadow-lg"
                sizes="112px"
                priority
              />
            ) : (
              <div className={`w-full h-full rounded-lg ${rankColor} flex items-center justify-center text-white font-bold shadow-lg`}>
                <div className="text-center">
                  <div className="text-xs">{stat.tier}</div>
                  <div className="text-xl">{stat.rank}</div>
                </div>
              </div>
            )}
          </div>
          {/* Rank text below icon */}
          <div className="text-center">
            <p className="font-bold text-xl text-white mb-1">{stat.tier} {stat.rank}</p>
            <p className="text-sm text-[#c8ff00] font-medium">{stat.league_points} LP</p>
          </div>
        </div>

        {/* Win/Loss */}
        <div className="bg-[#141414] rounded-lg p-4 border border-[#1a1a1a]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#666] text-sm">Winrate</span>
            <span className="font-bold text-white text-lg">{winrate}%</span>
          </div>
          <div className="relative h-2 bg-[#0a0a0a] rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-[#c8ff00] to-[#b8ef00] rounded-full transition-all duration-500"
              style={{ width: `${winrate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#666]">
            <span className="flex items-center gap-1">
              <span className="text-[#c8ff00] font-semibold">{stat.wins}</span>
              <span>V</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-red-400 font-semibold">{stat.losses}</span>
              <span>D</span>
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-3">
            <div className="text-[#666] text-xs mb-1">Total</div>
            <div className="font-bold text-white text-lg">{totalGames}</div>
            <div className="text-[#666] text-xs mt-0.5">games</div>
          </div>
          <div className="bg-[#141414] border border-[#1a1a1a] rounded-lg p-3">
            <div className="text-[#666] text-xs mb-1">Form</div>
            <div className="font-bold flex items-center gap-1.5 text-white">
              <TrendingUp className={`h-4 w-4 ${winrate > 50 ? 'text-[#c8ff00]' : 'text-red-400'}`} />
              <span className={winrate > 50 ? 'text-[#c8ff00]' : 'text-red-400'}>
                {winrate > 50 ? 'En forme' : 'En baisse'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

