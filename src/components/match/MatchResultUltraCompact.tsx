'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getChampionIconUrl } from '@/lib/riot/champions'
import type { Player, Team, MatchResultCompactProps } from './MatchResultCompact'
import { ObjectiveIcon } from './ObjectiveIcon'

function getItemUrl(itemId: number | null): string | null {
  if (!itemId || itemId === 0) return null
  return `https://ddragon.leagueoflegends.com/cdn/15.24.1/img/item/${itemId}.png`
}

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

function MiniPlayerRow({ player, gameDuration }: { player: Player; gameDuration: string }) {
  const kda = player.deaths === 0 
    ? '∞' 
    : ((player.kills + player.assists) / player.deaths).toFixed(1)
  
  const getRankBadgeColor = (rank: string) => {
    if (rank === 'MVP') return 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50'
    if (rank === 'ACE') return 'bg-[#c8ff00]/30 text-[#c8ff00] border-[#c8ff00]/50'
    if (rank === '2nd') return 'bg-blue-500/30 text-blue-300 border-blue-500/50'
    if (rank === '3rd') return 'bg-purple-500/30 text-purple-300 border-purple-500/50'
    return 'bg-[#1a1a1a] text-[#888] border-[#1a1a1a]'
  }

  return (
    <div className="px-3 py-2 hover:bg-[#1a1a1a]/30 transition-colors border-b border-[#1a1a1a]/20 last:border-b-0">
      <div className="flex items-center gap-3">
        {/* Champion + Level */}
        <div className="relative w-10 h-10 rounded overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a] shrink-0">
          <Image
            src={player.championIcon}
            alt={player.championName}
            width={40}
            height={40}
            className="object-cover"
            unoptimized
          />
          <div className="absolute -bottom-1 -right-1 bg-[#c8ff00] border border-[#1a1a1a] rounded px-1 text-[9px] font-bold text-black">
            {player.level}
          </div>
        </div>

        {/* Player Info Column */}
        <div className="min-w-[140px] max-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <div className="truncate font-semibold text-white text-sm">{player.summonerName}</div>
            {player.rank && (
              <div className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0", getRankBadgeColor(player.rank))}>
                {player.rank}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-[#888] uppercase font-medium">{translateRole(player.role)}</div>
            {player.playerTier && player.playerRank && (
              <div className="text-[10px] text-[#c8ff00] font-semibold uppercase">
                {player.playerTier} {player.playerRank}
              </div>
            )}
          </div>
        </div>

        {/* KDA Column */}
        <div className="min-w-[90px]">
          <div className="text-[10px] text-[#888] mb-0.5">KDA</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-[#c8ff00] font-semibold">{player.kills}</span>
            <span className="text-[#666]">/</span>
            <span className="text-red-400 font-semibold">{player.deaths}</span>
            <span className="text-[#666]">/</span>
            <span className="text-blue-400 font-semibold">{player.assists}</span>
          </div>
          <div className={cn(
            "text-[10px] font-bold mt-0.5",
            kda === '∞' ? "text-[#c8ff00]" : parseFloat(kda) >= 3 ? "text-green-500" : "text-[#888]"
          )}>
            Ratio: {kda}
          </div>
        </div>

        {/* KP Column */}
        <div className="min-w-[50px]">
          <div className="text-[10px] text-[#888] mb-0.5">KP</div>
          <div className="text-sm font-semibold text-white">{player.kp}%</div>
        </div>

        {/* CS Column */}
        <div className="min-w-[70px]">
          <div className="text-[10px] text-[#888] mb-0.5">CS</div>
          <div className="text-sm font-semibold text-white">{player.cs}</div>
          <div className="text-[10px] text-[#888]">{player.csPerMin.toFixed(1)}/min</div>
        </div>

        {/* Vision Column */}
        <div className="min-w-[60px]">
          <div className="text-[10px] text-[#888] mb-0.5">Vision</div>
          <div className="text-sm font-semibold text-yellow-400">{player.visionScore}</div>
          <div className="text-[10px] text-[#888]">{player.visionPerMin.toFixed(1)}/min</div>
        </div>

        {/* Gold Column */}
        <div className="min-w-[70px]">
          <div className="text-[10px] text-[#888] mb-0.5">Gold</div>
          <div className="text-sm font-semibold text-[#c8ff00]">{(player.goldEarned / 1000).toFixed(1)}k</div>
          <div className="text-[10px] text-[#888]">{player.goldPerMin.toFixed(0)}/min</div>
        </div>

        {/* Items */}
        <div className="flex gap-0.5 flex-1 min-w-[140px]">
          <div className="text-[10px] text-[#888] mr-1 shrink-0 self-center">Items:</div>
          {player.items.slice(0, 7).map((itemId, idx) => (
            <div key={idx} className="w-6 h-6 rounded border border-[#1a1a1a]/50 bg-[#0a0a0a] overflow-hidden shrink-0">
              {itemId && getItemUrl(itemId) ? (
                <Image
                  src={getItemUrl(itemId)!}
                  alt="item"
                  width={24}
                  height={24}
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a]/50" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MatchResultUltraCompact({ 
  blueTeam, 
  redTeam, 
  gameDuration,
  gameDate 
}: MatchResultCompactProps) {
  return (
    <div className="w-full border border-[#1a1a1a] rounded-lg overflow-hidden bg-[#141414]/30">
      {/* Blue Team */}
      <div className={cn(
        "border-b border-[#1a1a1a]",
        blueTeam.isWinner ? "bg-[#c8ff00]/10" : "bg-blue-500/10"
      )}>
        <div className={cn(
          "px-3 py-2 flex items-center justify-between border-b border-[#1a1a1a]",
          blueTeam.isWinner ? "bg-[#c8ff00]/20" : "bg-blue-500/20"
        )}>
          <div className="flex items-center gap-4">
            <span className={cn(
              "text-sm font-bold",
              blueTeam.isWinner ? "text-[#c8ff00]" : "text-blue-400"
            )}>
              {blueTeam.isWinner ? "VICTORY" : "DEFEAT"}
            </span>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[#888]">Kills: </span>
                <span className="text-white font-semibold">{blueTeam.totalKills}</span>
              </div>
              <div>
                <span className="text-[#888]">Assists: </span>
                <span className="text-white font-semibold">{blueTeam.totalAssists}</span>
              </div>
              <div className="flex items-center gap-1">
                <ObjectiveIcon type="dragon" size="sm" />
                <span className="text-[#888]">Dragons: </span>
                <span className="text-white font-semibold">{blueTeam.dragons}</span>
              </div>
              <div className="flex items-center gap-1">
                <ObjectiveIcon type="baron" size="sm" />
                <span className="text-[#888]">Barons: </span>
                <span className="text-white font-semibold">{blueTeam.barons}</span>
              </div>
              {blueTeam.elderDragons > 0 && (
                <div className="flex items-center gap-1">
                  <ObjectiveIcon type="elder" size="sm" />
                  <span className="text-[#888]">Elder: </span>
                  <span className="text-white font-semibold">{blueTeam.elderDragons}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <ObjectiveIcon type="tower" size="sm" />
                <span className="text-[#888]">Towers: </span>
                <span className="text-white font-semibold">{blueTeam.towers}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#1a1a1a]/30">
          {blueTeam.players.map((p, i) => (
            <MiniPlayerRow key={i} player={p} gameDuration={gameDuration} />
          ))}
        </div>
      </div>
      
      {/* Red Team */}
      <div className={cn(
        redTeam.isWinner ? "bg-[#c8ff00]/10" : "bg-red-500/10"
      )}>
        <div className={cn(
          "px-3 py-2 flex items-center justify-between border-b border-[#1a1a1a]",
          redTeam.isWinner ? "bg-[#c8ff00]/20" : "bg-red-500/20"
        )}>
          <div className="flex items-center gap-4">
            <span className={cn(
              "text-sm font-bold",
              redTeam.isWinner ? "text-[#c8ff00]" : "text-red-400"
            )}>
              {redTeam.isWinner ? "VICTORY" : "DEFEAT"}
            </span>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[#888]">Kills: </span>
                <span className="text-white font-semibold">{redTeam.totalKills}</span>
              </div>
              <div>
                <span className="text-[#888]">Assists: </span>
                <span className="text-white font-semibold">{redTeam.totalAssists}</span>
              </div>
              <div className="flex items-center gap-1">
                <ObjectiveIcon type="dragon" size="sm" />
                <span className="text-[#888]">Dragons: </span>
                <span className="text-white font-semibold">{redTeam.dragons}</span>
              </div>
              <div className="flex items-center gap-1">
                <ObjectiveIcon type="baron" size="sm" />
                <span className="text-[#888]">Barons: </span>
                <span className="text-white font-semibold">{redTeam.barons}</span>
              </div>
              {redTeam.elderDragons > 0 && (
                <div className="flex items-center gap-1">
                  <ObjectiveIcon type="elder" size="sm" />
                  <span className="text-[#888]">Elder: </span>
                  <span className="text-white font-semibold">{redTeam.elderDragons}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <ObjectiveIcon type="tower" size="sm" />
                <span className="text-[#888]">Towers: </span>
                <span className="text-white font-semibold">{redTeam.towers}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[#1a1a1a]/30">
          {redTeam.players.map((p, i) => (
            <MiniPlayerRow key={i} player={p} gameDuration={gameDuration} />
          ))}
        </div>
      </div>
    </div>
  )
}

