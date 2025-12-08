'use client'

import Image from 'next/image'
import { Crown, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getChampionIconUrl, getChampionById } from '@/lib/riot/champions'
import { ObjectiveIcon } from './ObjectiveIcon'

interface Player {
  summonerName: string
  championName: string
  championId: number
  championIcon: string
  role: string
  kills: number
  deaths: number
  assists: number
  cs: number
  csPerMin: number
  visionScore: number
  visionPerMin: number
  items: (number | null)[] // Array of item IDs
  level: number
  goldEarned: number
  goldPerMin: number
  damageDealt: number
  kp: number // Kill participation %
  rank: string // MVP, ACE, 2nd, 3rd, etc.
  playerTier: string | null // Rank tier (DIAMOND, PLATINUM, etc.)
  playerRank: string | null // Rank division (I, II, III, IV)
  isWinner: boolean
}

interface Team {
  isBlueTeam: boolean
  isWinner: boolean
  players: Player[]
  totalKills: number
  totalAssists: number
  dragons: number
  barons: number
  elderDragons: number
  towers: number
}

interface MatchResultCompactProps {
  blueTeam: Team
  redTeam: Team
  gameDuration: string // "34:56"
  gameDate: string
}

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

function PlayerRow({ player, gameDuration }: { player: Player; gameDuration: string }) {
  const kda = player.deaths === 0 
    ? 'Perfect' 
    : ((player.kills + player.assists) / player.deaths).toFixed(1)
  
  const gameMinutes = parseInt(gameDuration.split(':')[0]) || 1
  const csPerMin = (player.cs / gameMinutes).toFixed(1)

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 hover:bg-[#1a1a1a]/50 transition-colors border-l-2",
      player.isWinner ? "border-l-[#c8ff00]" : "border-l-red-500"
    )}>
      {/* Champion Icon + Level */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#1a1a1a] bg-[#0a0a0a]">
          <Image
            src={player.championIcon}
            alt={player.championName}
            width={40}
            height={40}
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-[#c8ff00] border border-[#1a1a1a] rounded px-1 text-[10px] font-bold text-black">
          {player.level}
        </div>
      </div>
      
      {/* Summoner Name + Role */}
      <div className="min-w-[140px] max-w-[140px]">
        <div className="font-medium text-sm text-white truncate">
          {player.summonerName}
        </div>
        <div className="text-[10px] text-[#888] uppercase">
          {translateRole(player.role)}
        </div>
      </div>
      
      {/* KDA */}
      <div className="flex items-center gap-1 min-w-[80px]">
        <span className="text-sm">
          <span className="text-[#c8ff00]">{player.kills}</span>
          <span className="text-[#666]"> / </span>
          <span className="text-red-400">{player.deaths}</span>
          <span className="text-[#666]"> / </span>
          <span className="text-blue-400">{player.assists}</span>
        </span>
      </div>
      
      {/* KDA Ratio */}
      <div className="min-w-[50px] text-center">
        <span className={cn(
          "text-sm font-bold",
          kda === 'Perfect' ? "text-[#c8ff00]" : parseFloat(kda) >= 3 ? "text-green-500" : "text-white"
        )}>
          {kda}
        </span>
      </div>
      
      {/* Items - Ultra compact */}
      <div className="flex gap-0.5 min-w-[168px]">
        {player.items.slice(0, 7).map((itemId, idx) => (
          <div key={idx} className="w-6 h-6 rounded border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden shrink-0">
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
      
      {/* CS */}
      <div className="min-w-[60px] text-right">
        <div className="text-sm text-white">{player.cs}</div>
        <div className="text-[10px] text-[#888]">
          {csPerMin}/m
        </div>
      </div>
      
      {/* Vision Score */}
      <div className="min-w-[45px] text-center">
        <div className="text-sm text-yellow-400">{player.visionScore}</div>
        <Target className="h-3 w-3 mx-auto text-[#888]" />
      </div>
      
      {/* Damage */}
      <div className="min-w-[70px] text-right">
        <div className="text-sm text-white">{(player.damageDealt / 1000).toFixed(1)}k</div>
        <div className="text-[10px] text-[#888]">DMG</div>
      </div>
    </div>
  )
}

function TeamSection({ team, gameDuration }: { team: Team; gameDuration: string }) {
  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      team.isWinner ? "border-[#c8ff00]/50 bg-[#c8ff00]/5" : "border-red-500/50 bg-red-500/5"
    )}>
      {/* Team Header - Très compact */}
      <div className={cn(
        "px-3 py-1.5 flex items-center justify-between",
        team.isWinner ? "bg-[#c8ff00]/10" : "bg-red-500/10"
      )}>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-sm font-bold",
            team.isBlueTeam ? "text-blue-400" : "text-red-400"
          )}>
            {team.isBlueTeam ? "Blue Team" : "Red Team"}
          </span>
          {team.isWinner && (
            <Crown className="h-4 w-4 text-[#c8ff00]" />
          )}
          <span className="text-xs text-[#888]">
            {team.totalKills} Kills
          </span>
        </div>
        
        {/* Objectives - Ultra compact */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <ObjectiveIcon type="dragon" size="sm" />
            <span className="text-white">{team.dragons}</span>
          </div>
          <div className="flex items-center gap-1">
            <ObjectiveIcon type="baron" size="sm" />
            <span className="text-white">{team.barons}</span>
          </div>
          {team.elderDragons > 0 && (
            <div className="flex items-center gap-1">
              <ObjectiveIcon type="elder" size="sm" />
              <span className="text-white">{team.elderDragons}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ObjectiveIcon type="tower" size="sm" />
            <span className="text-white">{team.towers}</span>
          </div>
        </div>
      </div>
      
      {/* Players List - Très compact */}
      <div className="divide-y divide-[#1a1a1a]/50">
        {team.players.map((player, idx) => (
          <PlayerRow key={idx} player={player} gameDuration={gameDuration} />
        ))}
      </div>
    </div>
  )
}

export function MatchResultCompact({ 
  blueTeam, 
  redTeam, 
  gameDuration,
  gameDate 
}: MatchResultCompactProps) {
  return (
    <div className="w-full">
      {/* Match Info Header - Très compact */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#141414]/50 rounded-t-lg border border-[#1a1a1a] border-b-0">
        <div className="text-sm text-[#888]">
          {gameDate}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white">{gameDuration}</span>
          <span className="text-xs text-[#888]">Ranked Solo/Duo</span>
        </div>
      </div>
      
      {/* Teams - Stack vertical ultra compact */}
      <div className="space-y-2">
        <TeamSection team={blueTeam} gameDuration={gameDuration} />
        <TeamSection team={redTeam} gameDuration={gameDuration} />
      </div>
    </div>
  )
}

export type { Player, Team, MatchResultCompactProps }

