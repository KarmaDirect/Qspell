'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Trophy, Crown, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'

interface TeamEntry {
  rank: number
  team: {
    id: string
    name: string
    tag: string
    logo_url?: string
    region: string
    captain: {
      username: string
    }
  }
  wins: number
  losses: number
  total_games: number
  winrate: number
  tournaments_played: number
}

export function TeamLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<TeamEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard/teams?limit=100')
      const data = await response.json()
      
      if (response.ok) {
        setLeaderboard(data.leaderboard || [])
      }
    } catch (error) {
      console.error('Error fetching team leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-600" />
    return <span className="text-muted-foreground">#{rank}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Aucune équipe n&apos;a encore participé à des tournois
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((entry) => (
        <Link key={entry.team.id} href={`/dashboard/teams/${entry.team.id}`}>
          <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
            <div className="w-12 flex items-center justify-center font-bold">
              {getRankIcon(entry.rank)}
            </div>

            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {entry.team.tag}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{entry.team.name}</span>
                <Badge variant="outline" className="text-xs">
                  [{entry.team.tag}]
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {entry.team.region.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  <Shield className="h-3 w-3 inline mr-1" />
                  {entry.team.captain.username}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold">
                {entry.winrate}% WR
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.wins}W / {entry.losses}L
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {entry.tournaments_played} tournoi{entry.tournaments_played > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

