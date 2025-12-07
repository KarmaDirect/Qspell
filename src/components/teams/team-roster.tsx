'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Shield, Trash2, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  role: string
  profile: {
    id: string
    username: string
    riot_accounts: Array<{
      game_name: string
      tag_line: string
      region: string
      is_primary: boolean
    }>
    player_stats: Array<{
      queue_type: string
      tier: string
      rank: string
      league_points: number
    }>
  }
}

interface TeamRosterProps {
  members: Member[]
  teamId: string
  isCaptain: boolean
  captainId: string
}

export function TeamRoster({ members, teamId, isCaptain, captainId }: TeamRosterProps) {
  const router = useRouter()

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) {
      return
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      })

      if (response.ok) {
        toast.success('Membre retiré de l&apos;équipe')
        router.refresh()
      } else {
        const data = await response.json()
        toast.error('Erreur', { description: data.error })
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression du membre')
    }
  }

  const getSoloRank = (stats: Member['profile']['player_stats']) => {
    const soloStats = stats.find((s) => s.queue_type === 'RANKED_SOLO_5x5')
    if (!soloStats) return 'Unranked'
    return `${soloStats.tier} ${soloStats.rank}`
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Roster ({members.length}/5)</h2>
      </div>

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {member.profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{member.profile.username}</span>
                  {member.profile.id === captainId && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                
                {member.profile.riot_accounts?.[0] && (
                  <p className="text-sm text-muted-foreground">
                    {member.profile.riot_accounts[0].game_name}#{member.profile.riot_accounts[0].tag_line}
                  </p>
                )}
                
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {getSoloRank(member.profile.player_stats || [])}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </div>
            </div>

            {isCaptain && member.profile.id !== captainId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveMember(member.profile.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aucun membre dans l&apos;équipe
          </p>
        )}
      </div>
    </Card>
  )
}

